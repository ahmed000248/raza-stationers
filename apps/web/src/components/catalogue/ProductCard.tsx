"use client"

import * as React from "react"
import { ProductCatalogueView } from "@raza-stationers/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { ProductIconBlock } from "@/components/ui/product-icon-block"
import { formatPKR, resolveDisplayPrice, UserPricingContext } from "@/lib/pricing"
import { useCart } from "@/hooks/use-cart"
import { ShoppingBag, BellRing, Check } from "lucide-react"

import Link from "next/link"

interface ProductCardProps {
  product: ProductCatalogueView
  pricingContext?: UserPricingContext
}

export function ProductCard({ product, pricingContext }: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = React.useState(false)
  const [notified, setNotified] = React.useState(false)

  const resolvedPrice = resolveDisplayPrice(product, pricingContext)
  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK"
  const isLowStock = product.stockStatus === "LOW_STOCK"

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.name,
      price: resolvedPrice,
      unit: "Piece",
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleNotifyMe = () => {
    setNotified(true)
    setTimeout(() => setNotified(false), 2000)
  }

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-4 space-y-3">
        {/* Clickable Header & Icon Block leading to Product Detail */}
        <Link href={`/product/${product.id}`} className="block space-y-3 group/link">
          <div className="relative">
            <ProductIconBlock
              category={product.categoryId.replace("cat-", "") as any}
              size="md"
              aspectRatio="video"
              className="w-full rounded-xl"
            />

            {/* Stock Badge Overlay */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              {isOutOfStock ? (
                <Badge variant="destructive" className="text-[10px]">
                  Out of Stock
                </Badge>
              ) : isLowStock ? (
                <Badge variant="amber" className="text-[10px]">
                  Low Stock ({product.currentQuantity})
                </Badge>
              ) : (
                <Badge variant="evergreen" className="text-[10px]">
                  In Stock
                </Badge>
              )}
            </div>
          </div>

          {/* Product Names */}
          <div className="space-y-1">
            {product.shopName && (
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {product.shopName}
              </span>
            )}
            <h4 className="font-heading font-semibold text-sm leading-snug text-[var(--color-ink-900)] line-clamp-2 group-hover/link:text-[var(--color-evergreen-600)] transition-colors">
              {product.name}
            </h4>
            {product.nameUrdu && (
              <p dir="rtl" className="font-urdu text-xs text-muted-foreground line-clamp-1">
                {product.nameUrdu}
              </p>
            )}
          </div>
        </Link>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-border/40 mt-auto">
        {/* Resolved Price (CD-04: No raw discount percentage shown) */}
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium">Price</span>
          <span className="font-heading font-bold text-base text-[var(--color-evergreen-600)]">
            {formatPKR(resolvedPrice)}
          </span>
        </div>

        {/* Action Button */}
        {isOutOfStock ? (
          <Button
            size="xs"
            variant="outline"
            onClick={handleNotifyMe}
            disabled={notified}
            className="rounded-full gap-1 text-[11px]"
          >
            {notified ? (
              <>
                <Check className="size-3 text-[var(--color-evergreen-600)]" />
                <span>Opted In</span>
              </>
            ) : (
              <>
                <BellRing className="size-3" />
                <span>Notify Me</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            size="xs"
            variant={added ? "secondary" : "default"}
            onClick={handleAddToCart}
            className="rounded-full gap-1 text-[11px]"
          >
            {added ? (
              <>
                <Check className="size-3" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="size-3" />
                <Bilingual en="Add" ur="شامل کریں" layout="inline" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
