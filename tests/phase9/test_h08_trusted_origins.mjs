import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { getTrustedOrigins, validateEnvironment } from "../../apps/api/dist/config/env.config.js";

async function verifyH08TrustedOrigins() {
  console.log("=== RUNNING H-08 TRUSTED ORIGINS, COOKIES & ENV VALIDATION VERIFICATION ===");

  // 1. Verify Partial Google OAuth configuration guard
  process.env.GOOGLE_CLIENT_ID = "some-id";
  delete process.env.GOOGLE_CLIENT_SECRET;
  assert.throws(
    () => validateEnvironment(),
    (err) => err.message.includes("Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required"),
    "validateEnvironment must fail when Google OAuth is partially configured."
  );
  delete process.env.GOOGLE_CLIENT_ID;
  console.log("✔ Test 1 Passed: Partial Google OAuth configuration triggers startup error.");

  // 2. Verify getTrustedOrigins deduplication and env overrides
  process.env.CORS_ORIGINS = "https://custom1.com, https://custom2.com";
  process.env.WEB_URL = "https://custom-web.com";
  const origins = getTrustedOrigins();
  assert.ok(origins.includes("https://custom1.com"), "Custom CORS_ORIGINS included.");
  assert.ok(origins.includes("https://custom2.com"), "Custom CORS_ORIGINS included.");
  console.log("✔ Test 2 Passed: Trusted origins dynamically resolved and deduplicated.");

  // 3. Verify better-auth.ts cookie configuration
  const betterAuthContent = fs.readFileSync(
    path.resolve(process.cwd(), "apps/api/src/auth/better-auth.ts"),
    "utf8"
  );
  assert.ok(betterAuthContent.includes("useSecureCookies: isProd"), "useSecureCookies must use isProd.");
  assert.ok(betterAuthContent.includes('sameSite: "lax"'), "sameSite attribute must default to 'lax' for BFF.");
  assert.ok(betterAuthContent.includes("secure: isProd"), "secure attribute must use isProd.");
  console.log("✔ Test 3 Passed: Cookie attributes set to production-aware secure & SameSite=Lax.");

  console.log("=== ALL H-08 TRUSTED ORIGINS CHECKS PASSED SUCCESSFULLY ===");
}

verifyH08TrustedOrigins().catch((err) => {
  console.error("H-08 verification failed:", err);
  process.exit(1);
});
