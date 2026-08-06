import { execSync } from "node:child_process";

const phase9Tests = [
  "test_api_startup.mjs",
  "test_migration.mjs",
  "test_c03_same_origin.mjs",
  "test_c04_mfa.mjs",
  "test_c05_auth_migration.mjs",
  "test_c06_takeover_prevention.mjs",
  "test_c07_financial_protection.mjs",
  "test_c08_mobile_isolation.mjs",
  "test_h01_admin_protection.mjs",
  "test_h02_password_reset.mjs",
  "test_h03_signup_onboarding.mjs",
  "test_h04_catalogue_visibility.mjs",
  "test_h05_route_contracts.mjs",
  "test_h06_revocation.mjs",
  "test_h07_database_security.mjs",
  "test_h08_trusted_origins.mjs",
  "test_m01_unauthorized_state_clearing.mjs",
  "test_m03_fk_indexes.mjs",
  "test_m04_atomic_product_creation.mjs",
];

console.log("=== RUNNING ALL PHASE 9 REGRESSION TEST SUITES ===");

for (const testFile of phase9Tests) {
  console.log(`\n▶ Running tests/phase9/${testFile}...`);
  execSync(`node tests/phase9/${testFile}`, { stdio: "inherit" });
}

console.log("\n=== ALL PHASE 9 REGRESSION SUITES PASSED SUCCESSFULLY ===");
