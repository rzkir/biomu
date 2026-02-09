import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/Admins";

import { getEmailService } from "@/hooks/email-service";

import { generateOTP } from "@/hooks/genrate-otp";

const ACCOUNTS_COLLECTION = process.env.NEXT_PUBLIC_COLLECTIONS_ACCOUNTS as string;

export async function POST(req: NextRequest) {
    try {
        if (!ACCOUNTS_COLLECTION) {
            return NextResponse.json(
                { error: "Server misconfiguration: accounts collection not set" },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { email } = body as { email?: string };

        if (!email || typeof email !== "string" || !email.trim()) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const emailLower = email.trim().toLowerCase();

        // Cek apakah email sudah terdaftar sebagai akun aktif
        const existingAccountSnapshot = await db
            .collection(ACCOUNTS_COLLECTION)
            .where("email", "==", emailLower)
            .limit(1)
            .get();

        if (!existingAccountSnapshot.empty) {
            return NextResponse.json(
                { error: "Email sudah terdaftar. Silakan gunakan email lain atau login." },
                { status: 400 }
            );
        }

        // Generate OTP untuk signup
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Simpan OTP di koleksi akun utama (ACCOUNTS_COLLECTION)
        // dengan field khusus signupOtp & signupOtpExpiry
        const signupRequestsRef = db.collection(ACCOUNTS_COLLECTION);
        const existingRequestSnapshot = await signupRequestsRef
            .where("email", "==", emailLower)
            .limit(1)
            .get();

        if (existingRequestSnapshot.empty) {
            await signupRequestsRef.add({
                email: emailLower,
                signupOtp: otp,
                signupOtpExpiry: otpExpiry,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } else {
            await existingRequestSnapshot.docs[0].ref.update({
                signupOtp: otp,
                signupOtpExpiry: otpExpiry,
                updatedAt: new Date(),
            });
        }

        // Kirim email OTP
        const emailService = getEmailService();
        const subject = "Kode verifikasi pendaftaran akun";
        const text = `Kode verifikasi pendaftaran Anda adalah: ${otp}. Kode berlaku selama 10 menit.`;
        const html = `<p>Kode verifikasi pendaftaran Anda adalah: <strong>${otp}</strong></p><p>Kode berlaku selama 10 menit.</p>`;

        await emailService.sendEmail(emailLower, subject, html, text);

        return NextResponse.json({
            message: "Kode verifikasi pendaftaran berhasil dikirim",
        });
    } catch (error) {
        console.error("Signup OTP error:", error);
        return NextResponse.json(
            { error: "Gagal mengirim kode verifikasi pendaftaran" },
            { status: 500 }
        );
    }
}

