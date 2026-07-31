import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@raza-stationers/ui", "@raza-stationers/types", "@raza-stationers/api"],
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/:path*",
      },
    ];
  },
};

export default nextConfig;
