export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured) {
    if (process.env.NODE_ENV === "development") return "http://localhost:4000";
    throw new Error("NEXT_PUBLIC_API_URL is required outside local development.");
  }
  const parsed = new URL(configured);
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== configured.replace(/\/$/, "")) {
    throw new Error("NEXT_PUBLIC_API_URL must be an absolute API origin without a path.");
  }
  return parsed.origin;
}
