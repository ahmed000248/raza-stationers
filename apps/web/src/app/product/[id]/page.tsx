"use client"

import * as React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductIconBlock } from "@/components/ui/product-icon-block"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductUnitSelector } from "@/components/product/ProductUnitSelector"
import { QuantityStepper } from "@/components/product/QuantityStepper"
import { AddToCartButton } from "@/components/product/AddToCartButton"
import { formatPKR } from "@/lib/pricing"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { createAPIClient } from "@raza-stationers/api"
import { ArrowLeft, ShieldCheck, Truck, Loader2 } from "lucide-react"
import { getApiBaseUrl } from "@/lib/public-config"

const API_BASE = getApiBaseUrl()

interface Props { params: Promise<{ id: string }> }

export default function ProductDetailPage({ params }: Props) {
  const { id } = React.use(params)
  const { pricingContext } = useAuth()
  const { addItem } = useCart()

  const [product, setProduct] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [selectedUnitIdx, setSelectedUnitIdx] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)
  const [notified, setNotified] = React.useState(false)

  React.useEffect(() => {
    const api = createAPIClient({ baseUrl: API_BASE })
    api.getProduct(id).then(setProduct).catch(() => setProduct(null)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="py-20 flex items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
  if (!product) { notFound(); return null }

  const units = (product.packaging || []).filter((unit: any) => {
    if (!unit.isActive || unit.confirmationStatus !== "confirmed" || Number(unit.conversionToBase) <= 0) return false
    if (unit.isBase && !product.allowIndividualSale) return false
    return unit.prices?.some((price: any) => ["retail", "wholesale"].includes(price.priceType) && Number(price.amount) > 0)
  })
  const selectedUnit = units[selectedUnitIdx] || units[0] || { id: "default", label: "Piece", unitOfMeasure: { code: "Pc" } }
  const wholesalePrice = selectedUnit.prices?.find((p: any) => p.priceType === "wholesale")
  const retailPrice = selectedUnit.prices?.find((p: any) => p.priceType === "retail")
  const eligiblePrice = pricingContext.isApprovedBusiness ? wholesalePrice : retailPrice
  const unitPrice = Number(eligiblePrice?.amount || 0)
  const totalPrice = unitPrice * quantity
  const availableBase = (product.stockBalances || []).reduce((sum: number, balance: any) => sum + Number(balance.onHandQuantity) - Number(balance.reservedQuantity), 0)
  const stockUpdating = product.openingStockStatus === "NOT_COUNTED"
  const requestedBase = quantity * Number(selectedUnit.conversionToBase || 1)
  const unavailable = stockUpdating || availableBase <= 0 || requestedBase > availableBase || !unitPrice || selectedUnit.id === "default"
  const hasBulkPackage = units.some((unit: any) => Number(unit.conversionToBase) > 1)

  const handleAddToCart = () => {
    if (unavailable) return
    addItem({ id: selectedUnit.id, title: `${product.name} (${selectedUnit.label})`, price: unitPrice, unit: selectedUnit.unitOfMeasure?.code || "Pc" }, quantity)
  }

  return (
    <div className="min-h-screen px-3 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <Link href="/catalogue" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" /><span>Back to Product Catalogue</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6 space-y-4">
            <ProductIconBlock category="general" size="xl" aspectRatio="square" className="w-full rounded-2xl shadow-md" />
            <p className="text-center text-xs text-muted-foreground">Description-based product representation (FR-CAT-01 No Photo rule).</p>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="mist" className="text-xs">SKU: {product.sku}</Badge>
                <Badge variant={stockUpdating || availableBase <= 0 ? "amber" : "evergreen"} className="text-xs">{stockUpdating ? "Stock being updated" : availableBase <= 0 ? "Out of stock" : "In stock"}</Badge>
              </div>
              {product.shopName && <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">{product.shopName}</span>}
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink-900)]">{product.name}</h1>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border">
              <span className="text-xs text-muted-foreground font-medium block">Price</span>
              <span className="font-heading font-bold text-2xl sm:text-3xl text-[var(--color-evergreen-600)]">{formatPKR(unitPrice)}</span>
              {quantity > 1 && <div className="text-right"><span className="text-xs text-muted-foreground font-medium block">Total</span><span className="font-heading font-bold text-lg">{formatPKR(totalPrice)}</span></div>}
            </div>

            {units.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Choose sale unit or bulk package</label>
                <div className="flex flex-wrap gap-2">
                  {units.map((u: any, i: number) => (
                    <button key={u.id} onClick={() => { setSelectedUnitIdx(i); setQuantity(1) }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${i === selectedUnitIdx ? "bg-[var(--color-evergreen-600)] text-white border-[var(--color-evergreen-600)]" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                      {u.label}
                      {Number(u.conversionToBase) > 1 && <span className="ml-1 opacity-75">({Number(u.conversionToBase)} base units)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!hasBulkPackage && product.allowIndividualSale && <p className="rounded-xl bg-[var(--color-mist-100)] px-3 py-2 text-xs text-muted-foreground">No confirmed bulk package or bulk price is configured. You may order a larger quantity of the base unit at the displayed per-unit price.</p>}

            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Order Quantity</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <QuantityStepper quantity={quantity} onChange={setQuantity} />
                <div aria-disabled={unavailable} className={unavailable ? "pointer-events-none opacity-50" : ""}><AddToCartButton onAdd={handleAddToCart} /></div>
              </div>
              {unavailable && <p className="text-xs font-medium text-amber-700">{stockUpdating ? "Ordering is paused while opening stock is updated." : requestedBase > availableBase ? `Only ${availableBase} base units are currently available.` : "This product is not currently available to order."}</p>}
            </div>

            {product.description && <div className="border-t border-border pt-4"><h4 className="font-heading text-sm font-semibold mb-2">Product Details</h4><p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{product.description}</p></div>}

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground border-t border-border/40">
              <div className="flex items-center gap-2"><Truck className="size-4 text-[var(--color-evergreen-600)]" /><span>Configured delivery or pickup at checkout</span></div>
              <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-[var(--color-evergreen-600)]" /><span>Account-eligible pricing only</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
