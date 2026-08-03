import type { NextConfig } from "next";

function getApiOrigin(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured) return process.env.NODE_ENV === "development" ? "http://localhost:4000" : null;
  const parsed = new URL(configured);
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== configured.replace(/\/$/, "")) {
    throw new Error("NEXT_PUBLIC_API_URL must be an absolute API origin without a path.");
  }
  return parsed.origin;
}

const nextConfig: NextConfig = {
  transpilePackages: ["@raza-stationers/ui", "@raza-stationers/types", "@raza-stationers/api"],
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
  async rewrites() {
    const apiOrigin = getApiOrigin();
    if (!apiOrigin) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
