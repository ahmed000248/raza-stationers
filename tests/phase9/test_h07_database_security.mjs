import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";

async function verifyH07DatabaseSecurity() {
  console.log("=== RUNNING H-07 BACKEND-ONLY DATABASE SECURITY & RLS VERIFICATION ===");

  const migrationContent = fs.readFileSync(
    path.resolve(process.cwd(), "packages/db/prisma/migrations/20260806160000_h07_database_security/migration.sql"),
    "utf8"
  );

  // 1. Verify revocation of privileges on Better Auth tables from PUBLIC, anon, authenticated
  assert.ok(
    migrationContent.includes('REVOKE ALL PRIVILEGES ON TABLE\n    public."account", public."session", public."two_factor", public."verification"\nFROM PUBLIC, anon, authenticated;'),
    "Better Auth tables must be revoked from PUBLIC, anon, and authenticated roles."
  );
  console.log("✔ Test 1 Passed: Better Auth tables revoked from untrusted browser roles.");

  // 2. Verify grant to raza_runtime
  assert.ok(
    migrationContent.includes('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE\n    public."account", public."session", public."two_factor", public."verification"\nTO raza_runtime;'),
    "Better Auth tables must be explicitly granted to raza_runtime."
  );
  console.log("✔ Test 2 Passed: Exclusive runtime grants configured for raza_runtime.");

  // 3. Verify RLS activation and policies
  assert.ok(migrationContent.includes('ALTER TABLE public."account" ENABLE ROW LEVEL SECURITY;'), "RLS must be enabled on account.");
  assert.ok(migrationContent.includes('ALTER TABLE public."session" ENABLE ROW LEVEL SECURITY;'), "RLS must be enabled on session.");
  assert.ok(migrationContent.includes('raza_runtime_full_access_account'), "RLS policy for raza_runtime on account must exist.");
  console.log("✔ Test 3 Passed: RLS enabled and full access policies defined for raza_runtime.");

  console.log("=== ALL H-07 DATABASE SECURITY CHECKS PASSED SUCCESSFULLY ===");
}

verifyH07DatabaseSecurity().catch((err) => {
  console.error("H-07 verification failed:", err);
  process.exit(1);
});
