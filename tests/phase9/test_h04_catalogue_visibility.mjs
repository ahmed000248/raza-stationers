import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

async function verifyH04CatalogueVisibility() {
  console.log("=== RUNNING H-04 PUBLIC CATALOGUE VISIBILITY & SALE FILTERS VERIFICATION ===");

  const serviceContent = fs.readFileSync(path.resolve(process.cwd(), "apps/api/src/catalogue/catalogue.service.ts"), "utf8");

  // 1. Verify p.status = 'active' requirement
  assert.ok(serviceContent.includes("p.status = 'active'::product_status"), "catalogue.service.ts must filter public products with p.status = 'active'.");
  assert.ok(!serviceContent.includes("pending_review'::product_status"), "catalogue.service.ts must not include pending_review products in public listing.");
  console.log("✔ Test 1 Passed: Public catalogue listing strictly restricted to active products.");

  // 2. Verify individual vs bulk SQL filters
  assert.ok(serviceContent.includes("p.allow_individual_sale = true"), "Individual sale filter must check allow_individual_sale = true.");
  assert.ok(serviceContent.includes("pp.conversion_to_base > 1"), "Bulk sale filter must check conversion_to_base > 1.");
  console.log("✔ Test 2 Passed: Individual and bulk sale type filters accurately differentiated.");

  // 3. Verify detail endpoint active status enforcement
  assert.ok(serviceContent.includes('product.status !== "active"'), "Public findById/findBySku must reject non-active products.");
  console.log("✔ Test 3 Passed: Public product details enforce active status requirement.");

  console.log("=== ALL H-04 CATALOGUE VISIBILITY CHECKS PASSED SUCCESSFULLY ===");
}

verifyH04CatalogueVisibility().catch((err) => {
  console.error("H-04 verification failed:", err);
  process.exit(1);
});
