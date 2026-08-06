import { NextRequest, NextResponse } from "next/server";

const getBackendUrl = () => {
  const url = process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!url || url.includes("localhost") || url === "https://raza-stationers-api.onrender.com") {
    return "https://raza-stationers-api-staging.onrender.com";
  }
  return url.replace(/\/$/, "");
};

async function handler(req: NextRequest, { params }: { params: Promise<{ all: string[] }> }) {
  const resolvedParams = await params;
  const pathParts = resolvedParams.all || [];
  const subpath = pathParts.join("/");
  const backendBase = getBackendUrl();

  let targetUrl: string;
  const isDirectAuthEndpoint = ["login", "register", "register-supabase", "bootstrap-status", "session-profile", "link", "change-password"].includes(pathParts[0]);

  if (isDirectAuthEndpoint) {
    targetUrl = `${backendBase}/auth/${subpath}`;
  } else if (pathParts[0] === "api") {
    targetUrl = `${backendBase}/auth/${subpath}`;
  } else {
    targetUrl = `${backendBase}/auth/api/${subpath}`;
  }

  const url = new URL(req.url);
  if (url.search) {
    targetUrl += url.search;
  }

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host") {
      headers.set(key, value);
    }
  });

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    try {
      const body = await req.arrayBuffer();
      if (body.byteLength > 0) {
        fetchOptions.body = body;
      }
    } catch {}
  }

  try {
    const backendRes = await fetch(targetUrl, fetchOptions);
    const responseHeaders = new Headers();

    backendRes.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "set-cookie") {
        responseHeaders.set(key, value);
      }
    });

    const res = new NextResponse(backendRes.body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });

    const cookies = backendRes.headers.getSetCookie ? backendRes.headers.getSetCookie() : [];
    for (const cookie of cookies) {
      res.headers.append("set-cookie", cookie);
    }

    return res;
  } catch (error: any) {
    console.error("[Auth Proxy Error]", error);
    return NextResponse.json(
      { error: "Authentication service proxy failed", details: error?.message },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
