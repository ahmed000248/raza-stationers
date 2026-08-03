import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export interface PostgresConnectionInfo {
  hostname: string;
  port: string;
  database: string;
  schema: string;
  projectRef: string | null;
  mode: "local" | "direct" | "transaction-pooler" | "pooler-unspecified" | "remote";
  sslMode: "disable" | "verify-full";
}

function parsePostgresUrl(value: string, variableName: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variableName} must be a complete PostgreSQL URL.`);
  }
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error(`${variableName} must use the postgresql:// or postgres:// scheme.`);
  }
  if (!url.hostname || !url.pathname.slice(1)) {
    throw new Error(`${variableName} must include a hostname and database name.`);
  }
  return url;
}

function findCertificate(): string | null {
  const configured = process.env.PGSSLROOTCERT?.trim();
  if (configured) {
    const resolved = path.resolve(configured);
    if (!existsSync(resolved)) throw new Error("PGSSLROOTCERT does not reference an existing certificate.");
    return resolved;
  }
  let current = process.cwd();
  for (let depth = 0; depth < 6; depth += 1) {
    const candidate = path.join(current, "supabase-ca.crt");
    if (existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

function getProjectRef(url: URL): string | null {
  const direct = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i)?.[1];
  if (direct) return direct;
  const username = decodeURIComponent(url.username);
  return username.match(/^postgres\.([a-z0-9]+)$/i)?.[1] ?? null;
}

export function getPostgresConnection(
  value: string,
  variableName = "DATABASE_URL",
): { connectionString: string; ssl: false | { rejectUnauthorized: true; ca: string }; info: PostgresConnectionInfo } {
  const url = parsePostgresUrl(value, variableName);
  const local = LOCAL_HOSTS.has(url.hostname.toLowerCase());
  const configuredMode = (process.env.DATABASE_SSL_MODE || url.searchParams.get("sslmode") || "verify-full").toLowerCase();
  if (!local && configuredMode !== "verify-full") {
    throw new Error(`${variableName} must use certificate-verified TLS (DATABASE_SSL_MODE=verify-full).`);
  }

  const normalized = new URL(url);
  normalized.searchParams.delete("sslmode");
  normalized.searchParams.delete("sslrootcert");

  const pooler = /(^|\.)pooler\.supabase\.com$/i.test(url.hostname);
  const transactionIndicator = url.searchParams.get("pgbouncer")?.toLowerCase() === "true";
  const mode: PostgresConnectionInfo["mode"] = local
    ? "local"
    : /^db\.[a-z0-9]+\.supabase\.co$/i.test(url.hostname)
      ? "direct"
      : pooler && transactionIndicator
        ? "transaction-pooler"
        : pooler
          ? "pooler-unspecified"
          : "remote";

  const info: PostgresConnectionInfo = {
    hostname: url.hostname,
    port: url.port || "5432",
    database: decodeURIComponent(url.pathname.slice(1)),
    schema: url.searchParams.get("schema") || "public",
    projectRef: getProjectRef(url),
    mode,
    sslMode: local ? "disable" : "verify-full",
  };

  if (local) return { connectionString: normalized.toString(), ssl: false, info };

  const certificate = findCertificate();
  if (!certificate) {
    throw new Error(`${variableName} requires PGSSLROOTCERT or the repository supabase-ca.crt for verified TLS.`);
  }
  return {
    connectionString: normalized.toString(),
    ssl: { rejectUnauthorized: true, ca: readFileSync(certificate, "utf8") },
    info,
  };
}
