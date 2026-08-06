import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

async function verifySameOriginArchitecture() {
  console.log("=== RUNNING C-03 SAME-ORIGIN AUTH & BFF PROXY VERIFICATION ===");
  const root = process.cwd();

  // 1. Verify web backend proxy route exists
  const webProxyPath = path.join(root, "apps/web/src/app/api/backend/[...path]/route.ts");
  assert.ok(fs.existsSync(webProxyPath), "Web backend proxy route must exist at apps/web/src/app/api/backend/[...path]/route.ts");

  // 2. Verify admin backend proxy route exists
  const adminProxyPath = path.join(root, "apps/admin/src/app/api/backend/[...path]/route.ts");
  assert.ok(fs.existsSync(adminProxyPath), "Admin backend proxy route must exist at apps/admin/src/app/api/backend/[...path]/route.ts");

  // 3. Verify legacy manual callback routes are removed
  const webCallbackPath = path.join(root, "apps/web/src/app/auth/callback/route.ts");
  const adminCallbackPath = path.join(root, "apps/admin/src/app/auth/callback/route.ts");
  assert.ok(!fs.existsSync(webCallbackPath), "Legacy manual OAuth callback route in web must be removed.");
  assert.ok(!fs.existsSync(adminCallbackPath), "Legacy manual OAuth callback route in admin must be removed.");

  // 4. Verify public-config getApiBaseUrl handles window environment
  const webConfigContent = fs.readFileSync(path.join(root, "apps/web/src/lib/public-config.ts"), "utf8");
  assert.match(webConfigContent, /\/api\/backend/);

  const adminConfigContent = fs.readFileSync(path.join(root, "apps/admin/src/lib/public-config.ts"), "utf8");
  assert.match(adminConfigContent, /\/api\/backend/);

  console.log("✔ ALL C-03 SAME-ORIGIN ARCHITECTURE CHECKS PASSED SUCCESSFULLY!");
}

verifySameOriginArchitecture().catch((err) => {
  console.error("C-03 verification failed:", err);
  process.exit(1);
});
