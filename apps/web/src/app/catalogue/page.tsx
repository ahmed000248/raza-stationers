"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/catalogue/ProductCard"
import { CatalogueSearchInput } from "@/components/catalogue/CatalogueSearchInput"
import { CategoryFilter } from "@/components/catalogue/CategoryFilter"
import { PurchaseTypeToggle, PurchaseTypeFilter } from "@/components/catalogue/PurchaseTypeToggle"
import { CataloguePagination } from "@/components/catalogue/CataloguePagination"
import { StaggerList } from "@/components/motion/stagger-list"
import { EmptyState } from "@/components/ui/empty-state"
import { useAuth } from "@/hooks/use-auth"
import { createAPIClient } from "@raza-stationers/api"
import { SearchX, SlidersHorizontal, Loader2 } from "lucide-react"
import { Suspense } from "react"

const ITEMS_PER_PAGE = 8
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

function CatalogueContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const { pricingContext, accountStatus } = useAuth()

  const [searchQuery, setSearchQueryRaw] = React.useState("")
  const [selectedCategoryLocal, setSelectedCategoryLocal] = React.useState<string | null>(null)
  const [purchaseType, setPurchaseType] = React.useState<PurchaseTypeFilter>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [products, setProducts] = React.useState<any[]>([])
  const [categories, setCategories] = React.useState<any[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  const selectedCategory = categoryParam ?? selectedCategoryLocal

  const setSelectedCategory = React.useCallback((cat: string | null) => { setSelectedCategoryLocal(cat); setCurrentPage(1) }, [])
  const setSearchQuery = React.useCallback((q: string) => { setSearchQueryRaw(q); setCurrentPage(1) }, [])
  const handlePurchaseTypeChange = React.useCallback((pt: PurchaseTypeFilter) => { setPurchaseType(pt); setCurrentPage(1) }, [])

  const fetchProducts = React.useCallback(async () => {
    setLoading(true)
    try {
      const api = createAPIClient({ baseUrl: API_BASE })
      const params: any = { page: currentPage, limit: ITEMS_PER_PAGE }
      if (searchQuery) params.search = searchQuery
      if (selectedCategory) {
        const cat = categories.find((c: any) => c.id === selectedCategory)
        if (cat) params.categorySlug = cat.slug
      }
      const data = await api.getProducts(params)
      setProducts(data.items || [])
      setTotal(data.total || 0)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, selectedCategory, categories])

  const fetchCategories = React.useCallback(async () => {
    try {
      const api = createAPIClient({ baseUrl: API_BASE })
      const data = await api.getCategories()
      setCategories(data || [])
    } catch {}
  }, [])

  React.useEffect(() => { fetchCategories() }, [fetchCategories])
  React.useEffect(() => { fetchProducts() }, [fetchProducts])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory(null)
    setPurchaseType("all")
    setCurrentPage(1)
  }

  const categoryItems = categories.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }))

  return (
    <div className="py-10 px-6 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">FR-CAT-04 Wholesale Catalogue</span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)] mt-1">Stationery Products Catalogue</h1>
            <p className="mt-1 text-sm text-muted-foreground">Browse paper, notebooks, writing tools, and office supplies.</p>
          </div>
        </div>

        <div className="space-y-4 bg-card/40 p-4 sm:p-6 rounded-2xl border border-border">
          <CatalogueSearchInput value={searchQuery} onChange={setSearchQuery} />
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/40">
            <CategoryFilter categories={categoryItems} selectedId={selectedCategory} onSelect={setSelectedCategory} />
            {(selectedCategory || searchQuery || purchaseType !== "all") && (
              <button type="button" onClick={clearAllFilters} className="text-xs font-medium text-[var(--color-evergreen-600)] hover:underline shrink-0">Reset Filters</button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing <span className="font-semibold text-foreground">{loading ? "..." : total}</span> products</span>
          <span className="flex items-center gap-1"><SlidersHorizontal className="size-3" /><span>FR-CAT-08</span></span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : products.length === 0 ? (
          <EmptyState icon={SearchX} title="No Products Match Your Search" description="Try clearing your filters." actionLabel="Reset All Filters" onAction={clearAllFilters} />
        ) : (
          <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} pricingContext={pricingContext} />
            ))}
          </StaggerList>
        )}

        <CataloguePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}

export default function CataloguePage() {
  return <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading Catalogue...</div>}><CatalogueContent /></Suspense>
}
