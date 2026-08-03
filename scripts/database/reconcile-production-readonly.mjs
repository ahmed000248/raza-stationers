import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const EXPECTED_PROJECT_REF = "pqlmgqzpjjllhgalyhwz";
const rawUrl = process.env.DATABASE_URL?.trim();
if (!rawUrl) throw new Error("DATABASE_URL is required for read-only production reconciliation.");

const url = new URL(rawUrl);
if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error("DATABASE_URL must be a complete PostgreSQL URL.");
const local = new Set(["localhost", "127.0.0.1", "::1"]).has(url.hostname.toLowerCase());
const projectRef = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i)?.[1]
  || decodeURIComponent(url.username).match(/^postgres\.([a-z0-9]+)$/i)?.[1]
  || null;
if (!local && projectRef !== EXPECTED_PROJECT_REF) {
  throw new Error("DATABASE_URL does not target the approved production project reference.");
}

const normalized = new URL(url);
normalized.searchParams.delete("sslmode");
normalized.searchParams.delete("sslrootcert");
let ssl = false;
if (!local) {
  const mode = (process.env.DATABASE_SSL_MODE || url.searchParams.get("sslmode") || "verify-full").toLowerCase();
  if (mode !== "verify-full") throw new Error("Remote reconciliation requires DATABASE_SSL_MODE=verify-full.");
  const certificatePath = process.env.PGSSLROOTCERT?.trim()
    ? path.resolve(process.env.PGSSLROOTCERT)
    : path.resolve("supabase-ca.crt");
  if (!existsSync(certificatePath)) throw new Error("Verified TLS certificate is missing.");
  ssl = { rejectUnauthorized: true, ca: readFileSync(certificatePath, "utf8") };
}

const pool = new pg.Pool({ connectionString: normalized.toString(), ssl, max: 1 });
const client = await pool.connect();
try {
  await client.query("BEGIN READ ONLY");
  const scalar = async (sql) => Number((await client.query(sql)).rows[0].count);
  const grouped = async (sql) => (await client.query(sql)).rows;
  const identity = (await client.query("SELECT current_database() AS database, current_schema() AS schema")).rows[0];
  const results = {
    target: {
      projectRef: projectRef || "local",
      hostname: url.hostname,
      port: url.port || "5432",
      database: identity.database,
      schema: identity.schema,
      sslMode: local ? "disable" : "verify-full",
    },
    migrations: await scalar("SELECT COUNT(*)::int AS count FROM public._prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL"),
    products: await grouped("SELECT status::text, COUNT(*)::int AS count FROM public.products GROUP BY status ORDER BY status"),
    sourceMappings: await scalar("SELECT COUNT(*)::int AS count FROM public.source_record_mappings"),
    categories: await scalar("SELECT COUNT(*)::int AS count FROM public.categories"),
    prices: await scalar("SELECT COUNT(*)::int AS count FROM public.product_prices"),
    packagingConfirmation: await grouped("SELECT confirmation_status::text, COUNT(*)::int AS count FROM public.product_packaging GROUP BY confirmation_status ORDER BY confirmation_status"),
    openingStock: await grouped("SELECT inventory_mode::text, COUNT(*)::int AS count FROM public.products GROUP BY inventory_mode ORDER BY inventory_mode"),
    importBatches: await grouped("SELECT status::text, COUNT(*)::int AS count FROM public.import_batches GROUP BY status ORDER BY status"),
    usersByRole: await grouped("SELECT role::text, COUNT(*)::int AS count FROM public.users GROUP BY role ORDER BY role"),
    demoOrTestAccounts: await scalar("SELECT COUNT(*)::int AS count FROM public.users WHERE lower(coalesce(name, '')) ~ '(demo|test)' OR lower(coalesce(email, '')) ~ '(demo|test)'"),
  };
  await client.query("COMMIT");
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  client.release();
  await pool.end();
}
