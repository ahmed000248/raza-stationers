import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@raza-stationers/validation", "@raza-stationers/ui", "@raza-stationers/types"],
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
};

export default nextConfig;
