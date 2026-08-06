import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { RolesGuard } from "../../apps/api/dist/auth/guards/roles.guard.js";
import { ForbiddenException } from "@nestjs/common";

async function verifyMfaSecurity() {
  console.log("=== RUNNING C-04 MFA SECURITY & AAL2 ASSURANCES VERIFICATION ===");

  // 1. Verify no sessionStorage security state in use-admin-auth.tsx
  const hookContent = fs.readFileSync(path.resolve(process.cwd(), "apps/admin/src/hooks/use-admin-auth.tsx"), "utf8");
  assert.ok(!hookContent.includes("sessionStorage.setItem"), "use-admin-auth.tsx must not write security state to sessionStorage.");
  assert.ok(!hookContent.includes("sessionStorage.getItem"), "use-admin-auth.tsx must not read security state from sessionStorage.");
  console.log("✔ Test 1 Passed: Client sessionStorage security proof removed.");

  // 2. Test RolesGuard rejecting aal1 for admin/owner roles
  const mockReflector = {
    getAllAndOverride: () => ["owner", "admin"],
  };
  const rolesGuard = new RolesGuard(mockReflector);

  const mockContextAal1 = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: "admin-1", role: "owner", aal: "aal1" },
      }),
    }),
  };

  assert.throws(
    () => rolesGuard.canActivate(mockContextAal1),
    (err) => err instanceof ForbiddenException && err.message.includes("AAL2"),
    "RolesGuard must reject AAL1 session for sensitive admin/owner route."
  );
  console.log("✔ Test 2 Passed: RolesGuard rejects AAL1 session for privileged admin/owner role.");

  // 3. Test RolesGuard allowing aal2 for admin/owner roles
  const mockContextAal2 = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: "admin-1", role: "owner", aal: "aal2" },
      }),
    }),
  };

  assert.strictEqual(rolesGuard.canActivate(mockContextAal2), true, "RolesGuard must allow AAL2 session for owner/admin.");
  console.log("✔ Test 3 Passed: RolesGuard accepts verified AAL2 session.");

  // 4. Test RolesGuard allowing business_user without AAL2
  const mockReflectorBusiness = {
    getAllAndOverride: () => ["business_user"],
  };
  const rolesGuardBusiness = new RolesGuard(mockReflectorBusiness);
  const mockContextBusiness = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: "user-1", role: "business_user", aal: "aal1" },
      }),
    }),
  };

  assert.strictEqual(rolesGuardBusiness.canActivate(mockContextBusiness), true, "RolesGuard allows business_user without MFA.");
  console.log("✔ Test 4 Passed: Non-admin business_user role does not require AAL2.");

  console.log("=== ALL C-04 MFA SECURITY CHECKS PASSED SUCCESSFULLY ===");
}

verifyMfaSecurity().catch((err) => {
  console.error("C-04 MFA verification failed:", err);
  process.exit(1);
});
