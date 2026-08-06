export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api";
  }

  const configured =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.API_URL?.trim();

  if (!configured) {
    // Fail loudly rather than silently falling back to staging -- a
    // missing NEXT_PUBLIC_API_URL/API_URL should be caught at build/boot
    // time, not masked by quietly pointing server-rendered requests at a
    // different backend than what the client-side code will use.
    throw new Error(
      "NEXT_PUBLIC_API_URL (or API_URL) is not set for server-side rendering. " +
      "Set it to the real backend origin for this environment."
    );
  }

  const parsed = new URL(configured);

  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.origin !== configured.replace(/\/$/, "")
  ) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be an absolute API origin without a path.",
    );
  }

  return parsed.origin;
}
