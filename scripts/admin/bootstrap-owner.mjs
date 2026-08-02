import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const required = ["DATABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "RAZA_OWNER_EMAIL", "RAZA_OWNER_NAME", "RAZA_OWNER_MOBILE"];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);

function localMobile(value) {
  let digits = value.trim().replace(/[\s()+-]/g, "");
  if (digits.startsWith("0092")) digits = digits.slice(2);
  if (digits.startsWith("92")) digits = `0${digits.slice(2)}`;
  if (/^3\d{9}$/.test(digits)) digits = `0${digits}`;
  if (!/^03\d{9}$/.test(digits)) throw new Error("RAZA_OWNER_MOBILE must be a Pakistani mobile number in 03XXXXXXXXX format");
  return digits;
}

const email = process.env.RAZA_OWNER_EMAIL.trim().toLowerCase();
const name = process.env.RAZA_OWNER_NAME.trim();
const mobile = localMobile(process.env.RAZA_OWNER_MOBILE);
if (!email.includes("@") || name.length < 2) throw new Error("Owner email or name is invalid");

function getSslConfig(url) {
  if (!url || /localhost|127\.0\.0\.1/.test(url)) return false;
  if (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "false" || process.env.PGSSLMODE === "no-verify" || process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
    return { rejectUnauthorized: false };
  }
  if (process.env.PGSSLROOTCERT && existsSync(process.env.PGSSLROOTCERT)) {
    return { rejectUnauthorized: true, ca: readFileSync(process.env.PGSSLROOTCERT, "utf8") };
  }
  const certPath = path.resolve("supabase-ca.crt");
  if (existsSync(certPath)) {
    return { rejectUnauthorized: true, ca: readFileSync(certPath, "utf8") };
  }
  return { rejectUnauthorized: false };
}

const ssl = getSslConfig(process.env.DATABASE_URL);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl, max: 1 });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

async function findAuthUserByEmail(targetEmail) {
  for (let page = 1; page <= 100; page += 1) {
    const result = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (result.error) throw result.error;
    const match = result.data.users.find((user) => user.email?.toLowerCase() === targetEmail);
    if (match) return match;
    if (result.data.users.length < 100) return null;
  }
  throw new Error("Owner lookup exceeded the safe Supabase pagination limit");
}

let createdAuthUser = false;
let authUser;
const db = await pool.connect();
try {
  const owners = await db.query("SELECT id, email, mobile_number, supabase_auth_id FROM public.users WHERE role = 'owner'::public.user_role");
  if (owners.rowCount > 1) throw new Error("More than one owner already exists; stop and audit roles before using bootstrap");
  if (owners.rowCount === 1 && owners.rows[0].email?.toLowerCase() !== email) throw new Error("A different first owner already exists. Use the private AAL2 staff invitation workflow instead");

  authUser = await findAuthUserByEmail(email);
  if (!authUser) {
    const password = process.env.RAZA_OWNER_INITIAL_PASSWORD;
    if (!password || password.length < 12) throw new Error("RAZA_OWNER_INITIAL_PASSWORD (minimum 12 characters) is required only when creating the Supabase user");
    const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
    if (created.error || !created.data.user) throw created.error || new Error("Supabase owner creation returned no user");
    authUser = created.data.user;
    createdAuthUser = true;
  }

  await db.query("BEGIN");
  await db.query("SELECT pg_advisory_xact_lock(hashtext('raza:first-owner-bootstrap'))");
  const lockedOwners = await db.query("SELECT id, email, mobile_number, supabase_auth_id FROM public.users WHERE role = 'owner'::public.user_role FOR UPDATE");
  if (lockedOwners.rowCount > 1) throw new Error("More than one owner already exists; stop and audit roles before using bootstrap");
  if (lockedOwners.rowCount === 1 && lockedOwners.rows[0].email?.toLowerCase() !== email) throw new Error("A different first owner already exists. Use the private AAL2 staff invitation workflow instead");
  const matches = await db.query("SELECT id, role, email, mobile_number, supabase_auth_id FROM public.users WHERE email = $1 OR mobile_number IN ($2, $3) OR supabase_auth_id = $4 FOR UPDATE", [email, mobile, `+92${mobile.slice(1)}`, authUser.id]);
  if (matches.rowCount > 1) throw new Error("Owner identifiers resolve to multiple application users; no identities were merged");

  let userId;
  if (matches.rowCount === 1) {
    const existing = matches.rows[0];
    if (existing.role !== "owner") throw new Error("The requested identity already belongs to a non-owner application user; automatic privilege escalation is refused");
    if (existing.supabase_auth_id && existing.supabase_auth_id !== authUser.id) throw new Error("Existing owner is linked to a different Supabase identity");
    userId = existing.id;
    await db.query("UPDATE public.users SET supabase_auth_id = $1, email = $2, mobile_number = $3, name = $4, is_active = true, updated_at = now() WHERE id = $5", [authUser.id, email, mobile, name, userId]);
  } else {
    userId = authUser.id;
    await db.query("INSERT INTO public.users (id, mobile_number, email, name, role, is_active, supabase_auth_id, created_at, updated_at) VALUES ($1, $2, $3, $4, 'owner'::public.user_role, true, $5, now(), now())", [userId, mobile, email, name, authUser.id]);
  }

  const auditId = `owner-bootstrap-${authUser.id}`;
  await db.query("INSERT INTO public.audit_logs (id, actor_id, action, entity_type, entity_id, before_data, after_data, reason, created_at) VALUES ($1, $2, 'OWNER_BOOTSTRAPPED', 'User', $2, NULL, $3::jsonb, 'Trusted one-time production owner bootstrap', now()) ON CONFLICT (id) DO NOTHING", [auditId, userId, JSON.stringify({ email, mobileNumber: mobile, role: "owner", supabaseAuthId: authUser.id })]);
  await db.query("COMMIT");
  process.stdout.write(`First owner is linked and active (application user ${userId}). Re-running with the same identity is safe.\n`);
} catch (error) {
  await db.query("ROLLBACK").catch(() => {});
  if (createdAuthUser && authUser) await supabase.auth.admin.deleteUser(authUser.id).catch(() => {});
  throw error;
} finally {
  db.release();
  await pool.end();
  delete process.env.RAZA_OWNER_INITIAL_PASSWORD;
}
