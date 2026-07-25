import { stockAdjustmentSchema, discountRuleSchema } from "@raza-stationers/validation"

/**
 * FR-STK-07 / FR-PRC-05 / Architecture §9: Admin Ops Validation & Self-Check
 * Enforces mandatory reason strings for inventory stock adjustments and discount rule logs.
 */

export function validateStockAdjustmentReason(reason: string): boolean {
  return typeof reason === "string" && reason.trim().length >= 5
}

export function validateDiscountChangeReason(reason: string): boolean {
  return typeof reason === "string" && reason.trim().length >= 5
}

/**
 * Runnable Self-Check (architecture.md §9):
 * Verifies that stock adjustments and discount changes without a valid reason are rejected.
 */
export function runAdminOpsSelfCheck(): boolean {
  // Test 1: Stock adjustment without reason must fail
  const invalidStock = stockAdjustmentSchema.safeParse({
    productId: "prod-1",
    quantityChange: -5,
    reason: "",
  })
  if (invalidStock.success) {
    throw new Error("Self-check failed: Stock adjustment allowed empty reason (FR-STK-07 violation)")
  }

  // Test 2: Stock adjustment with valid reason must pass
  const validStock = stockAdjustmentSchema.safeParse({
    productId: "prod-1",
    quantityChange: -5,
    reason: "Audit correction: damaged paper ream in warehouse",
  })
  if (!validStock.success) {
    throw new Error("Self-check failed: Valid stock adjustment rejected")
  }

  // Test 3: Discount change without reason must fail
  const invalidDiscount = discountRuleSchema.safeParse({
    clientBusinessId: "cb-101",
    discountPercent: 18,
    reason: "abcd", // 4 characters < min(5)
  })
  if (invalidDiscount.success) {
    throw new Error("Self-check failed: Discount rule change allowed short reason (FR-PRC-05 violation)")
  }

  return true
}

// Execute self-check on module load
try {
  runAdminOpsSelfCheck()
} catch (err) {
  console.error("Admin Ops Self-Check Error:", err)
}
