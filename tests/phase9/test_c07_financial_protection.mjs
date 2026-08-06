import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { PricingService } from "../../apps/api/dist/pricing/pricing.service.js";
import { RolesGuard } from "../../apps/api/dist/auth/guards/roles.guard.js";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

async function verifyC07FinancialProtection() {
  console.log("=== RUNNING C-07 FINANCIAL DATA & PRICING PROTECTION VERIFICATION ===");

  // 1. Test PricingService strip of buyingPrice for non-admin customers
  const mockPrismaPricing = {
    businessUserLink: {
      findFirst: async () => ({ clientBusinessId: "biz-customer" }),
    },
    product: {
      findUnique: async () => ({
        sku: "SKU-001",
        name: "Notebook",
        packaging: [
          {
            prices: [
              { priceType: "wholesale", amount: 100 },
              { priceType: "buying", amount: 60 },
            ],
            clientPrices: [],
          },
        ],
      }),
    },
  };

  const pricingService = new PricingService(mockPrismaPricing);

  // Customer pricing call
  const customerPrice = await pricingService.getResolvedPrice("SKU-001", { id: "user-cust", role: "business_user" });
  assert.strictEqual(customerPrice.buyingPrice, undefined, "Customer price response MUST NOT contain buyingPrice.");
  assert.strictEqual(customerPrice.wholesalePrice, undefined, "Customer price response MUST NOT contain wholesalePrice.");
  assert.strictEqual(customerPrice.effectivePrice, 100);
  console.log("✔ Test 1 Passed: Customer price response excludes buyingPrice and internal pricing.");

  // Admin pricing call
  const adminPrice = await pricingService.getResolvedPrice("SKU-001", { id: "admin-1", role: "owner" });
  assert.strictEqual(adminPrice.buyingPrice, 60, "Admin price response MUST include buyingPrice.");
  assert.strictEqual(adminPrice.wholesalePrice, 100);
  console.log("✔ Test 2 Passed: Admin price response includes internal buyingPrice.");

  // 2. Test DashboardController protection
  const mockReflector = {
    getAllAndOverride: () => ["owner", "admin"],
  };
  const rolesGuard = new RolesGuard(mockReflector);

  const customerDashboardContext = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: "user-cust", role: "business_user", aal: "aal1" },
      }),
    }),
  };

  assert.throws(
    () => rolesGuard.canActivate(customerDashboardContext),
    (err) => err instanceof ForbiddenException,
    "Dashboard access must be rejected for business_user role."
  );
  console.log("✔ Test 3 Passed: Global dashboard statistics blocked for non-admin users.");

  console.log("=== ALL C-07 FINANCIAL DATA PROTECTION CHECKS PASSED SUCCESSFULLY ===");
}

verifyC07FinancialProtection().catch((err) => {
  console.error("C-07 verification failed:", err);
  process.exit(1);
});
