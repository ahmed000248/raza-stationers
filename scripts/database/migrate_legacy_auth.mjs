import "dotenv/config";
import pg from "pg";
import path from "node:path";
import { getDatabaseConfig } from "../admin/bootstrap-owner.mjs";

export async function migrateLegacyAuthCredentials({ db, dryRun = false, logger = console }) {
  logger.log(`=== RUNNING LEGACY AUTH CREDENTIAL MIGRATION (${dryRun ? "DRY RUN" : "EXECUTE"}) ===`);

  const usersRes = await db.query(
    "SELECT id, email, mobile_number, password_hash, created_at FROM public.users WHERE password_hash IS NOT NULL AND password_hash <> ''"
  );
  const users = usersRes.rows;
  logger.log(`Found ${users.length} legacy user records with password hashes.`);

  let alreadyMigrated = 0;
  let newlyMigrated = 0;

  for (const user of users) {
    const existingAccountRes = await db.query(
      "SELECT id FROM public.account WHERE user_id = $1 AND provider_id = 'credential'",
      [user.id]
    );
    if (existingAccountRes.rows.length > 0) {
      alreadyMigrated += 1;
      continue;
    }

    if (!dryRun) {
      const accountId = `account-${user.id}`;
      await db.query(
        `INSERT INTO public.account (id, user_id, account_id, provider_id, password, created_at, updated_at) 
         VALUES ($1, $2, $3, 'credential', $4, now(), now()) 
         ON CONFLICT (id) DO UPDATE SET password = $4, updated_at = now()`,
        [accountId, user.id, user.id, user.password_hash]
      );
    }
    newlyMigrated += 1;
  }

  const summary = {
    totalLegacyUsers: users.length,
    alreadyReconciled: alreadyMigrated,
    newlyMigrated: newlyMigrated,
    dryRun,
  };

  logger.log("=== MIGRATION RECONCILIATION SUMMARY ===");
  logger.log(JSON.stringify(summary, null, 2));
  return summary;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  const database = getDatabaseConfig(process.env.DATABASE_URL);
  const pool = new pg.Pool({ connectionString: database.connectionString, ssl: database.ssl, max: 1 });
  const dbClient = await pool.connect();

  try {
    const summary = await migrateLegacyAuthCredentials({ db: dbClient, dryRun, logger: console });
    process.exitCode = 0;
  } catch (err) {
    console.error("Migration failed:", err?.message || err);
    process.exitCode = 1;
  } finally {
    dbClient.release();
    await pool.end();
  }
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main();
}
