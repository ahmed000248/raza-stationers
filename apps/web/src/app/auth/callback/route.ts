import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const error = searchParams.get("error");
  const rawNext = searchParams.get("next");
  const next = rawNext?.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/signin") && !rawNext.startsWith("/signup") && !rawNext.startsWith("/register") && !rawNext.startsWith("/auth")
    ? rawNext
    : "/catalogue";

  if (error) {
    return NextResponse.redirect(`${origin}/signin?error=${encodeURIComponent(error)}&returnTo=${encodeURIComponent(next)}`);
  }

  const code = searchParams.get("code");
  if (code) {
    try {
      const backendUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
      const callbackTarget = `${backendUrl}/auth/api/callback/google${new URL(request.url).search}`;
      
      const backendRes = await fetch(callbackTarget, {
        headers: request.headers,
      });

      const res = NextResponse.redirect(`${origin}${next}`);
      const cookies = backendRes.headers.getSetCookie ? backendRes.headers.getSetCookie() : [];
      for (const cookie of cookies) {
        res.headers.append("set-cookie", cookie);
      }
      return res;
    } catch {
      return NextResponse.redirect(`${origin}/signin?error=auth_callback_failed&returnTo=${encodeURIComponent(next)}`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
