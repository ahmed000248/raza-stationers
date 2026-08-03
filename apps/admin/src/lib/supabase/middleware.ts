import { NextResponse, type NextRequest } from "next/server";

/** Deprecated: Supabase Auth session update removed. Provider-neutral middleware is used instead. */
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}
