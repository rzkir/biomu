import { NextRequest, NextResponse } from "next/server";

import { auth, db } from "@/lib/Admins";

import { getEmailService } from "@/hooks/email-service";

import { generateOTP } from "@/hooks/genrate-otp";

export const runtime = "nodejs";

const COLLECTION = process.env.NEXT_PUBLIC_COLLECTIONS_ACCOUNTS;

function getExpiryTime(expiry: unknown): number | null {
    if (expiry == null) return null;
    if (typeof (expiry as { toMillis?: () => number }).toMillis === "function") {
        return (expiry as { toMillis: () => number }).toMillis();
    }
    if (expiry instanceof Date) return expiry.getTime();
    return null;
}

export async function PUT(request: Request) {
    try {
        if (!COLLECTION) {
            return NextResponse.json(
                { error: "Server misconfiguration" },
                { status: 500 }
            );
        }

        const { token } = await request.json();

        if (!token || typeof token !== "string") {
            return NextResponse.json(
                { error: "Token is required" },
                { status: 400 }
            );
        }

        const snapshot = await db
            .collection(COLLECTION)
            .where("verificationToken", "==", token)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return NextResponse.json(
                { error: "Invalid or expired verification token" },
                { status: 400 }
            );
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        const expiryTime = getExpiryTime(data?.verificationTokenExpiry);

        if (expiryTime == null || expiryTime < Date.now()) {
            return NextResponse.json(
                { error: "Invalid or expired verification token" },
                { status: 400 }
            );
        }

        await doc.ref.update({
            isVerified: true,
            verificationToken: null,
            verificationTokenExpiry: null,
        });

        return NextResponse.json({
            message: "Email verification successful",
        });
    } catch (error: unknown) {
        console.error("Email verification error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!COLLECTION) {
            return NextResponse.json(
                { error: "Server misconfiguration" },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { token, newPassword, email } = body;

        // Validate OTP and optionally reset password
        if (token && typeof token === "string") {
            const snapshot = await db
                .collection(COLLECTION)
                .where("resetToken", "==", token.trim())
                .limit(1)
                .get();

            if (snapshot.empty) {
                return NextResponse.json(
                    { error: "Invalid or expired OTP" },
                    { status: 400 }
                );
            }

            const doc = snapshot.docs[0];
            const data = doc.data();
            const expiryTime = getExpiryTime(data?.resetTokenExpiry);

            if (expiryTime == null || expiryTime < Date.now()) {
                return NextResponse.json(
                    { error: "Invalid or expired OTP" },
                    { status: 400 }
                );
            }

            if (!newPassword) {
                return NextResponse.json({ message: "OTP is valid" });
            }

            const uid = doc.id;
            await auth.updateUser(uid, { password: newPassword });
            await doc.ref.update({
                resetToken: null,
                resetTokenExpiry: null,
            });

            return NextResponse.json({ message: "Password reset successful" });
        }

        // Resend verification / reset code by email
        if (email && typeof email === "string") {
            const emailLower = String(email).trim().toLowerCase();
            const snapshot = await db
                .collection(COLLECTION)
                .where("email", "==", emailLower)
                .limit(1)
                .get();

            if (snapshot.empty) {
                return NextResponse.json(
                    { error: "Account not found" },
                    { status: 404 }
                );
            }

            const otp = generateOTP();
            const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

            await snapshot.docs[0].ref.update({
                resetToken: otp,
                resetTokenExpiry,
            });

            const emailService = getEmailService();
            await emailService.sendPasswordResetEmail(emailLower, otp);

            return NextResponse.json({
                message: "Password reset code resent successfully",
            });
        }

        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    } catch (error: unknown) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}