import { ProductUnit } from "@raza-stationers/types"

/**
 * PR-02 / FRD §4: Unit Conversion Helper & Self-Check
 * Calculates line totals and base item quantities based on ProductUnit conversions.
 */

export function calculateUnitPrice(basePrice: number, conversionToBase: number): number {
  if (conversionToBase <= 0) return basePrice
  return Math.round(basePrice * conversionToBase)
}

export function calculateTotalBaseUnits(quantity: number, conversionToBase: number): number {
  return Math.max(0, quantity * conversionToBase)
}

/**
 * Runnable Self-Check (architecture.md §9):
 * Verifies unit conversion math correctness for piece, dozen, and carton units.
 */
export function runUnitConversionSelfCheck(): boolean {
  const basePrice = 100 // 100 Rs per piece

  // 1 Piece (conversion: 1) -> 100 Rs, 1 base unit
  const piecePrice = calculateUnitPrice(basePrice, 1)
  const pieceUnits = calculateTotalBaseUnits(2, 1)
  if (piecePrice !== 100 || pieceUnits !== 2) {
    throw new Error(`Self-check failed for Piece conversion: expected 100 Rs / 2 units, got ${piecePrice} / ${pieceUnits}`)
  }

  // 1 Dozen (conversion: 12) -> 1200 Rs, 24 base units for qty 2
  const dozenPrice = calculateUnitPrice(basePrice, 12)
  const dozenUnits = calculateTotalBaseUnits(2, 12)
  if (dozenPrice !== 1200 || dozenUnits !== 24) {
    throw new Error(`Self-check failed for Dozen conversion: expected 1200 Rs / 24 units, got ${dozenPrice} / ${dozenUnits}`)
  }

  // 1 Carton (conversion: 144) -> 14400 Rs, 144 base units for qty 1
  const cartonPrice = calculateUnitPrice(basePrice, 144)
  const cartonUnits = calculateTotalBaseUnits(1, 144)
  if (cartonPrice !== 14400 || cartonUnits !== 144) {
    throw new Error(`Self-check failed for Carton conversion: expected 14400 Rs / 144 units, got ${cartonPrice} / ${cartonUnits}`)
  }

  return true
}

// Execute self-check on module load
try {
  runUnitConversionSelfCheck()
} catch (err) {
  console.error("Unit Conversion Self-Check Error:", err)
}
