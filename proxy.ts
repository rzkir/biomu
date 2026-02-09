import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

/** Halaman auth: jika sudah login + punya cookie, tidak boleh akses → redirect ke profile/dashboard */
const authPages = ["/signin", "/signup", "/verification"];

/** Halaman protected: jika belum login, tidak boleh akses → redirect ke signin */
const protectedPaths = ["/profile", "/dashboard"];

function isAuthPage(pathname: string): boolean {
    return authPages.includes(pathname) || authPages.some((p) => pathname.startsWith(`${p}/`));
}

function isProtectedPath(pathname: string): boolean {
    return protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hasSessionCookie = request.cookies.has("session");

    // Sudah login + punya cookie → tidak boleh ke halaman auth (signin, signup, verification)
    if (hasSessionCookie && isAuthPage(pathname)) {
        try {
            const response = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
                headers: {
                    Cookie: request.headers.get("cookie") || "",
                },
            });

            const data = await response.json();

            if (data.authenticated) {
                const role = data.user?.role;
                const targetPath = role === "admin" ? "/dashboard" : "/profile";
                return NextResponse.redirect(new URL(targetPath, request.url));
            }
            // Cookie ada tapi session tidak valid → hapus cookie, biarkan tetap di halaman auth
            const res = NextResponse.next();
            res.cookies.delete("session");
            return res;
        } catch (error) {
            console.error("Error verifying session:", error);
            const response = NextResponse.redirect(new URL("/signin", request.url));
            response.cookies.delete("session");
            return response;
        }
    }

    // Belum login → tidak boleh ke halaman protected (/profile, /dashboard)
    if (!hasSessionCookie && isProtectedPath(pathname)) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};