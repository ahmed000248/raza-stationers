"use client"

import * as React from "react"
import Link from "next/link"
import { Check, PackageOpen, ShoppingBag } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { UserPricingContext, formatPKR } from "@/lib/pricing"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductIconBlock } from "@/components/ui/product-icon-block"

export function ProductListRow({ product, pricingContext }: { product: any; pricingContext: UserPricingContext }) {
  const { addItem } = useCart()
  const [added, setAdded] = React.useState(false)
  const basePackage = product.packaging?.find((item: any) => item.isBase) || product.packaging?.[0]
  const price = pricingContext.isApprovedBusiness
    ? basePackage?.wholesalePrice
    : basePackage?.retailPrice
  const unavailable = product.stockStatus === "OUT_OF_STOCK" || product.stockStatus === "STOCK_UPDATING" || !basePackage || !price
  const stockLabel = product.stockStatus === "STOCK_UPDATING" ? "Stock being updated"
    : product.stockStatus === "OUT_OF_STOCK" ? "Out of stock"
    : product.stockStatus === "LOW_STOCK" ? "Low stock"
    : "In stock"

  const add = () => {
    if (unavailable) return
    addItem({ id: basePackage.id, title: product.name, price: Number(price), unit: basePackage.label, category: product.category }, 1)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="grid min-w-0 grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-3 py-3 last:border-b-0 sm:grid-cols-[56px_minmax(0,1fr)_130px_125px_auto] sm:gap-4 sm:px-4">
      <Link href={`/product/${product.sku}`} aria-label={`View ${product.name}`} className="rounded-xl focus:outline-none focus:ring-2 focus:ring-ring">
        <ProductIconBlock category="general" size="sm" aspectRatio="square" className="size-12 rounded-xl sm:size-14" />
      </Link>
      <div className="min-w-0">
        <Link href={`/product/${product.sku}`} className="block truncate text-sm font-semibold text-[var(--color-ink-900)] hover:text-[var(--color-evergreen-600)] hover:underline focus:outline-none focus:ring-2 focus:ring-ring">{product.name}</Link>
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          <span className="truncate">{product.sku}</span><span aria-hidden>·</span><span className="truncate">{basePackage?.label || "Packaging pending"}</span>
          {product.saleTypes?.bulk && <Badge variant="mist" className="px-1.5 py-0 text-[9px]">Bulk option</Badge>}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 sm:hidden">
          <span className="font-heading text-sm font-bold text-[var(--color-evergreen-600)]">{price ? formatPKR(Number(price)) : "Price pending"}</span>
          <span className="text-[10px] font-semibold text-muted-foreground">{stockLabel}</span>
        </div>
      </div>
      <div className="hidden sm:block"><span className="text-xs font-medium text-muted-foreground">{basePackage?.label || "Pending"}</span></div>
      <div className="hidden sm:block"><p className="font-heading text-sm font-bold text-[var(--color-evergreen-600)]">{price ? formatPKR(Number(price)) : "Price pending"}</p><p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{stockLabel}</p></div>
      <Button type="button" size="sm" variant={added ? "secondary" : "default"} disabled={unavailable || added} onClick={add} className="min-h-10 rounded-xl px-3" aria-label={`Add ${product.name} to cart`}>
        {added ? <Check className="size-4" /> : unavailable ? <PackageOpen className="size-4" /> : <ShoppingBag className="size-4" />}
        <span className="hidden lg:inline">{added ? "Added" : unavailable ? "Unavailable" : "Add"}</span>
      </Button>
    </article>
  )
}
