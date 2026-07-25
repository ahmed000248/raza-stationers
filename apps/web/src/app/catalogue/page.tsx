"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { mockProducts, mockCategories } from "@/content/mock/products"
import { ProductCard } from "@/components/catalogue/ProductCard"
import { CatalogueSearchInput } from "@/components/catalogue/CatalogueSearchInput"
import { CategoryFilter } from "@/components/catalogue/CategoryFilter"
import { PurchaseTypeToggle, PurchaseTypeFilter } from "@/components/catalogue/PurchaseTypeToggle"
import { CataloguePagination } from "@/components/catalogue/CataloguePagination"
import { StaggerList } from "@/components/motion/stagger-list"
import { EmptyState } from "@/components/ui/empty-state"
import { UserPricingContext } from "@/lib/pricing"
import { SearchX, Building2, User, SlidersHorizontal } from "lucide-react"
import { Suspense } from "react"

const ITEMS_PER_PAGE = 8

function CatalogueContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")

  const [searchQuery, setSearchQueryRaw] = React.useState("")
  const [selectedCategoryLocal, setSelectedCategoryLocal] = React.useState<string | null>(null)
  const [purchaseType, setPurchaseType] = React.useState<PurchaseTypeFilter>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pricingMode, setPricingMode] = React.useState<"guest" | "wholesale">("guest")

  const pricingContext: UserPricingContext = React.useMemo(() => {
    return pricingMode === "wholesale"
      ? { isApprovedBusiness: true, businessDiscountPercent: 15 }
      : { isApprovedBusiness: false }
  }, [pricingMode])

  // Derive category from URL param or local state
  const selectedCategory = categoryParam ?? selectedCategoryLocal

  // Wrapped setters that also reset page to 1
  const setSelectedCategory = React.useCallback((cat: string | null) => {
    setSelectedCategoryLocal(cat)
    setCurrentPage(1)
  }, [])

  const setSearchQuery = React.useCallback((q: string) => {
    setSearchQueryRaw(q)
    setCurrentPage(1)
  }, [])

  const handlePurchaseTypeChange = React.useCallback((pt: PurchaseTypeFilter) => {
    setPurchaseType(pt)
    setCurrentPage(1)
  }, [])

  // Filter products based on search, category, and purchase type
  const filteredProducts = React.useMemo(() => {
    return mockProducts.filter((product) => {
      // Category match
      if (selectedCategory && product.categoryId !== selectedCategory) {
        return false
      }

      // Purchase type match (FR-CAT-08)
      if (purchaseType !== "all") {
        if (product.purchaseType !== "both" && product.purchaseType !== purchaseType) {
          return false
        }
      }

      // Free-text search match (FR-CAT-04)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchName = product.name.toLowerCase().includes(query)
        const matchUrdu = product.nameUrdu?.toLowerCase().includes(query) || false
        const matchShop = product.shopName?.toLowerCase().includes(query) || false
        const matchSku = product.sku.toLowerCase().includes(query)
        return matchName || matchUrdu || matchShop || matchSku
      }

      return true
    })
  }, [searchQuery, selectedCategory, purchaseType])

  // Paginate results (8 items per page)
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory(null)
    setPurchaseType("all")
    setCurrentPage(1)
  }

  return (
    <div className="py-10 px-6 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">
              FR-CAT-04 Wholesale Catalogue
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)] mt-1">
              Stationery Products Catalogue
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse paper, notebooks, writing tools, and office supplies with live stock indicators.
            </p>
          </div>

          {/* Pricing View Mode Switcher (CD-04 Sanity Check) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-xl bg-card border border-border shadow-xs shrink-0">
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
                <span>Wholesale Account (15%)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="space-y-4 bg-card/40 p-4 sm:p-6 rounded-2xl border border-border">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <CatalogueSearchInput value={searchQuery} onChange={setSearchQuery} />
            <PurchaseTypeToggle value={purchaseType} onChange={handlePurchaseTypeChange} className="shrink-0" />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/40">
            <CategoryFilter
              categories={mockCategories}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
            />

            {(selectedCategory !== null || searchQuery || purchaseType !== "all") && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-medium text-[var(--color-evergreen-600)] hover:underline shrink-0"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Product Count Header */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
          </span>
          <span className="flex items-center gap-1">
            <SlidersHorizontal className="size-3" />
            <span>FR-CAT-08 Individual/Bulk Split</span>
          </span>
        </div>

        {/* Product Grid or Empty State */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No Products Match Your Search"
            description="Try clearing your category filter, adjusting your search term, or switching the purchase type."
            actionLabel="Reset All Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} pricingContext={pricingContext} />
            ))}
          </StaggerList>
        )}

        {/* Pagination */}
        <CataloguePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading Catalogue...</div>}>
      <CatalogueContent />
    </Suspense>
  )
}
