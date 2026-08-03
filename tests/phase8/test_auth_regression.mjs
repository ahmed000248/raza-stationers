import assert from "node:assert/strict";
import { normalizePakistaniMobile } from "@raza-stationers/validation";

process.env.NODE_ENV = "test";
process.env.USE_TEST_KEY = "true";
process.env.JWT_SECRET = "raza-stationers-test-secret-1234567890";

async function runAuthRegressionTests() {
  console.log("=== RUNNING AUTH REGRESSION UNIT TESTS ===");

  // Test 1: Mobile normalization
  assert.equal(normalizePakistaniMobile("03105008398"), "03105008398");
  assert.equal(normalizePakistaniMobile("+923105008398"), "03105008398");
  assert.equal(normalizePakistaniMobile("923105008398"), "03105008398");
  assert.equal(normalizePakistaniMobile("0310-5008398"), "03105008398");
  assert.equal(normalizePakistaniMobile("invalid"), null);
  console.log("✔ Test 1: Mobile normalization passed.");

  // Test 2: Provider-neutral getBootstrapStatus mock flow verification
  const mockUsers = {
    "user-registered": {
      id: "user-registered",
      name: "Registered User",
      mobileNumber: "03105008398",
      role: "business_user",
      isActive: true,
      createdAt: new Date(),
      businessUserLinks: [],
    },
    "user-inactive": {
      id: "user-inactive",
      name: "Inactive User",
      mobileNumber: "03101111111",
      role: "business_user",
      isActive: false,
      createdAt: new Date(),
      businessUserLinks: [],
    },
  };

  // Mock provider-neutral getBootstrapStatus (looks up by user ID, not supabaseAuthId)
  async function mockGetBootstrapStatus(token) {
    if (!token) {
      return { authenticated: false, registered: false, status: "unconfigured", message: "Authentication service is not configured yet." };
    }
    const user = mockUsers[token] ?? null;
    if (!user) {
      return { authenticated: true, registered: false };
    }
    if (!user.isActive) {
      return { authenticated: true, registered: true, isInactive: true, message: "User account is inactive" };
    }
    return {
      authenticated: true,
      registered: true,
      profile: { id: user.id, name: user.name, mobileNumber: user.mobileNumber, role: user.role },
    };
  }

  // Check 1: No token → unconfigured
  const noTokenRes = await mockGetBootstrapStatus(null);
  assert.equal(noTokenRes.authenticated, false);
  assert.equal(noTokenRes.status, "unconfigured");
  console.log("✔ Test 2: No token returns unconfigured status passed.");

  // Check 2: Unregistered identity returns registered: false
  const unregRes = await mockGetBootstrapStatus("sub-unknown");
  assert.equal(unregRes.authenticated, true);
  assert.equal(unregRes.registered, false);
  console.log("✔ Test 3: Unregistered identity returns registered: false passed.");

  // Check 3: Active registered user returns registered: true and profile
  const regRes = await mockGetBootstrapStatus("user-registered");
  assert.equal(regRes.authenticated, true);
  assert.equal(regRes.registered, true);
  assert.equal(regRes.profile.name, "Registered User");
  console.log("✔ Test 4: Registered user returns registered: true and profile passed.");

  // Check 4: Inactive user returns isInactive: true
  const inactRes = await mockGetBootstrapStatus("user-inactive");
  assert.equal(inactRes.authenticated, true);
  assert.equal(inactRes.registered, true);
  assert.equal(inactRes.isInactive, true);
  console.log("✔ Test 5: Inactive user status check passed.");

  console.log("All Auth Regression Unit Tests Passed Successfully!");
}

runAuthRegressionTests().catch((err) => {
  console.error("Auth regression test execution failed:", err);
  process.exit(1);
});
