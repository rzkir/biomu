import { NextRequest, NextResponse } from "next/server";

import { auth as adminAuth, db } from "@/lib/Admins";

import { FieldValue, type DocumentReference } from "firebase-admin/firestore";

const COLLECTION = process.env.NEXT_PUBLIC_COLLECTIONS_ACCOUNTS;

export async function POST(req: NextRequest) {
    try {
        if (!COLLECTION) {
            return NextResponse.json(
                { error: "Server misconfiguration: accounts collection not set" },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { email, otp } = body;

        if (!email || !otp) {
            console.error("Verify OTP: Missing email or OTP", { email: !!email, otp: !!otp });
            return NextResponse.json(
                { error: "Email and OTP are required" },
                { status: 400 }
            );
        }

        const emailLower = String(email).trim().toLowerCase();
        const otpTrimmed = String(otp).trim();

        if (!otpTrimmed || otpTrimmed.length !== 6) {
            console.error("Verify OTP: Invalid OTP format", { otpLength: otpTrimmed.length });
            return NextResponse.json(
                { error: "OTP harus 6 digit" },
                { status: 400 }
            );
        }

        const snapshot = await db
            .collection(COLLECTION)
            .where("email", "==", emailLower)
            .limit(1)
            .get();

        let storedToken: unknown = null;
        let expiry: { toMillis?: () => number } | Date | null = null;
        let userDocRef: DocumentReference | null = null;
        let usedSignupOtp = false;

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            userDocRef = doc.ref;
            const data = doc.data();

            // Prioritas: token reset password, jika tidak ada pakai token signup
            if (data?.resetToken) {
                storedToken = data.resetToken;
                expiry = data.resetTokenExpiry;
            } else if (data?.signupOtp) {
                storedToken = data.signupOtp;
                expiry = data.signupOtpExpiry;
                usedSignupOtp = true;
            }
        } else {
            console.error("Verify OTP: User not found", { email: emailLower });
            return NextResponse.json(
                { error: "Email tidak ditemukan atau OTP tidak valid" },
                { status: 400 }
            );
        }

        if (!storedToken) {
            console.error("Verify OTP: No OTP token found", { email: emailLower });
            return NextResponse.json(
                { error: "OTP tidak ditemukan. Silakan minta OTP baru" },
                { status: 400 }
            );
        }

        // Normalize storedToken to string (Firestore might store it as number)
        const storedTokenString = String(storedToken).trim();

        const expiryTime =
            (expiry && "toMillis" in expiry && typeof expiry.toMillis === "function"
                ? expiry.toMillis()
                : expiry instanceof Date
                    ? expiry.getTime()
                    : null);

        if (expiryTime == null || expiryTime < Date.now()) {
            console.error("Verify OTP: OTP expired", {
                expiryTime,
                now: Date.now(),
                email: emailLower
            });
            return NextResponse.json(
                { error: "OTP sudah kadaluarsa. Silakan minta OTP baru" },
                { status: 400 }
            );
        }

        // Compare as strings, ensuring both are normalized
        if (storedTokenString !== otpTrimmed) {
            console.error("Verify OTP: OTP mismatch", {
                email: emailLower
            });
            return NextResponse.json(
                { error: "OTP tidak valid. Silakan periksa kembali kode yang Anda masukkan" },
                { status: 400 }
            );
        }

        // OTP valid: bersihkan field OTP yang digunakan dan pastikan akun Firebase Auth tersedia
        let customToken: string | null = null;

        if (userDocRef) {
            const updates: Record<string, unknown> = {
                updatedAt: new Date(),
            };

            if (usedSignupOtp) {
                // Signup OTP: hapus field signupOtp dan set provider/status default
                updates.signupOtp = FieldValue.delete();
                updates.signupOtpExpiry = FieldValue.delete();
                updates.provider = "email";
                updates.status = "reguler";
                updates.role = "user";
            } else {
                // Reset password OTP: hapus field resetToken jika ada
                updates.resetToken = FieldValue.delete();
                updates.resetTokenExpiry = FieldValue.delete();
            }

            await userDocRef.update(updates);

            const uid = userDocRef.id;

            try {
                // Pastikan user sudah ada di Firebase Auth, jika belum buat baru
                await adminAuth.getUser(uid);
            } catch (error: unknown) {
                if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "auth/user-not-found") {
                    await adminAuth.createUser({
                        uid,
                        email: emailLower,
                        emailVerified: true,
                    });
                } else {
                    console.error("Verify OTP: Failed to prepare auth user", error);
                    return NextResponse.json(
                        { error: "Terjadi kesalahan saat menyiapkan akun. Silakan coba lagi." },
                        { status: 500 }
                    );
                }
            }

            // Buat custom token untuk login di client
            customToken = await adminAuth.createCustomToken(uid);
        }

        return NextResponse.json(
            customToken
                ? { message: "OTP is valid", token: customToken }
                : { message: "OTP is valid" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan saat memverifikasi OTP. Silakan coba lagi" },
            { status: 500 }
        );
    }
}