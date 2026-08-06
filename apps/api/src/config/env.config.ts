export function getTrustedOrigins(): string[] {
  const configuredOrigins = process.env.CORS_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins && configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  const origins: string[] = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:4000",
    "https://raza-stationers-web.vercel.app",
    "https://raza-stationers-admin-seven.vercel.app",
  ];

  if (process.env.WEB_URL?.trim()) origins.push(process.env.WEB_URL.trim());
  if (process.env.ADMIN_URL?.trim()) origins.push(process.env.ADMIN_URL.trim());

  return Array.from(new Set(origins));
}

export function validateEnvironment(): void {
  const isProd = process.env.NODE_ENV === "production";
  const authSecret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET;
  if (!authSecret) {
    throw new Error("BETTER_AUTH_SECRET (or JWT_SECRET) environment variable is required.");
  }
  if (isProd && !process.env.BETTER_AUTH_URL?.trim()) {
    throw new Error("BETTER_AUTH_URL environment variable is required in production.");
  }

  // Google OAuth partial configuration guard
  const hasGoogleId = Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
  const hasGoogleSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());
  if (hasGoogleId !== hasGoogleSecret) {
    throw new Error("Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required when configuring Google OAuth.");
  }
}
