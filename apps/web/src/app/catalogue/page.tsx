"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { createAPIClient } from "@raza-stationers/api"
import { Filter, SearchX, X } from "lucide-react"
import { CategoryBrowser } from "@/components/catalogue/CategoryBrowser"
import { CataloguePagination } from "@/components/catalogue/CataloguePagination"
import { CatalogueSearchInput } from "@/components/catalogue/CatalogueSearchInput"
import { ProductListRow } from "@/components/catalogue/ProductListRow"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Sheet, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import useDebounce from "@/hooks/use-debounce"
import { getApiBaseUrl } from "@/lib/public-config"

const API_BASE = getApiBaseUrl()
const ITEMS_PER_PAGE = 20
const allowedStock = new Set(["updating", "out_of_stock", "low_stock", "in_stock"])
const allowedSaleType = new Set(["individual", "bulk"])
const allowedSort = new Set(["name_asc", "name_desc", "newest"])

function CatalogueSkeleton() {
  return <div className="overflow-hidden rounded-2xl border border-border bg-card">{Array.from({ length: 8 }, (_, index) => <div key={index} className="flex items-center gap-3 border-b border-border p-3 last:border-0"><Skeleton className="size-12 shrink-0 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-2.5 w-1/3" /></div><Skeleton className="h-10 w-14 rounded-xl" /></div>)}</div>
}

export default function CataloguePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { pricingContext } = useAuth()
  const [searchInput, setSearchInput] = React.useState(searchParams.get("q") || "")
  const debouncedSearch = useDebounce(searchInput, 350)
  const [products, setProducts] = React.useState<any[]>([])
  const [categories, setCategories] = React.useState<any[]>([])
  const [units, setUnits] = React.useState<any[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [filtersOpen, setFiltersOpen] = React.useState(false)

  const current = React.useMemo(() => {
    const pageValue = Number(searchParams.get("page"))
    const saleType = searchParams.get("saleType")
    const stock = searchParams.get("stock")
    const sort = searchParams.get("sort")
    const minPrice = Number(searchParams.get("minPrice"))
    const maxPrice = Number(searchParams.get("maxPrice"))
    return {
      q: searchParams.get("q") || "", category: searchParams.get("category"),
      page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1,
      saleType: allowedSaleType.has(saleType || "") ? saleType as "individual" | "bulk" : undefined,
      stock: allowedStock.has(stock || "") ? stock as "updating" | "out_of_stock" | "low_stock" | "in_stock" : undefined,
      unit: searchParams.get("unit") || undefined,
      sort: allowedSort.has(sort || "") ? sort as "name_asc" | "name_desc" | "newest" : "name_asc" as const,
      minPrice: Number.isFinite(minPrice) && minPrice >= 0 && searchParams.has("minPrice") ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) && maxPrice >= 0 && searchParams.has("maxPrice") ? maxPrice : undefined,
    }
  }, [searchParams])

  const updateParams = React.useCallback((updates: Record<string, string | number | null | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => value === null || value === undefined || value === "" ? next.delete(key) : next.set(key, String(value)))
    if (resetPage && !("page" in updates)) next.delete("page")
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false })
  }, [pathname, router, searchParams])

  React.useEffect(() => { if (debouncedSearch !== current.q) updateParams({ q: debouncedSearch || null }) }, [debouncedSearch, current.q, updateParams])
  React.useEffect(() => { setSearchInput(current.q) }, [current.q])

  const [retryKey, setRetryKey] = React.useState(0)

  React.useEffect(() => {
    const api = createAPIClient({ baseUrl: API_BASE })
    Promise.all([api.getCategories(), api.getCatalogueFilterOptions()]).then(([categoryData, optionData]: any[]) => {
      setCategories(categoryData || [])
      setUnits(optionData?.units || [])
    }).catch((err) => {
      console.warn("Failed to load catalogue categories/options", err)
    })
  }, [retryKey])

  React.useEffect(() => {
    const controller = new AbortController()
    const api = createAPIClient({ baseUrl: API_BASE })
    setLoading(true)
    setError("")
    api.getProducts({ page: current.page, limit: ITEMS_PER_PAGE, search: current.q || undefined, categorySlug: current.category || undefined, saleType: current.saleType, stock: current.stock, unit: current.unit, minPrice: current.minPrice, maxPrice: current.maxPrice, sort: current.sort, signal: controller.signal })
      .then((data: any) => { setProducts(data.items || []); setTotal(data.total || 0) })
      .catch((cause: unknown) => { if ((cause as Error)?.name !== "AbortError") { setProducts([]); setError("Catalogue results could not be loaded. Please check your connection and try again.") } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [current, retryKey])

  const reset = () => { setSearchInput(""); router.replace(pathname, { scroll: false }); setFiltersOpen(false) }
  const activeFilters = [current.category && ["category", current.category], current.saleType && ["saleType", current.saleType], current.stock && ["stock", current.stock.replaceAll("_", " ")], current.unit && ["unit", current.unit], current.minPrice !== undefined && ["minPrice", `From Rs. ${current.minPrice}`], current.maxPrice !== undefined && ["maxPrice", `To Rs. ${current.maxPrice}`]].filter(Boolean) as string[][]
  const filterControls = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <label className="space-y-1 text-xs font-semibold">Sale type<select value={current.saleType || ""} onChange={(event) => updateParams({ saleType: event.target.value || null })} className="block min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"><option value="">All sale types</option><option value="individual">Individual</option><option value="bulk">Bulk packaging</option></select></label>
      <label className="space-y-1 text-xs font-semibold">Availability<select value={current.stock || ""} onChange={(event) => updateParams({ stock: event.target.value || null })} className="block min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"><option value="">All stock states</option><option value="updating">Stock being updated</option><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select></label>
      <label className="space-y-1 text-xs font-semibold">Sale unit<select value={current.unit || ""} onChange={(event) => updateParams({ unit: event.target.value || null })} className="block min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"><option value="">All units</option>{units.map((unit) => <option key={unit.code} value={unit.code}>{unit.name}</option>)}</select></label>
      <label className="space-y-1 text-xs font-semibold">Minimum price<input type="number" min="0" defaultValue={current.minPrice} key={`min-${current.minPrice}`} onBlur={(event) => updateParams({ minPrice: event.target.value || null })} placeholder="No minimum" className="block min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal" /></label>
      <label className="space-y-1 text-xs font-semibold">Maximum price<input type="number" min="0" defaultValue={current.maxPrice} key={`max-${current.maxPrice}`} onBlur={(event) => updateParams({ maxPrice: event.target.value || null })} placeholder="No maximum" className="block min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal" /></label>
      <label className="space-y-1 text-xs font-semibold">Sort<select value={current.sort} onChange={(event) => updateParams({ sort: event.target.value === "name_asc" ? null : event.target.value })} className="block min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"><option value="name_asc">Name A–Z</option><option value="name_desc">Name Z–A</option><option value="newest">Recently added</option></select></label>
    </div>
  )

  return (
    <div className="min-h-screen px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="space-y-2"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-evergreen-600)]">Raza Stationers catalogue</p><h1 className="font-heading text-2xl font-bold text-[var(--color-ink-900)] sm:text-3xl">Find supplies quickly</h1><p className="text-sm text-muted-foreground">Compact, verified product information with shareable filters.</p></header>
        <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
          <div className="flex gap-2"><CatalogueSearchInput value={searchInput} onChange={setSearchInput} className="min-w-0 flex-1" /><Button type="button" variant="outline" className="min-h-10 shrink-0 rounded-xl lg:hidden" onClick={() => setFiltersOpen(true)}><Filter className="size-4" /><span className="hidden sm:inline">Filters</span></Button></div>
          <div className="mt-4 hidden border-t border-border pt-4 lg:block">{filterControls}</div>
          {activeFilters.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">{activeFilters.map(([key, label]) => <button key={key} type="button" onClick={() => updateParams({ [key]: null })} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-[var(--color-mist-100)] px-3 text-[11px] font-semibold capitalize">{label}<X className="size-3" /></button>)}<button type="button" onClick={reset} className="min-h-8 px-2 text-xs font-semibold text-[var(--color-evergreen-600)] hover:underline">Reset filters</button></div>}
        </div>

        <CategoryBrowser variant="mobile" categories={categories} selectedSlug={current.category} onSelect={(category) => updateParams({ category })} />
        <div className="flex gap-6">
          <CategoryBrowser categories={categories} selectedSlug={current.category} onSelect={(category) => updateParams({ category })} />
          <section className="min-w-0 flex-1" aria-busy={loading}>
            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground"><span>{loading ? "Loading results…" : `${total.toLocaleString("en-PK")} products`}</span>{error && <button type="button" onClick={() => setRetryKey(k => k + 1)} className="font-semibold text-destructive underline">Retry</button>}</div>
            {loading ? (
              <CatalogueSkeleton />
            ) : error ? (
              <EmptyState icon={SearchX} title="Connection Error" description={error} actionLabel="Retry Connection" onAction={() => setRetryKey(k => k + 1)} />
            ) : products.length === 0 ? (
              <EmptyState icon={SearchX} title={activeFilters.length > 0 || current.q ? "No products match these filters" : "No products available"} description={activeFilters.length > 0 || current.q ? "Try clearing one or more filters." : "The catalogue currently has no active products listed."} actionLabel={activeFilters.length > 0 || current.q ? "Reset filters" : undefined} onAction={activeFilters.length > 0 || current.q ? reset : undefined} />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">{products.map((product) => <ProductListRow key={product.id} product={product} pricingContext={pricingContext} />)}</div>
            )}
            <CataloguePagination currentPage={current.page} totalPages={Math.ceil(total / ITEMS_PER_PAGE)} onPageChange={(page) => updateParams({ page }, false)} />
          </section>
        </div>
      </div>
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen} side="right"><SheetClose onClick={() => setFiltersOpen(false)} /><SheetHeader><SheetTitle>Catalogue filters</SheetTitle></SheetHeader><div className="mt-5 flex-1 overflow-y-auto">{filterControls}<Button type="button" variant="outline" onClick={reset} className="mt-5 w-full rounded-xl">Reset filters</Button></div></Sheet>
    </div>
  )
}
