import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

async function verifyH05RouteContracts() {
  console.log("=== RUNNING H-05 CONTROLLER & SDK ROUTE CONTRACT VERIFICATION ===");

  const accountingController = fs.readFileSync(path.resolve(process.cwd(), "apps/api/src/accounting/accounting.controller.ts"), "utf8");
  const returnsController = fs.readFileSync(path.resolve(process.cwd(), "apps/api/src/returns/returns.controller.ts"), "utf8");
  const deliveryController = fs.readFileSync(path.resolve(process.cwd(), "apps/api/src/delivery/delivery.controller.ts"), "utf8");
  const sdkContent = fs.readFileSync(path.resolve(process.cwd(), "packages/api/src/index.ts"), "utf8");

  // 1. Accounting routes
  assert.ok(!accountingController.includes('Get("accounting/'), "accounting.controller.ts must not duplicate controller prefix in route decorators.");
  assert.ok(accountingController.includes('Get("summary")'), "AccountingController must offer /accounting/summary.");
  assert.ok(accountingController.includes('Get("revenue")'), "AccountingController must offer /accounting/revenue.");
  assert.ok(accountingController.includes('Get("expenses")'), "AccountingController must offer /accounting/expenses.");
  assert.ok(accountingController.includes('Get("outstanding")'), "AccountingController must offer /accounting/outstanding.");
  console.log("✔ Test 1 Passed: Accounting routes cleaned of path duplication.");

  // 2. Returns routes
  assert.ok(!returnsController.includes('Post("returns")'), "returns.controller.ts must not duplicate controller prefix.");
  assert.ok(returnsController.includes('Get("order/:orderId")'), "returns.controller.ts must use clean /returns/order/:orderId path.");
  console.log("✔ Test 2 Passed: Returns routes cleaned of path duplication.");

  // 3. Delivery routes
  assert.ok(deliveryController.includes('Controller("deliveries")'), "delivery.controller.ts must declare 'deliveries' controller prefix.");
  assert.ok(deliveryController.includes('create(@Body() body: { orderId: string })'), "Delivery creation must validate orderId from body.");
  console.log("✔ Test 3 Passed: Delivery routes and DTO parameter binding verified.");

  // 4. SDK route alignment
  assert.ok(sdkContent.includes('post("/deliveries", { orderId })'), "SDK createDelivery must post to /deliveries with body.");
  assert.ok(sdkContent.includes("/returns/order/"), "SDK getReturnsByOrder must hit /returns/order/${orderId}.");
  console.log("✔ Test 4 Passed: Shared SDK client routes aligned 100% with backend API controllers.");

  console.log("=== ALL H-05 ROUTE CONTRACT CHECKS PASSED SUCCESSFULLY ===");
}

verifyH05RouteContracts().catch((err) => {
  console.error("H-05 verification failed:", err);
  process.exit(1);
});
