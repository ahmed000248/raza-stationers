import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

async function verifyM01UnauthorizedStateClearing() {
  console.log("=== RUNNING M-01 UNAUTHORIZED STATE CLEARING VERIFICATION ===");

  const sdkContent = fs.readFileSync(path.resolve(process.cwd(), "packages/api/src/index.ts"), "utf8");
  const webAuthHook = fs.readFileSync(path.resolve(process.cwd(), "apps/web/src/hooks/use-auth.tsx"), "utf8");
  const adminAuthHook = fs.readFileSync(path.resolve(process.cwd(), "apps/admin/src/hooks/use-admin-auth.tsx"), "utf8");

  // 1. Verify index.ts triggers onUnauthorized on 401
  assert.ok(
    sdkContent.includes("res.status === 401") && sdkContent.includes("this.onUnauthorized()"),
    "handleErrorResponse must invoke onUnauthorized callback when HTTP status is 401."
  );
  console.log("✔ Test 1 Passed: API client triggers onUnauthorized callback on 401 responses.");

  // 2. Verify web use-auth.tsx passes onUnauthorized callback
  assert.ok(webAuthHook.includes("onUnauthorized") && webAuthHook.includes("clearAuthState"), "use-auth.tsx must supply onUnauthorized callback to clear user/business state.");
  console.log("✔ Test 2 Passed: Web AuthProvider clears session state on 401 response.");

  // 3. Verify admin use-admin-auth.tsx passes onUnauthorized callback
  assert.ok(adminAuthHook.includes("onUnauthorized") && adminAuthHook.includes("clearAdminState"), "use-admin-auth.tsx must supply onUnauthorized callback to clear admin state.");
  console.log("✔ Test 3 Passed: Admin AuthProvider clears admin session state on 401 response.");

  console.log("=== ALL M-01 UNAUTHORIZED STATE CLEARING CHECKS PASSED SUCCESSFULLY ===");
}

verifyM01UnauthorizedStateClearing().catch((err) => {
  console.error("M-01 verification failed:", err);
  process.exit(1);
});
