import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authPages = ["/signin", "/signup", "/verification"];
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

    if (hasSessionCookie && isAuthPage(pathname)) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
        const sessionUrl = apiBase
            ? `${apiBase.replace(/\/$/, "")}/api/auth/session`
            : `${request.nextUrl.origin}/api/auth/session`;
        try {
            const response = await fetch(sessionUrl, {
                method: "GET",
                headers: { Cookie: request.headers.get("cookie") || "" },
            });
            const data = await response.json();
            if (data.authenticated) {
                const role = data.user?.role;
                const targetPath = role === "admin" ? "/dashboard" : "/profile";
                return NextResponse.redirect(new URL(targetPath, request.url));
            }
            const res = NextResponse.next();
            res.cookies.delete("session");
            return res;
        } catch (error) {
            console.error("Error verifying session:", error);
            const res = NextResponse.redirect(new URL("/signin", request.url));
            res.cookies.delete("session");
            return res;
        }
    }

    if (!hasSessionCookie && isProtectedPath(pathname)) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
