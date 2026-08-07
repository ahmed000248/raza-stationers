import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@raza-stationers/validation", "@raza-stationers/types", "@raza-stationers/ui"],
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
};

export default nextConfig;
