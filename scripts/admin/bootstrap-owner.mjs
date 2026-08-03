import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

export function normalizePakistaniMobile(value) {
  if (!value) return null;
  let digits = value.trim().replace(/[\s()+-]/g, "");
  if (digits.startsWith("0092")) digits = digits.slice(2);
  if (digits.startsWith("92")) digits = `0${digits.slice(2)}`;
  if (/^3\d{9}$/.test(digits)) digits = `0${digits}`;
  return /^03\d{9}$/.test(digits) ? digits : null;
}

export function validateAdminInput(env, options = {}) {
  const requirePassword = options.requirePassword ?? false;
  const email = env.RAZA_OWNER_EMAIL?.trim().toLowerCase();
  const name = env.RAZA_OWNER_NAME?.trim();
  const mobileRaw = env.RAZA_OWNER_MOBILE;
  const password = env.RAZA_OWNER_INITIAL_PASSWORD;

  if (!email || !email.includes("@")) {
    throw new Error("RAZA_OWNER_EMAIL must be a valid email address");
  }
  if (!name || name.length < 2) {
    throw new Error("RAZA_OWNER_NAME must be at least 2 characters long");
  }
  const mobile = normalizePakistaniMobile(mobileRaw);
  if (!mobile) {
    throw new Error("RAZA_OWNER_MOBILE must be a Pakistani mobile number in 03XXXXXXXXX format");
  }

  if (requirePassword) {
    if (!password || password.length < 12) {
      throw new Error("RAZA_OWNER_INITIAL_PASSWORD (minimum 12 characters) is required when creating a new Supabase user");
    }
  }

  return { email, name, mobile, password };
}

export function getDatabaseConfig(value) {
  if (!value) throw new Error("DATABASE_URL environment variable is required");
  const url = new URL(value);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("DATABASE_URL must be a complete PostgreSQL URL");
  }
  const local = new Set(["localhost", "127.0.0.1", "::1"]).has(url.hostname.toLowerCase());
  const normalized = new URL(url);
  normalized.searchParams.delete("sslmode");
  normalized.searchParams.delete("sslrootcert");
  if (local) return { connectionString: normalized.toString(), ssl: false };

  if ((process.env.DATABASE_SSL_MODE || url.searchParams.get("sslmode") || "verify-full").toLowerCase() !== "verify-full") {
    return { connectionString: normalized.toString(), ssl: { rejectUnauthorized: false } };
  }
  if (process.env.PGSSLROOTCERT && existsSync(process.env.PGSSLROOTCERT)) {
    return { connectionString: normalized.toString(), ssl: { rejectUnauthorized: true, ca: readFileSync(process.env.PGSSLROOTCERT, "utf8") } };
  }
  const certPath = path.resolve("supabase-ca.crt");
  if (existsSync(certPath)) {
    return { connectionString: normalized.toString(), ssl: { rejectUnauthorized: true, ca: readFileSync(certPath, "utf8") } };
  }
  return { connectionString: normalized.toString(), ssl: { rejectUnauthorized: false } };
}

export async function findAuthUserByEmail(supabase, targetEmail) {
  const email = targetEmail.trim().toLowerCase();
  for (let page = 1; page <= 100; page += 1) {
    const result = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (result.error) throw result.error;
    const match = result.data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match;
    if (result.data.users.length < 100) return null;
  }
  throw new Error("Owner lookup exceeded safe Supabase pagination limit");
}

async function promptQuestion(rl, text) {
  if (typeof rl.question === "function") {
    return await rl.question(text);
  }
  // Mock fallback for tests passing array or helper
  if (typeof rl.next === "function") {
    return rl.next();
  }
  throw new Error("Readline interface missing question method");
}

export async function runAdminBootstrap({ db, supabase, rl, env = process.env, logger = console }) {
  logger.log("================================");
  logger.log("     Admin Account Creation     ");
  logger.log("================================");
  logger.log("");

  // Inspect database for existing privileged admin/owner accounts
  const existingAdminsRes = await db.query(
    "SELECT id, name, email, mobile_number, role, is_active, supabase_auth_id, created_at FROM public.users WHERE role IN ('owner'::public.user_role, 'admin'::public.user_role) ORDER BY created_at ASC"
  );
  const existingAdmins = existingAdminsRes.rows;

  if (existingAdmins.length === 0) {
    // -------------------------------------------------------------
    // CASE 1: No admin exists
    // -------------------------------------------------------------
    const { email, name, mobile } = validateAdminInput(env, { requirePassword: false });

    logger.log("No existing admin account was found.\n");
    logger.log(`Email: ${email}`);
    logger.log(`Name: ${name}`);
    logger.log(`Mobile: ${mobile}\n`);

    let confirm = "";
    while (!["yes", "y", "no", "n"].includes(confirm)) {
      confirm = (await promptQuestion(rl, "Are you sure you want to create this admin account? (yes/no): ")).trim().toLowerCase();
    }

    if (["no", "n"].includes(confirm)) {
      logger.log("Admin account creation cancelled. No changes were made.");
      return { status: "cancelled", code: 0 };
    }

    // User confirmed 'yes' / 'y'
    let createdAuthUser = false;
    let authUser = await findAuthUserByEmail(supabase, email);

    if (!authUser) {
      const { password } = validateAdminInput(env, { requirePassword: true });
      const created = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });
      if (created.error || !created.data.user) {
        throw created.error || new Error("Supabase owner creation returned no user");
      }
      authUser = created.data.user;
      createdAuthUser = true;
    }

    try {
      await db.query("BEGIN");
      await db.query("SELECT pg_advisory_xact_lock(hashtext('raza:first-owner-bootstrap'))");

      const matches = await db.query(
        "SELECT id, role, email, mobile_number, supabase_auth_id FROM public.users WHERE email = $1 OR mobile_number IN ($2, $3) OR supabase_auth_id = $4 FOR UPDATE",
        [email, mobile, `+92${mobile.slice(1)}`, authUser.id]
      );

      let userId;
      if (matches.rowCount === 1) {
        const existing = matches.rows[0];
        userId = existing.id;
        await db.query(
          "UPDATE public.users SET supabase_auth_id = $1, email = $2, mobile_number = $3, name = $4, role = 'owner'::public.user_role, is_active = true, updated_at = now() WHERE id = $5",
          [authUser.id, email, mobile, name, userId]
        );
      } else {
        userId = authUser.id;
        await db.query(
          "INSERT INTO public.users (id, mobile_number, email, name, role, is_active, supabase_auth_id, created_at, updated_at) VALUES ($1, $2, $3, $4, 'owner'::public.user_role, true, $5, now(), now())",
          [userId, mobile, email, name, authUser.id]
        );
      }

      const auditId = `owner-bootstrap-${authUser.id}`;
      await db.query(
        "INSERT INTO public.audit_logs (id, actor_id, action, entity_type, entity_id, before_data, after_data, reason, created_at) VALUES ($1, $2, 'OWNER_BOOTSTRAPPED', 'User', $2, NULL, $3::jsonb, 'Trusted one-time production owner bootstrap', now()) ON CONFLICT (id) DO NOTHING",
        [auditId, userId, JSON.stringify({ email, mobileNumber: mobile, role: "owner", supabaseAuthId: authUser.id })]
      );
      await db.query("COMMIT");

      logger.log("Admin account created successfully.");
      return { status: "created", code: 0, userId };
    } catch (err) {
      await db.query("ROLLBACK").catch(() => {});
      if (createdAuthUser && authUser) {
        await supabase.auth.admin.deleteUser(authUser.id).catch(() => {});
      }
      throw err;
    }
  } else {
    // -------------------------------------------------------------
    // CASE 2: An admin already exists
    // -------------------------------------------------------------
    const primaryAdmin = existingAdmins[0];

    logger.log("An admin account already exists.\n");
    logger.log("Current admin:");
    logger.log(`Name: ${primaryAdmin.name || "N/A"}`);
    logger.log(`Email: ${primaryAdmin.email || "N/A"}`);
    logger.log(`Role: ${primaryAdmin.role}`);
    logger.log(`Status: ${primaryAdmin.is_active ? "Active" : "Inactive"}\n`);

    logger.log("What would you like to do?\n");
    logger.log("1. Add a second admin");
    logger.log("2. Replace the first admin");
    logger.log("3. Cancel and exit\n");

    let choice = "";
    while (!["1", "2", "3"].includes(choice)) {
      choice = (await promptQuestion(rl, "Select an option (1/2/3): ")).trim();
    }

    if (choice === "3") {
      logger.log("Admin account operation cancelled. No changes were made.");
      return { status: "cancelled", code: 0 };
    }

    if (choice === "1") {
      // -----------------------------------------------------------
      // OPTION 1: Add a second admin
      // -----------------------------------------------------------
      const { email, name, mobile } = validateAdminInput(env, { requirePassword: false });

      // Check if proposed email is already an existing admin
      const isExistingAdmin = existingAdmins.some((a) => a.email?.toLowerCase() === email);
      if (isExistingAdmin) {
        logger.log("The proposed email already belongs to an active admin account.");
        logger.log("No duplicate admin records were created.");
        return { status: "idempotent_existing_admin", code: 0 };
      }

      logger.log(`\nProposed new admin:`);
      logger.log(`Email: ${email}`);
      logger.log(`Name: ${name}`);
      logger.log(`Mobile: ${mobile}\n`);

      let confirm = "";
      while (!["yes", "y", "no", "n"].includes(confirm)) {
        confirm = (await promptQuestion(rl, "Are you sure you want to add this account as a second admin? (yes/no): ")).trim().toLowerCase();
      }

      if (["no", "n"].includes(confirm)) {
        logger.log("Admin account creation cancelled. No changes were made.");
        return { status: "cancelled", code: 0 };
      }

      let createdAuthUser = false;
      let authUser = await findAuthUserByEmail(supabase, email);

      if (!authUser) {
        const { password } = validateAdminInput(env, { requirePassword: true });
        const created = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name },
        });
        if (created.error || !created.data.user) {
          throw created.error || new Error("Supabase admin creation returned no user");
        }
        authUser = created.data.user;
        createdAuthUser = true;
      }

      try {
        await db.query("BEGIN");
        const matches = await db.query(
          "SELECT id, role, email, mobile_number, supabase_auth_id FROM public.users WHERE email = $1 OR mobile_number IN ($2, $3) OR supabase_auth_id = $4 FOR UPDATE",
          [email, mobile, `+92${mobile.slice(1)}`, authUser.id]
        );

        let userId;
        if (matches.rowCount === 1) {
          const existing = matches.rows[0];
          userId = existing.id;
          await db.query(
            "UPDATE public.users SET supabase_auth_id = $1, email = $2, mobile_number = $3, name = $4, role = 'admin'::public.user_role, is_active = true, updated_at = now() WHERE id = $5",
            [authUser.id, email, mobile, name, userId]
          );
        } else {
          userId = authUser.id;
          await db.query(
            "INSERT INTO public.users (id, mobile_number, email, name, role, is_active, supabase_auth_id, created_at, updated_at) VALUES ($1, $2, $3, $4, 'admin'::public.user_role, true, $5, now(), now())",
            [userId, mobile, email, name, authUser.id]
          );
        }

        const auditId = `admin-add-${authUser.id}`;
        await db.query(
          "INSERT INTO public.audit_logs (id, actor_id, action, entity_type, entity_id, before_data, after_data, reason, created_at) VALUES ($1, $2, 'ADMIN_CREATED', 'User', $2, NULL, $3::jsonb, 'Added second admin account via CLI', now()) ON CONFLICT (id) DO NOTHING",
          [auditId, userId, JSON.stringify({ email, mobileNumber: mobile, role: "admin", supabaseAuthId: authUser.id })]
        );
        await db.query("COMMIT");

        logger.log("Second admin account added successfully. Both admin accounts remain active.");
        return { status: "second_admin_added", code: 0, userId };
      } catch (err) {
        await db.query("ROLLBACK").catch(() => {});
        if (createdAuthUser && authUser) {
          await supabase.auth.admin.deleteUser(authUser.id).catch(() => {});
        }
        throw err;
      }
    }

    if (choice === "2") {
      // -----------------------------------------------------------
      // OPTION 2: Replace the first admin
      // -----------------------------------------------------------
      const { email, name, mobile } = validateAdminInput(env, { requirePassword: false });

      if (email === primaryAdmin.email?.toLowerCase()) {
        logger.log("New admin email matches the current admin email. Replacement rejected.");
        return { status: "rejected_same_email", code: 1 };
      }

      logger.log("WARNING: You are about to replace the current primary admin.\n");
      logger.log("Current admin:");
      logger.log(`Name: ${primaryAdmin.name || "N/A"}`);
      logger.log(`Email: ${primaryAdmin.email || "N/A"}\n`);
      logger.log("New admin:");
      logger.log(`Name: ${name}`);
      logger.log(`Email: ${email}`);
      logger.log(`Mobile: ${mobile}\n`);

      const answer = (await promptQuestion(rl, "Type REPLACE to confirm, or type CANCEL to exit: ")).trim();
      if (answer !== "REPLACE") {
        logger.log("Admin account replacement cancelled. No changes were made.");
        return { status: "cancelled", code: 0 };
      }

      let createdAuthUser = false;
      let authUser = await findAuthUserByEmail(supabase, email);

      if (!authUser) {
        const { password } = validateAdminInput(env, { requirePassword: true });
        const created = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name },
        });
        if (created.error || !created.data.user) {
          throw created.error || new Error("Supabase admin creation returned no user");
        }
        authUser = created.data.user;
        createdAuthUser = true;
      }

      try {
        await db.query("BEGIN");
        await db.query("SELECT pg_advisory_xact_lock(hashtext('raza:admin-replace'))");

        const matches = await db.query(
          "SELECT id, role, email, mobile_number, supabase_auth_id FROM public.users WHERE email = $1 OR mobile_number IN ($2, $3) OR supabase_auth_id = $4 FOR UPDATE",
          [email, mobile, `+92${mobile.slice(1)}`, authUser.id]
        );

        let newUserId;
        if (matches.rowCount === 1) {
          const existing = matches.rows[0];
          newUserId = existing.id;
          await db.query(
            "UPDATE public.users SET supabase_auth_id = $1, email = $2, mobile_number = $3, name = $4, role = 'owner'::public.user_role, is_active = true, updated_at = now() WHERE id = $5",
            [authUser.id, email, mobile, name, newUserId]
          );
        } else {
          newUserId = authUser.id;
          await db.query(
            "INSERT INTO public.users (id, mobile_number, email, name, role, is_active, supabase_auth_id, created_at, updated_at) VALUES ($1, $2, $3, $4, 'owner'::public.user_role, true, $5, now(), now())",
            [newUserId, mobile, email, name, authUser.id]
          );
        }

        // Only after new admin is created and verified, demote old admin
        if (primaryAdmin.id !== newUserId) {
          await db.query(
            "UPDATE public.users SET role = 'staff'::public.user_role, updated_at = now() WHERE id = $1",
            [primaryAdmin.id]
          );
        }

        const auditId = `admin-replace-${authUser.id}`;
        await db.query(
          "INSERT INTO public.audit_logs (id, actor_id, action, entity_type, entity_id, before_data, after_data, reason, created_at) VALUES ($1, $2, 'ADMIN_REPLACED', 'User', $2, $3::jsonb, $4::jsonb, 'Replaced primary admin via CLI', now()) ON CONFLICT (id) DO NOTHING",
          [
            auditId,
            newUserId,
            JSON.stringify({ replacedAdminId: primaryAdmin.id, oldRole: primaryAdmin.role }),
            JSON.stringify({ newAdminId: newUserId, email, role: "owner", supabaseAuthId: authUser.id }),
          ]
        );

        await db.query("COMMIT");

        logger.log("Primary admin replaced successfully.");
        logger.log(`New Active Admin: ${name} (${email})`);
        logger.log(`Old Admin (${primaryAdmin.email}) status: Demoted to staff role (historical records preserved).\n`);
        return { status: "replaced", code: 0, newUserId, oldUserId: primaryAdmin.id };
      } catch (err) {
        await db.query("ROLLBACK").catch(() => {});
        if (createdAuthUser && authUser) {
          await supabase.auth.admin.deleteUser(authUser.id).catch(() => {});
        }
        throw err;
      }
    }
  }
}

// Direct Execution Entrypoint
async function main() {
  const required = ["DATABASE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "RAZA_OWNER_EMAIL", "RAZA_OWNER_NAME", "RAZA_OWNER_MOBILE"];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  const database = getDatabaseConfig(process.env.DATABASE_URL);
  const pool = new pg.Pool({ connectionString: database.connectionString, ssl: database.ssl, max: 1 });
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const rl = readline.createInterface({ input, output });
  let dbClient;

  try {
    dbClient = await pool.connect();
    const result = await runAdminBootstrap({ db: dbClient, supabase, rl, env: process.env, logger: console });
    process.exitCode = result?.code ?? 0;
  } catch (err) {
    console.error("Admin bootstrap operation failed:", err.message || err);
    process.exitCode = 1;
  } finally {
    rl.close();
    if (dbClient) dbClient.release();
    await pool.end();
    delete process.env.RAZA_OWNER_INITIAL_PASSWORD;
  }
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main();
}
