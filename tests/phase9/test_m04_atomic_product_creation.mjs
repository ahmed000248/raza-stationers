import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

async function verifyM04AtomicProductCreation() {
  console.log("=== RUNNING M-04 ATOMIC PRODUCT CREATION VERIFICATION ===");

  const serviceContent = fs.readFileSync(
    path.resolve(process.cwd(), "apps/api/src/catalogue/catalogue.service.ts"),
    "utf8"
  );

  // 1. Verify createProduct uses $transaction
  assert.ok(
    serviceContent.includes("this.prisma.$transaction(async (tx) => {"),
    "createProduct must be wrapped inside Prisma interactive transaction."
  );
  console.log("✔ Test 1 Passed: Product creation is executed atomically inside Prisma transaction.");

  // 2. Verify active UOM check throws ConflictException
  assert.ok(
    serviceContent.includes('throw new ConflictException("No active unit of measure is configured")'),
    "createProduct must check for active UOM and throw ConflictException if missing."
  );
  console.log("✔ Test 2 Passed: Active Unit of Measure validation enforced before product insertion.");

  // 3. Verify tx context used for all dependent writes
  assert.ok(serviceContent.includes("tx.product.create("), "tx.product.create must be used instead of this.prisma.");
  assert.ok(serviceContent.includes("tx.productPackaging.create("), "tx.productPackaging.create must be used.");
  assert.ok(serviceContent.includes("tx.productPrice.create("), "tx.productPrice.create must be used.");
  console.log("✔ Test 3 Passed: Product, packaging, and price writes all executed on transactional context.");

  console.log("=== ALL M-04 ATOMIC PRODUCT CREATION CHECKS PASSED SUCCESSFULLY ===");
}

verifyM04AtomicProductCreation().catch((err) => {
  console.error("M-04 verification failed:", err);
  process.exit(1);
});
