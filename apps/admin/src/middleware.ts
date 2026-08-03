import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Protected admin routes fail closed when no replacement authentication provider is configured
  return NextResponse.redirect(new URL("/login?reason=auth_unconfigured", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
