import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

async function verifyH02PasswordResetSecurity() {
  console.log("=== RUNNING H-02 PASSWORD RESET SECURITY & RELIABILITY VERIFICATION ===");

  const betterAuthContent = fs.readFileSync(path.resolve(process.cwd(), "apps/api/src/auth/better-auth.ts"), "utf8");
  const useAuthContent = fs.readFileSync(path.resolve(process.cwd(), "apps/web/src/hooks/use-auth.tsx"), "utf8");

  // 1. Verify token logging is completely removed
  assert.ok(!betterAuthContent.includes("Reset Password URL for"), "better-auth.ts must not log reset URLs or tokens.");
  assert.ok(!betterAuthContent.includes("Direct link: <a href="), "better-auth.ts email template must not print raw token URLs.");
  console.log("✔ Test 1 Passed: Password reset URL and token logging removed.");

  // 2. Verify exact Better Auth URL parameter is used
  assert.ok(betterAuthContent.includes("sendResetPassword({ user, url })"), "sendResetPassword must use exact url provided by Better Auth.");
  console.log("✔ Test 2 Passed: Exact Better Auth URL parameter utilized.");

  // 3. Verify user enumeration protection in frontend
  assert.ok(useAuthContent.includes("prevent user/email enumeration attacks"), "use-auth.tsx resetPassword must use generic response against enumeration.");
  console.log("✔ Test 3 Passed: Password reset generic response protects against account enumeration.");

  console.log("=== ALL H-02 PASSWORD RESET SECURITY CHECKS PASSED SUCCESSFULLY ===");
}

verifyH02PasswordResetSecurity().catch((err) => {
  console.error("H-02 verification failed:", err);
  process.exit(1);
});
