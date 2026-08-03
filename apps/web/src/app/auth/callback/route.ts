import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const rawNext = searchParams.get("next");
  const next = rawNext?.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/signin") && !rawNext.startsWith("/signup") && !rawNext.startsWith("/register") && !rawNext.startsWith("/auth")
    ? rawNext
    : "/catalogue";

  return NextResponse.redirect(`${origin}/signin?error=auth_provider_not_configured&returnTo=${encodeURIComponent(next)}`);
}
