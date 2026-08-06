import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

async function verifyH03SignupOnboarding() {
  console.log("=== RUNNING H-03 SIGNUP & BUSINESS ONBOARDING VERIFICATION ===");

  const useAuthContent = fs.readFileSync(path.resolve(process.cwd(), "apps/web/src/hooks/use-auth.tsx"), "utf8");

  // 1. Verify business registration call during signup
  assert.ok(useAuthContent.includes("api.registerClient({"), "use-auth.tsx register must call api.registerClient to complete business onboarding.");
  console.log("✔ Test 1 Passed: Business registration incorporated into signup flow.");

  // 2. Verify account status is derived from clientBusiness accountStatus
  assert.ok(useAuthContent.includes("clientRes.clientBusiness.accountStatus"), "use-auth.tsx checkSession must derive account status from clientBusiness accountStatus.");
  assert.ok(!useAuthContent.includes('mappedUser.mobileNumber ? "approved" : "authenticated_unregistered"'), "use-auth.tsx must not infer account status solely from mobile number existence.");
  console.log("✔ Test 2 Passed: Account status derived from active business status.");

  // 3. Verify OnboardingGate wraps AuthProvider children
  assert.ok(useAuthContent.includes("<OnboardingGate>{children}</OnboardingGate>"), "AuthProvider must wrap children with OnboardingGate.");
  console.log("✔ Test 3 Passed: OnboardingGate active in AuthProvider.");

  console.log("=== ALL H-03 SIGNUP & ONBOARDING CHECKS PASSED SUCCESSFULLY ===");
}

verifyH03SignupOnboarding().catch((err) => {
  console.error("H-03 verification failed:", err);
  process.exit(1);
});
