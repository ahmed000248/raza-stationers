import { NextResponse, type NextRequest } from "next/server";

// Middleware checks same-origin session cookies (reason=auth_unconfigured handled as fallback).
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes, static assets, and api/auth endpoints
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check for presence of BetterAuth session cookies on same-origin domain
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("session_token")?.value ||
    request.cookies.get("better_auth_session")?.value;

  if (!sessionToken && pathname !== "/login") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
