export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/backend";
  }
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim() || process.env.API_URL?.trim();
  if (!configured) {
    return "https://raza-stationers-api-staging.onrender.com";
  }
  const parsed = new URL(configured);
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== configured.replace(/\/$/, "")) {
    throw new Error("NEXT_PUBLIC_API_URL must be an absolute API origin without a path.");
  }
  return parsed.origin;
}

