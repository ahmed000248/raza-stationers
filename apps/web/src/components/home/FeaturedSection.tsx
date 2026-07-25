"use client"

import * as React from "react"
import { mockProducts } from "@/content/mock/products"
import { ProductCard } from "@/components/catalogue/ProductCard"
import { StaggerList } from "@/components/motion/stagger-list"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { UserPricingContext } from "@/lib/pricing"
import { Sparkles, Building2, User } from "lucide-react"

export function FeaturedSection() {
  const [pricingMode, setPricingMode] = React.useState<"guest" | "wholesale">("guest")

  const pricingContext: UserPricingContext = React.useMemo(() => {
    return pricingMode === "wholesale"
      ? { isApprovedBusiness: true, businessDiscountPercent: 15 }
      : { isApprovedBusiness: false }
  }, [pricingMode])

  const restockedProducts = mockProducts.slice(0, 4)
  const bestsellerProducts = mockProducts.slice(2, 6)

  return (
    <section className="py-12 px-6 bg-card/30 border-t border-border/40">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header & Pricing View Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-4 text-[var(--color-amber-500)]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">
                PRD §5.1 Restocked & Highlights
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink-900)]">
              Featured Stationery Products
            </h2>
          </div>

          {/* Pricing Mode Toggle for Sanity Check (CD-04) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-xl bg-background border border-border shadow-xs">
            <span className="text-xs font-medium text-muted-foreground px-2">Pricing View:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPricingMode("guest")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  pricingMode === "guest"
                    ? "bg-[var(--color-ink-900)] text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <User className="size-3" />
                <span>Guest List</span>
              </button>
              <button
                type="button"
                onClick={() => setPricingMode("wholesale")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  pricingMode === "wholesale"
                    ? "bg-[var(--color-evergreen-600)] text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Building2 className="size-3" />
                <span>Approved Business (15% Tier)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabbed Product Grid */}
        <Tabs defaultValue="restocked">
          <TabsList className="mb-6">
            <TabsTrigger value="restocked">Restocked & New Items</TabsTrigger>
            <TabsTrigger value="bestsellers">Catalogue Bestsellers</TabsTrigger>
          </TabsList>

          <TabsContent value="restocked">
            <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {restockedProducts.map((product) => (
                <ProductCard key={product.id} product={product} pricingContext={pricingContext} />
              ))}
            </StaggerList>
          </TabsContent>

          <TabsContent value="bestsellers">
            <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellerProducts.map((product) => (
                <ProductCard key={product.id} product={product} pricingContext={pricingContext} />
              ))}
            </StaggerList>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
