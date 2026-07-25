import { CartItem } from "@/hooks/use-cart"

/**
 * FR-CRT-01 / Architecture §9: Cart Math Helper & Self-Check
 * Calculates line totals, cart subtotals, and total item counts.
 */

export function calculateLineTotal(price: number, quantity: number): number {
  return Math.max(0, Math.round(price * quantity))
}

export function calculateCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + calculateLineTotal(item.price, item.quantity), 0)
}

export function calculateCartTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + Math.max(0, item.quantity), 0)
}

/**
 * Runnable Self-Check (architecture.md §9):
 * Verifies cart subtotal and quantity calculation accuracy.
 */
export function runCartMathSelfCheck(): boolean {
  const sampleItems: CartItem[] = [
    { id: "item-1", title: "A4 Rims Pack", price: 1250, quantity: 2, unit: "Rim" },
    { id: "item-2", title: "Gel Pen Box", price: 350, quantity: 3, unit: "Box" },
  ]

  const line1 = calculateLineTotal(1250, 2)
  if (line1 !== 2500) {
    throw new Error(`Self-check failed for line total 1: expected 2500, got ${line1}`)
  }

  const subtotal = calculateCartSubtotal(sampleItems)
  if (subtotal !== 3550) {
    throw new Error(`Self-check failed for subtotal: expected 3550, got ${subtotal}`)
  }

  const totalItems = calculateCartTotalItems(sampleItems)
  if (totalItems !== 5) {
    throw new Error(`Self-check failed for total items: expected 5, got ${totalItems}`)
  }

  return true
}

// Execute self-check on module load
try {
  runCartMathSelfCheck()
} catch (err) {
  console.error("Cart Math Self-Check Error:", err)
}
