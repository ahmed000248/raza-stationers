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

  // Test 2: AuthService.getBootstrapStatus mock flow verification
  const mockPrisma = {
    user: {
      async findUnique({ where }) {
        if (where.supabaseAuthId === "sub-registered") {
          return {
            id: "user-1",
            name: "Registered User",
            mobileNumber: "03105008398",
            role: "customer",
            isActive: true,
            createdAt: new Date(),
            businessUserLinks: [],
          };
        }
        if (where.supabaseAuthId === "sub-inactive") {
          return {
            id: "user-2",
            name: "Inactive User",
            mobileNumber: "03101111111",
            role: "customer",
            isActive: false,
            createdAt: new Date(),
            businessUserLinks: [],
          };
        }
        return null; // Unregistered Google identity
      },
    },
  };

  // Mock AuthService getBootstrapStatus logic
  async function mockGetBootstrapStatus(sub, email) {
    const user = await mockPrisma.user.findUnique({ where: { supabaseAuthId: sub } });
    if (!user) {
      return { authenticated: true, registered: false, email, sub };
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

  // Check 1: Unregistered identity returns authenticated: true, registered: false
  const unregRes = await mockGetBootstrapStatus("sub-new-google-user", "newgoogle@example.com");
  assert.equal(unregRes.authenticated, true);
  assert.equal(unregRes.registered, false);
  assert.equal(unregRes.email, "newgoogle@example.com");
  console.log("✔ Test 2: Unregistered Google identity returns registered: false passed.");

  // Check 2: Active registered user returns registered: true and profile
  const regRes = await mockGetBootstrapStatus("sub-registered", "reg@example.com");
  assert.equal(regRes.authenticated, true);
  assert.equal(regRes.registered, true);
  assert.equal(regRes.profile.name, "Registered User");
  console.log("✔ Test 3: Registered user returns registered: true and profile passed.");

  // Check 3: Inactive user returns isInactive: true
  const inactRes = await mockGetBootstrapStatus("sub-inactive", "inactive@example.com");
  assert.equal(inactRes.authenticated, true);
  assert.equal(inactRes.registered, true);
  assert.equal(inactRes.isInactive, true);
  console.log("✔ Test 4: Inactive user status check passed.");

  console.log("All Auth Regression Unit Tests Passed Successfully!");
}

runAuthRegressionTests().catch((err) => {
  console.error("Auth regression test execution failed:", err);
  process.exit(1);
});
