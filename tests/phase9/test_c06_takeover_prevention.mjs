import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { ClientsService } from "../../apps/api/dist/clients/clients.service.js";
import { ConflictException, NotFoundException } from "@nestjs/common";

async function verifyC06TakeoverPrevention() {
  console.log("=== RUNNING C-06 BUSINESS ACCOUNT TAKEOVER PREVENTION VERIFICATION ===");

  // 1. Verify ClientsService throws BUSINESS_ALREADY_REGISTERED on duplicate mobile registration
  const mockPrisma = {
    businessUserLink: {
      findFirst: async (args) => {
        // No existing link for registering user
        return null;
      },
    },
    clientBusiness: {
      findFirst: async (args) => {
        // Business already exists with that mobile number
        return { id: "biz-existing", mobileNumber: "03001234567" };
      },
      findUnique: async (args) => {
        if (args.where.id === "biz-unlinked") return { id: "biz-unlinked", businessName: "Other Business" };
        if (args.where.id === "biz-linked") return { id: "biz-linked", businessName: "My Business", userLinks: [] };
        return null;
      },
    },
  };

  const clientsService = new ClientsService(mockPrisma);

  // Test 1: Registering duplicate business phone number must throw ConflictException (BUSINESS_ALREADY_REGISTERED)
  await assert.rejects(
    async () => {
      await clientsService.register("user-attacker", {
        businessName: "Attacker Fake Shop",
        businessType: "retailer",
        contactPerson: "Attacker",
        mobileNumber: "03001234567",
        address: "123 Street",
        city: "Karachi",
      });
    },
    (err) => err instanceof ConflictException,
    "Registering existing business mobile must throw ConflictException and never auto-link ownership."
  );
  console.log("✔ Test 1 Passed: Duplicate mobile number registration rejected (BUSINESS_ALREADY_REGISTERED).");

  // Test 2: Unlinked business user accessing foreign business must throw NotFoundException
  await assert.rejects(
    async () => {
      await clientsService.findById("biz-unlinked", { id: "user-unlinked", role: "business_user" });
    },
    (err) => err instanceof NotFoundException,
    "Unlinked business user must receive NotFoundException when requesting foreign business."
  );
  console.log("✔ Test 2 Passed: Unlinked user blocked from accessing foreign business data.");

  // Test 3: Unlinked business user accessing foreign credit summary must throw NotFoundException
  await assert.rejects(
    async () => {
      await clientsService.getCreditSummary("biz-unlinked", { id: "user-unlinked", role: "business_user" });
    },
    (err) => err instanceof NotFoundException,
    "Unlinked business user must receive NotFoundException when requesting foreign credit summary."
  );
  console.log("✔ Test 3 Passed: Unlinked user blocked from accessing foreign credit summary.");

  // Test 4: Owner/admin bypassing link check
  const adminAccess = await clientsService.findById("biz-linked", { id: "admin-1", role: "owner" });
  assert.strictEqual(adminAccess.id, "biz-linked");
  console.log("✔ Test 4 Passed: Owner/admin can access business data.");

  console.log("=== ALL C-06 TAKEOVER PREVENTION CHECKS PASSED SUCCESSFULLY ===");
}

verifyC06TakeoverPrevention().catch((err) => {
  console.error("C-06 verification failed:", err);
  process.exit(1);
});
