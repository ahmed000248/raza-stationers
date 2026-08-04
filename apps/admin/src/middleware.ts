import { NextResponse, type NextRequest } from "next/server";

// Middleware cannot see cross-domain Better Auth session cookies (which belong to the API origin).
// Protected admin routes are enforced client-side by AdminShell/useAdminAuth via cross-origin fetch.
// Legacy fail-closed fallback reason=auth_unconfigured is handled by AdminShell.
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
