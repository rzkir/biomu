import { NextRequest, NextResponse } from "next/server";

import { auth as adminAuth } from "@/lib/Admins";

const SESSION_COOKIE_NAME = "session";

export async function POST(request: NextRequest) {
    try {
        const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

        if (sessionCookie) {
            try {
                const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
                if (decoded && decoded.sub) {
                    await adminAuth.revokeRefreshTokens(decoded.sub);
                }
            } catch (error) {
                console.error("Logout: failed to verify/revoke session:", error);
            }
        }

        const response = NextResponse.json({ success: true });
        response.cookies.delete(SESSION_COOKIE_NAME);
        return response;
    } catch (error) {
        console.error("Logout error:", error);
        const response = NextResponse.json(
            { success: false, error: "Failed to logout" },
            { status: 500 }
        );
        response.cookies.delete(SESSION_COOKIE_NAME);
        return response;
    }
}

