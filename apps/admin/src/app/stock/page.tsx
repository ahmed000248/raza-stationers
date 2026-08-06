"use client"

import * as React from "react"
import { Loader2, Plus, Search, X, Edit2 } from "lucide-react"
import { Badge, Button } from "@raza-stationers/ui"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useAdminShell } from "@/components/shell/AdminShell"
import { ProductModal } from "@/components/catalogue/ProductModal"

const states = [
  ["", "All stock"],
  ["not_initialized", "Not initialized"],
  ["out_of_stock", "Out of stock"],
  ["low_stock", "Low stock"],
  ["in_stock", "In stock"],
] as const

export default function StockManagementPage() {
  const { role, addToast } = useAdminShell()
  const { api } = useAdminAuth()
  const [items, setItems] = React.useState<any[]>([])
  const [locations, setLocations] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [stockState, setStockState] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [selected, setSelected] = React.useState<any>(null)
  const [mode, setMode] = React.useState<"opening" | "adjustment">("opening")
  const [quantity, setQuantity] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [locationId, setLocationId] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  // Product edit/create modal state
  const [productModalOpen, setProductModalOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<any>(null)

  const canEdit = role === "owner" || role === "admin"
  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [stock, locationData]: any[] = await Promise.all([
        api.getAllStock({ page, limit: 50, search: search || undefined, stockState: stockState || undefined }),
        api.getStockLocations(),
      ])
      setItems(stock.items || [])
      setTotalPages(stock.totalPages || 1)
      setLocations(locationData || [])
      setLocationId((current) => current || locationData?.[0]?.id || "")
    } catch (cause) {
      addToast({ title: "Stock data could not be loaded", description: cause instanceof Error ? cause.message : undefined, type: "error" })
    } finally {
      setLoading(false)
    }
  }, [api, search, stockState, page, addToast])

  React.useEffect(() => {
    const timer = window.setTimeout(load, 250)
    return () => window.clearTimeout(timer)
  }, [load])

  const open = (product: any) => {
    setSelected(product)
    setMode(product.stockState === "not_initialized" ? "opening" : "adjustment")
    setQuantity("")
    setReason("")
    setLocationId(product.primaryBalance?.stockLocationId || locations[0]?.id || "")
  }

  const handleOpenAddProduct = () => {
    setEditingProduct(null)
    setProductModalOpen(true)
  }

  const handleOpenEditProduct = (item: any) => {
    setEditingProduct({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category?.name || "General",
      price: Number(item.wholesalePrice || 0),
      stock: Number(item.available || 0),
      purchaseType: item.purchaseType || "both"
    })
    setProductModalOpen(true)
  }

  const handleSaveProduct = async (input: any) => {
    try {
      if (input.id) {
        await api.updateProduct(input.id, {
          name: input.name,
          purchaseType: input.purchaseType,
        })
      } else {
        await api.createProduct({
          name: input.name,
          categoryId: input.category || "cat-stationery",
          purchaseType: input.purchaseType,
          wholesalePrice: input.price,
        })
      }
      setProductModalOpen(false)
      load()
    } catch (cause) {
      addToast({ title: "Product save failed", description: cause instanceof Error ? cause.message : undefined, type: "error" })
    }
  }

  const save = async () => {
    const value = Number(quantity)
    if (!selected || !locationId || !Number.isFinite(value) || (mode === "opening" ? value < 0 : value === 0) || reason.trim().length < 3) return
    setSaving(true)
    try {
      if (mode === "opening") await api.recordOpeningStock({ productId: selected.id, stockLocationId: locationId, quantityBase: value, reason: reason.trim() })
      else await api.adjustStock({ productId: selected.id, stockLocationId: locationId, quantityDelta: value, reason: reason.trim() })
      addToast({ title: mode === "opening" ? "Opening stock recorded" : "Stock adjustment recorded", description: `${selected.sku}: ${quantity}`, type: "success" })
      setSelected(null)
      await load()
    } catch (cause) {
      addToast({ title: "Stock change failed", description: cause instanceof Error ? cause.message : undefined, type: "error" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Stock Management</h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Unknown opening stock is distinct from a confirmed zero quantity. Every change records its before, delta, after, reason, time and actor.</p>
        </div>
        {canEdit && (
          <Button onClick={handleOpenAddProduct} className="h-10 text-xs px-4 flex items-center gap-1.5">
            <Plus className="size-4" />
            + Add Product
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-white p-4 sm:flex-row">
        <label className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-[var(--text-muted)]" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search SKU or product" className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm" /></label>
        <select value={stockState} onChange={(event) => { setStockState(event.target.value); setPage(1) }} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm">{states.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin" /></div> : <>
        <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-white">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="bg-[var(--canvas)] text-[var(--text-muted)]"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">State</th><th className="px-4 py-3">On hand</th><th className="px-4 py-3">Reserved</th><th className="px-4 py-3">Available</th><th className="px-4 py-3">Last audited change</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">{items.map((item) => {
              const previous = item.lastMovement?.previousQuantityBase
              const next = item.lastMovement?.newQuantityBase
              const delta = previous == null || next == null ? null : Number(next) - Number(previous)
              return <tr key={item.id}>
                <td className="px-4 py-3"><p className="font-semibold">{item.name}</p><p className="text-[var(--text-muted)]">{item.sku}</p></td>
                <td className="px-4 py-3"><Badge>{String(item.stockState).replaceAll("_", " ")}</Badge></td>
                <td className="px-4 py-3 font-semibold">{item.stockState === "not_initialized" ? "-" : item.onHand}</td>
                <td className="px-4 py-3">{item.stockState === "not_initialized" ? "-" : item.reserved}</td>
                <td className="px-4 py-3">{item.stockState === "not_initialized" ? "-" : item.available}</td>
                <td className="max-w-80 px-4 py-3 text-[var(--text-muted)]">{item.lastMovement ? <><p>{previous ?? "-"} {delta == null ? "" : `${delta >= 0 ? "+" : ""}${delta}`} to {next ?? "-"}</p><p className="mt-1">{item.lastMovement.reason} / {item.lastMovement.createdBy?.name || "System"} / {item.lastMovement.occurredAt ? new Date(item.lastMovement.occurredAt).toLocaleString("en-PK") : "-"}</p></> : "No ledger entry"}</td>
                <td className="px-4 py-3 text-right">
                  {canEdit && (
                    <div className="flex items-center justify-end gap-2">
                      <Button type="button" variant="outline" className="h-8 text-xs px-2.5" onClick={() => handleOpenEditProduct(item)}>
                        <Edit2 className="size-3 mr-1" />
                        Edit
                      </Button>
                      <Button type="button" variant="default" className="h-8 text-xs px-3" onClick={() => open(item)}>
                        {item.stockState === "not_initialized" ? "Enter opening stock" : "Adjust Stock"}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            })}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-2"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="text-xs text-[var(--text-muted)]">Page {page} of {totalPages}</span><Button type="button" variant="outline" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>
      </>}

      {selected && <><button type="button" onClick={() => setSelected(null)} aria-label="Close stock form" className="fixed inset-0 z-40 bg-black/40" /><aside role="dialog" aria-modal="true" className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl"><button type="button" onClick={() => setSelected(null)} className="absolute right-4 top-4 p-2" aria-label="Close"><X className="size-5" /></button><h2 className="pr-10 font-heading text-xl font-bold">{mode === "opening" ? "Enter opening stock" : "Adjust stock"}</h2><p className="mt-1 text-xs text-[var(--text-muted)]">{selected.sku} / {selected.name}</p><div className="mt-6 space-y-4"><label className="block space-y-1 text-xs font-semibold">Location<select value={locationId} onChange={(event) => setLocationId(event.target.value)} className="block h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm">{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label><label className="block space-y-1 text-xs font-semibold">{mode === "opening" ? "Real counted quantity (zero is valid)" : "Adjustment (+ add, - remove)"}<input type="number" step="0.001" min={mode === "opening" ? 0 : undefined} value={quantity} onChange={(event) => setQuantity(event.target.value)} className="block h-11 w-full rounded-xl border border-gray-200 px-3 text-sm" /></label><label className="block space-y-1 text-xs font-semibold">Reason<textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Required audit reason" className="block w-full rounded-xl border border-gray-200 p-3 text-sm" /></label><Button type="button" onClick={save} disabled={saving || !locationId || reason.trim().length < 3 || quantity === ""} className="w-full">{saving && <Loader2 className="size-4 animate-spin" />}{saving ? "Saving..." : "Save audited stock change"}</Button></div></aside></>}

      <ProductModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        editingProduct={editingProduct}
        onSaveProduct={handleSaveProduct}
      />
    </div>
  )
}
