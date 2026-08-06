import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const read = (relative) => readFileSync(path.join(root, relative), "utf8");
const absent = (relative) => assert.equal(existsSync(path.join(root, relative)), false, `${relative} must be absent`);
const sourceFilesUnder = (relative) => {
  const start = path.join(root, relative);
  if (!existsSync(start)) return [];
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const current = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(current);
      else if (entry.name !== ".DS_Store") files.push(current);
    }
  };
  visit(start);
  return files;
};

for (const relative of [
  "docker-compose.staging.yml",
  "tests/run_staging_e2e.mjs",
  "tests/run_gate15_security.mjs",
  "scripts/database/import_staging_catalogue.js",
  "scripts/database/set_staging_passwords.js",
  "packages/db/prisma/migrations/phase3b_diff.sql",
]) absent(relative);

for (const relative of ["apps/web/src/lib/gsap", "packages/graphify-out"])
  assert.deepEqual(sourceFilesUnder(relative), [], `${relative} must contain no generated/runtime files`);
assert.match(read(".gitignore"), /\*\*\/dist\//);

for (const relative of [
  ".env.example",
  "apps/web/.env.local.example",
  "apps/admin/.env.local.example",
  "compose.yaml",
  "docs/production/repository-cleanup-report.md",
  "docs/production/environment-matrix.md",
  "docs/production/readiness-checklist.md",
  "docs/production/staging-retirement.md",
  "scripts/database/reconcile-production-readonly.mjs",
]) assert.ok(existsSync(path.join(root, relative)), `${relative} must exist`);

const hero = read("apps/web/src/components/home/HeroSection.tsx");
assert.match(hero, /from ["']gsap["']/);
assert.doesNotMatch(hero, /lib\/gsap/);

const prismaService = read("apps/api/src/prisma/prisma.service.ts");
assert.match(prismaService, /process\.env\.DATABASE_URL/);
assert.doesNotMatch(prismaService, /DIRECT_URL/);

const backendFiles = [
  "apps/api/src/auth/auth.service.ts",
  "apps/api/src/auth/better-auth.ts",
  "apps/api/src/staff/staff.service.ts",
];
for (const file of backendFiles) {
  const source = read(file);
  assert.doesNotMatch(source, /NEXT_PUBLIC_SUPABASE_URL/);
}

const disposable = read("tests/run_all_tests_disposable.mjs");
assert.doesNotMatch(disposable, /dotenv/);
assert.match(disposable, /TEST_DATABASE_URL/);
assert.match(disposable, /raza_test_db_/);
assert.match(disposable, /pqlmgqzpjjllhgalyhwz/);
assert.match(disposable, /test_run_sentinel/);

const migrations = readdirSync(path.join(root, "packages/db/prisma/migrations"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
assert.deepEqual(migrations, [
  "20260726162130_initial_schema_v0_1",
  "20260727021642_supabase_runtime_security",
  "20260727022832_supabase_function_default_privileges",
  "20260727150435_add_buying_price_type",
  "20260727190918_add_business_settings",
  "20260730103500_phase3b_catalogue_schema",
  "20260730105612_phase3b_catalogue_schema",
  "20260801090800_add_inventory_mode_and_demo_fields",
  "20260801120000_add_totp_fields",
  "20260801190000_add_supabase_auth_id",
  "20260802120000_phase7_post_deployment_refinement",
]);

for (const [file, expected] of [
  ["data/final/Raza-Stationers-Final-Supabase-Catalogue.csv", "8B76B52368FE60F815D55863CAF9847E3636202297C5D156479FDFF4EB4EB41F"],
  ["data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx", "7CB65D6D07B30C75A048431DAB4F855FD60B901515C07FE0F2253F8FACCAFA0B"],
]) {
  const actual = createHash("sha256").update(readFileSync(path.join(root, file))).digest("hex").toUpperCase();
  assert.equal(actual, expected, `${file} checksum changed`);
}

console.log("Phase 8 production-readiness static checks passed.");
