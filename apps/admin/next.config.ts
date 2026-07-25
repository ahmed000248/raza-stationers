import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@raza-stationers/ui", "@raza-stationers/types", "@raza-stationers/api"],
};

export default nextConfig;
