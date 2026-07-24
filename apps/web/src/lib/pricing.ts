import { ProductCatalogueView } from "@raza-stationers/types"

export interface UserPricingContext {
  isApprovedBusiness: boolean
  businessDiscountPercent?: number
}

/**
 * CD-04 / FRD §8: Resolves the display price for a product.
 * - Guest / unapproved accounts see standard base price (or list price).
 * - Approved wholesale business accounts receive their client discount,
 *   returning the final resolved price without ever exposing raw discount percentages to the frontend.
 */
export function resolveDisplayPrice(
  product: Pick<ProductCatalogueView, "basePrice">,
  context?: UserPricingContext
): number {
  if (!context?.isApprovedBusiness || !context.businessDiscountPercent) {
    return product.basePrice
  }

  const discountAmount = (product.basePrice * context.businessDiscountPercent) / 100
  const resolvedPrice = Math.max(0, product.basePrice - discountAmount)
  return Math.round(resolvedPrice)
}

/**
 * Formats a Pakistani Rupee amount (e.g. 1500 -> "Rs. 1,500")
 */
export function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`
}
