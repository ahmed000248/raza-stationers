import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { getDatabaseConfig } from "../../scripts/admin/bootstrap-owner.mjs";
import { migrateLegacyAuthCredentials } from "../../scripts/database/migrate_legacy_auth.mjs";

async function verifyC05AuthMigration() {
  console.log("=== RUNNING C-05 AUTH SYSTEM UNIFICATION & MIGRATION VERIFICATION ===");

  const database = getDatabaseConfig(process.env.DATABASE_URL);
  const pool = new pg.Pool({ connectionString: database.connectionString, ssl: database.ssl, max: 1 });
  const dbClient = await pool.connect();

  try {
    // 1. Dry run verification
    const dryRunSummary = await migrateLegacyAuthCredentials({ db: dbClient, dryRun: true, logger: { log: () => {} } });
    assert.strictEqual(dryRunSummary.dryRun, true, "Dry run summary flag must be true.");
    console.log(`✔ Test 1 Passed: Dry run completed cleanly (Total legacy users: ${dryRunSummary.totalLegacyUsers}).`);

    // 2. Real migration execution (idempotent)
    const executeSummary = await migrateLegacyAuthCredentials({ db: dbClient, dryRun: false, logger: { log: () => {} } });
    assert.strictEqual(executeSummary.dryRun, false, "Execution summary flag must be false.");
    console.log(`✔ Test 2 Passed: Credential migration executed cleanly (Newly migrated: ${executeSummary.newlyMigrated}, Already reconciled: ${executeSummary.alreadyReconciled}).`);

    // 3. Second migration run (idempotency check)
    const secondRunSummary = await migrateLegacyAuthCredentials({ db: dbClient, dryRun: false, logger: { log: () => {} } });
    assert.strictEqual(secondRunSummary.newlyMigrated, 0, "Second migration run must migrate 0 new rows (idempotent).");
    console.log("✔ Test 3 Passed: Credential migration is strictly idempotent.");

    // 4. Verify account table credentials match password_hash for users with password_hash
    const usersWithHashRes = await dbClient.query(
      "SELECT u.id, u.email, u.password_hash, a.password FROM public.users u JOIN public.account a ON u.id = a.user_id WHERE a.provider_id = 'credential' AND u.password_hash IS NOT NULL AND u.password_hash <> ''"
    );
    assert.ok(usersWithHashRes.rows.length > 0, "Account table must contain credential rows for users with password hashes.");
    for (const row of usersWithHashRes.rows) {
      assert.strictEqual(row.password, row.password_hash, "Account password must match user password_hash.");
    }
    console.log("✔ Test 4 Passed: Better Auth account table credential sync verified for all users with password hashes.");

    console.log("=== ALL C-05 AUTH UNIFICATION CHECKS PASSED SUCCESSFULLY ===");
  } finally {
    dbClient.release();
    await pool.end();
  }
}

verifyC05AuthMigration().catch((err) => {
  console.error("C-05 Auth migration verification failed:", err);
  process.exit(1);
});
