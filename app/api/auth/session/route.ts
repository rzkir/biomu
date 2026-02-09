import { NextRequest, NextResponse } from "next/server";

import { auth as adminAuth, db } from "@/lib/Admins";

export const dynamic = "force-static";
export const revalidate = 0;

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const ACCOUNTS_COLLECTION = process.env.NEXT_PUBLIC_COLLECTIONS_ACCOUNTS as string | undefined;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const idToken = body?.idToken as string | undefined;

        if (!idToken || typeof idToken !== "string") {
            return NextResponse.json(
                { error: "idToken is required" },
                { status: 400 }
            );
        }

        // Verify ID token from client
        await adminAuth.verifyIdToken(idToken);

        const expiresIn = SESSION_DURATION_MS;
        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn,
        });

        const response = NextResponse.json({ authenticated: true });

        response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: Math.floor(expiresIn / 1000),
        });

        return response;
    } catch (error) {
        console.error("Error creating session cookie:", error);
        return NextResponse.json(
            { error: "Failed to create session" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

        if (!sessionCookie) {
            return NextResponse.json({ authenticated: false });
        }

        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

        let role: string | null = null;

        if (ACCOUNTS_COLLECTION) {
            try {
                const docRef = db.collection(ACCOUNTS_COLLECTION).doc(decoded.uid);
                const docSnap = await docRef.get();
                const data = docSnap.data() as { role?: string } | undefined;
                role = data?.role ?? null;
            } catch (error) {
                console.error("Failed to load user role from Firestore:", error);
            }
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                uid: decoded.uid,
                email: decoded.email,
                role,
            },
        });
    } catch (error) {
        console.error("Session verification error:", error);
        const response = NextResponse.json(
            { authenticated: false },
            { status: 401 }
        );
        response.cookies.delete(SESSION_COOKIE_NAME);
        return response;
    }
}

