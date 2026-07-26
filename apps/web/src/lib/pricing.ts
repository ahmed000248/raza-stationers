import { ProductCatalogueView } from "@raza-stationers/types"

export interface UserPricingContext {
  isApprovedBusiness: boolean
  businessDiscountPercent?: number
}

/**
 * CD-04 / BRD PR-01 / FRD §8 (v1.3): Resolves the display price for a product.
 * - Guest / unapproved accounts see the standard retail price (tier 5).
 * - Approved wholesale business accounts default to the wholesale price
 *   (tier 4) — this is their price even with no extra negotiated discount.
 * - If that account also has a negotiated account-wide discount, it's
 *   applied on top of the wholesale price, never the retail price (tier 3).
 * Tiers 1-2 (product/category-specific DiscountRule overrides) are resolved
 * upstream before this function runs; it only covers the account-wide
 * fallback (tiers 3-5). Never exposes the raw discount percentage.
 * Falls back to wholesalePrice for guests if retailPrice isn't set yet
 * (real retail prices are still being entered into the catalogue).
 */
export function resolveDisplayPrice(
  product: Pick<ProductCatalogueView, "wholesalePrice" | "retailPrice">,
  context?: UserPricingContext
): number {
  if (!context?.isApprovedBusiness) {
    return product.retailPrice ?? product.wholesalePrice
  }

  if (!context.businessDiscountPercent) {
    return product.wholesalePrice
  }

  const discountAmount = (product.wholesalePrice * context.businessDiscountPercent) / 100
  const resolvedPrice = Math.max(0, product.wholesalePrice - discountAmount)
  return Math.round(resolvedPrice)
}

/**
 * Formats a Pakistani Rupee amount (e.g. 1500 -> "Rs. 1,500")
 */
export function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`
}
