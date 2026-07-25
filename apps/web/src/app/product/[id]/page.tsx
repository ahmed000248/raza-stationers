"use client"

import * as React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { mockProducts } from "@/content/mock/products"
import { mockProductUnits } from "@/content/mock/units"
import { ProductUnit } from "@raza-stationers/types"
import { ProductIconBlock } from "@/components/ui/product-icon-block"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/catalogue/ProductCard"
import { ProductUnitSelector } from "@/components/product/ProductUnitSelector"
import { QuantityStepper } from "@/components/product/QuantityStepper"
import { AddToCartButton } from "@/components/product/AddToCartButton"
import { calculateUnitPrice, calculateTotalBaseUnits } from "@/lib/unit-conversion"
import { formatPKR, resolveDisplayPrice, UserPricingContext } from "@/lib/pricing"
import { useCart } from "@/hooks/use-cart"
import { ArrowLeft, BellRing, Check, ShieldCheck, Truck, Layers } from "lucide-react"

interface ProductDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = React.use(params)
  const product = mockProducts.find((p) => p.id === id) || mockProducts[0]

  if (!product) {
    notFound()
  }

  const units = mockProductUnits[product.id] || [
    { id: `u-default`, productId: product.id, unitName: "Piece", conversionToBase: 1 },
  ]

  const [selectedUnit, setSelectedUnit] = React.useState<ProductUnit>(units[0])
  const [quantity, setQuantity] = React.useState(1)
  const [pricingMode, setPricingMode] = React.useState<"guest" | "wholesale">("guest")
  const [notified, setNotified] = React.useState(false)

  const { addItem } = useCart()

  const pricingContext: UserPricingContext = React.useMemo(() => {
    return pricingMode === "wholesale"
      ? { isApprovedBusiness: true, businessDiscountPercent: 15 }
      : { isApprovedBusiness: false }
  }, [pricingMode])

  // Price for a single selected unit
  const baseResolvedPrice = resolveDisplayPrice(product, pricingContext)
  const unitPrice = calculateUnitPrice(baseResolvedPrice, selectedUnit.conversionToBase)
  const totalPrice = unitPrice * quantity
  const totalBaseUnits = calculateTotalBaseUnits(quantity, selectedUnit.conversionToBase)

  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK"
  const isLowStock = product.stockStatus === "LOW_STOCK"

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedUnit.id}`,
      title: `${product.name} (${selectedUnit.unitName})`,
      price: unitPrice,
      unit: selectedUnit.unitName,
    }, quantity)
  }

  const relatedProducts = mockProducts.filter((p) => p.id !== product.id).slice(0, 4)

  return (
    <div className="py-10 px-6 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Product Catalogue</span>
          </Link>

          {/* Pricing View Switcher (CD-04 Sanity Check) */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-card border border-border text-xs">
            <span className="text-muted-foreground px-1 hidden sm:inline">View:</span>
            <button
              type="button"
              onClick={() => setPricingMode("guest")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                pricingMode === "guest"
                  ? "bg-[var(--color-ink-900)] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Guest List
            </button>
            <button
              type="button"
              onClick={() => setPricingMode("wholesale")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                pricingMode === "wholesale"
                  ? "bg-[var(--color-evergreen-600)] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Wholesale (15%)
            </button>
          </div>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Solid Evergreen Icon Block Hero (FR-CAT-01 No Photo) */}
          <div className="lg:col-span-6 space-y-4">
            <ProductIconBlock
              category={(product.categoryId.replace("cat-", "") as "paper" | "pens" | "office" | "files" | "cutting" | "art" | "general")}
              size="xl"
              aspectRatio="square"
              className="w-full rounded-2xl shadow-md"
            />
            <p className="text-center text-xs text-muted-foreground">
              Description-based product representation (`FR-CAT-01` No Photo rule).
            </p>
          </div>

          {/* Right Column: Product Info, Variants & Actions */}
          <div className="lg:col-span-6 space-y-6">
            {/* Header Titles & Stock Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="mist" className="text-xs">
                  SKU: {product.sku}
                </Badge>
                {isOutOfStock ? (
                  <Badge variant="destructive" className="text-xs">
                    Out of Stock
                  </Badge>
                ) : isLowStock ? (
                  <Badge variant="amber" className="text-xs">
                    Low Stock ({product.currentQuantity} base units left)
                  </Badge>
                ) : (
                  <Badge variant="evergreen" className="text-xs">
                    In Stock ({product.currentQuantity} units)
                  </Badge>
                )}
              </div>

              {product.shopName && (
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">
                  {product.shopName}
                </span>
              )}

              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink-900)]">
                {product.name}
              </h1>

              {product.nameUrdu && (
                <p dir="rtl" className="font-urdu text-base text-[var(--color-evergreen-600)] font-semibold">
                  {product.nameUrdu}
                </p>
              )}
            </div>

            {/* Price Banner (CD-04 Resolved Price) */}
            <div className="p-4 rounded-2xl bg-card border border-border flex items-baseline justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-medium block">
                  Price per {selectedUnit.unitName}
                </span>
                <span className="font-heading font-bold text-2xl sm:text-3xl text-[var(--color-evergreen-600)]">
                  {formatPKR(unitPrice)}
                </span>
              </div>
              {quantity > 1 && (
                <div className="text-right">
                  <span className="text-xs text-muted-foreground font-medium block">Total Line Item</span>
                  <span className="font-heading font-bold text-lg text-[var(--color-ink-900)]">
                    {formatPKR(totalPrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Unit / Format Selector (PR-02) */}
            <ProductUnitSelector
              units={units}
              selectedUnit={selectedUnit}
              onSelectUnit={setSelectedUnit}
            />

            {/* Quantity Stepper & Add to Cart */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Order Quantity
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <QuantityStepper quantity={quantity} onChange={setQuantity} />
                {isOutOfStock ? (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      setNotified(true)
                      setTimeout(() => setNotified(false), 2000)
                    }}
                    className="rounded-full gap-2 flex-1"
                  >
                    {notified ? (
                      <>
                        <Check className="size-4 text-[var(--color-evergreen-600)]" />
                        <span>Opted In for Restock</span>
                      </>
                    ) : (
                      <>
                        <BellRing className="size-4" />
                        <span>Notify Me When Restocked</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <AddToCartButton onAdd={handleAddToCart} />
                )}
              </div>

              {selectedUnit.conversionToBase > 1 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                  <Layers className="size-3 text-[var(--color-evergreen-600)]" />
                  <span>
                    Total base stock items requested: <strong className="text-foreground">{totalBaseUnits} items</strong>
                  </span>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="border-t border-border pt-4 space-y-2">
              <h4 className="font-heading text-sm font-semibold text-[var(--color-ink-900)]">
                Product Details
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Delivery & Wholesale Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground border-t border-border/40">
              <div className="flex items-center gap-2">
                <Truck className="size-4 text-[var(--color-evergreen-600)]" />
                <span>Next-Day Zone Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[var(--color-evergreen-600)]" />
                <span>Verified Credit Terms Supported</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Recommendations Grid */}
        <div className="border-t border-border pt-10 space-y-6">
          <h3 className="font-heading text-xl font-bold tracking-tight text-[var(--color-ink-900)]">
            Frequently Ordered Together
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} pricingContext={pricingContext} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
