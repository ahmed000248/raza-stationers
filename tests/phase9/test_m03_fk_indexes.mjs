import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

async function verifyM03FkIndexes() {
  console.log("=== RUNNING M-03 FOREIGN KEY INDEXES VERIFICATION ===");

  const migrationContent = fs.readFileSync(
    path.resolve(process.cwd(), "packages/db/prisma/migrations/20260806170000_add_fk_indexes/migration.sql"),
    "utf8"
  );

  // 1. Verify critical foreign key indexes exist in migration
  assert.ok(migrationContent.includes('idx_products_category_id'), "products(category_id) index must exist.");
  assert.ok(migrationContent.includes('idx_orders_placed_by_user_id'), "orders(placed_by_user_id) index must exist.");
  assert.ok(migrationContent.includes('idx_business_user_links_linked_by_id'), "business_user_links(linked_by_id) index must exist.");
  assert.ok(migrationContent.includes('idx_business_user_links_ended_by_id'), "business_user_links(ended_by_id) index must exist.");
  assert.ok(migrationContent.includes('idx_product_prices_created_by_id'), "product_prices(created_by_id) index must exist.");
  assert.ok(migrationContent.includes('idx_stock_movements_stock_location_id'), "stock_movements(stock_location_id) index must exist.");
  assert.ok(migrationContent.includes('idx_payments_submitted_by_id'), "payments(submitted_by_id) index must exist.");
  assert.ok(migrationContent.includes('idx_payments_verified_by_id'), "payments(verified_by_id) index must exist.");
  console.log("✔ Test 1 Passed: All critical query foreign-key indexes defined in migration.");

  console.log("=== ALL M-03 FOREIGN KEY INDEXES CHECKS PASSED SUCCESSFULLY ===");
}

verifyM03FkIndexes().catch((err) => {
  console.error("M-03 verification failed:", err);
  process.exit(1);
});
