import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Only protect /admin routes ────────────────────
  if (pathname.startsWith("/admin")) {
    // Allow access to admin login page itself
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check for admin session cookie
    const session = req.cookies.get("admin_session");

    if (session?.value !== "authenticated") {
      // Redirect to admin login
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};