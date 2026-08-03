import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

const rawUrl = process.env.DIRECT_URL?.trim();
if (!rawUrl) {
  throw new Error("DIRECT_URL is required for Prisma CLI migration operations.");
}

let migrationUrl: URL;
try {
  migrationUrl = new URL(rawUrl);
} catch {
  throw new Error("DIRECT_URL must be a complete PostgreSQL URL.");
}
if (!["postgres:", "postgresql:"].includes(migrationUrl.protocol)) {
  throw new Error("DIRECT_URL must use the postgresql:// or postgres:// scheme.");
}

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
if (localHosts.has(migrationUrl.hostname.toLowerCase())) {
  migrationUrl.searchParams.set("sslmode", "disable");
  migrationUrl.searchParams.delete("sslrootcert");
} else {
  const configuredCertificate = process.env.PGSSLROOTCERT?.trim();
  const certificatePath = configuredCertificate
    ? path.resolve(configuredCertificate)
    : path.resolve("supabase-ca.crt");
  if (!existsSync(certificatePath)) {
    throw new Error("DIRECT_URL requires PGSSLROOTCERT or the repository supabase-ca.crt.");
  }
  migrationUrl.searchParams.set("sslmode", "verify-full");
  migrationUrl.searchParams.set("sslrootcert", certificatePath);
}

export default defineConfig({
  schema: "packages/db/prisma/schema.prisma",
  migrations: {
    path: "packages/db/prisma/migrations",
  },
  datasource: {
    url: migrationUrl.toString(),
  },
});
