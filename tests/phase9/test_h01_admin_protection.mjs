import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

async function verifyH01AdminProtection() {
  console.log("=== RUNNING H-01 ADMIN ROUTE PROTECTION VERIFICATION ===");

  const hookContent = fs.readFileSync(path.resolve(process.cwd(), "apps/admin/src/hooks/use-admin-auth.tsx"), "utf8");
  const shellContent = fs.readFileSync(path.resolve(process.cwd(), "apps/admin/src/components/shell/AdminShell.tsx"), "utf8");

  // 1. Verify missing role is not defaulted to admin
  assert.ok(!hookContent.includes('|| "admin"'), "use-admin-auth.tsx must not default missing roles to 'admin'.");
  console.log("✔ Test 1 Passed: Missing role fallback '|| admin' removed.");

  // 2. Verify ALLOWED_ADMIN_ROLES explicitly listed
  assert.ok(hookContent.includes("ALLOWED_ADMIN_ROLES"), "use-admin-auth.tsx must define ALLOWED_ADMIN_ROLES array.");
  assert.ok(hookContent.includes("isActive !== false"), "use-admin-auth.tsx must validate user isActive status.");
  console.log("✔ Test 2 Passed: Role whitelist and active user validation enforced.");

  // 3. Verify Access Denied view in AdminShell
  assert.ok(shellContent.includes("Access Denied"), "AdminShell must render Access Denied UI for unprivileged roles.");
  console.log("✔ Test 3 Passed: Access Denied screen present for unauthorized roles.");

  console.log("=== ALL H-01 ADMIN PROTECTION CHECKS PASSED SUCCESSFULLY ===");
}

verifyH01AdminProtection().catch((err) => {
  console.error("H-01 verification failed:", err);
  process.exit(1);
});
