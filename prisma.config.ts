import "dotenv/config";
import { defineConfig } from "prisma/config";
import * as path from "path";
import * as fs from "fs";

function getSecureDirectUrl(): string | undefined {
  const rawUrl = process.env["DIRECT_URL"];
  if (!rawUrl) return undefined;
  
  let currentDir = process.cwd();
  let certPath = "";
  for (let i = 0; i < 5; i++) {
    const p = path.join(currentDir, "supabase-ca.crt");
    if (fs.existsSync(p)) {
      certPath = p;
      break;
    }
    const parent = path.dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
  }
  
  if (!certPath) {
    return rawUrl;
  }
  
  const separator = rawUrl.includes("?") ? "&" : "?";
  return `${rawUrl}${separator}sslmode=verify-full&sslrootcert=${encodeURIComponent(certPath)}`;
}

export default defineConfig({
  schema: "packages/db/prisma/schema.prisma",
  migrations: {
    path: "packages/db/prisma/migrations",
  },
  datasource: {
    url: getSecureDirectUrl(),
  },
});
