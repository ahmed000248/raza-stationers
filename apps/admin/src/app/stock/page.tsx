"use client"

import * as React from "react"
import { Plus, Search, X, Edit2 } from "lucide-react"
import { Badge, Button } from "@raza-stationers/ui"
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
  const { role } = useAdminShell()
  const [items] = React.useState<any[]>([])
  const [locations] = React.useState<any[]>([])
  const [search, setSearch] = React.useState("")
  const [stockState, setStockState] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages] = React.useState(1)
  const [selected, setSelected] = React.useState<any>(null)
  const [mode, setMode] = React.useState<"opening" | "adjustment">("opening")
  const [quantity, setQuantity] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [locationId, setLocationId] = React.useState("")

  const [productModalOpen, setProductModalOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<any>(null)

  const canEdit = role === "owner" || role === "admin"

  const handleOpenAddProduct = () => {
    setEditingProduct(null)
    setProductModalOpen(true)
  }

  const handleOpenEditProduct = (item: any) => {
    setEditingProduct(item)
    setProductModalOpen(true)
  }

  const handleSaveProduct = async () => {
    alert("Backend rebuild in progress. Stock changes are disabled.")
    setProductModalOpen(false)
  }

  const save = async () => {
    alert("Backend rebuild in progress. Stock changes are disabled.")
    setSelected(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Stock Management</h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Opening stock and inventory ledger (Backend Rebuild in Progress)</p>
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

      <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-white">
        <table className="w-full min-w-[820px] text-left text-xs">
          <thead className="bg-[var(--canvas)] text-[var(--text-muted)]"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">State</th><th className="px-4 py-3">On hand</th><th className="px-4 py-3">Reserved</th><th className="px-4 py-3">Available</th><th className="px-4 py-3">Last audited change</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">{items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3"><p className="font-semibold">{item.name}</p><p className="text-[var(--text-muted)]">{item.sku}</p></td>
              <td className="px-4 py-3"><Badge>{String(item.stockState).replaceAll("_", " ")}</Badge></td>
              <td className="px-4 py-3 font-semibold">{item.onHand}</td>
              <td className="px-4 py-3">{item.reserved}</td>
              <td className="px-4 py-3">{item.available}</td>
              <td className="max-w-80 px-4 py-3 text-[var(--text-muted)]">No ledger entry</td>
              <td className="px-4 py-3 text-right">
                {canEdit && (
                  <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="outline" className="h-8 text-xs px-2.5" onClick={() => handleOpenEditProduct(item)}>
                      <Edit2 className="size-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {selected && <><button type="button" onClick={() => setSelected(null)} aria-label="Close stock form" className="fixed inset-0 z-40 bg-black/40" /><aside role="dialog" aria-modal="true" className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl"><button type="button" onClick={() => setSelected(null)} className="absolute right-4 top-4 p-2" aria-label="Close"><X className="size-5" /></button><h2 className="pr-10 font-heading text-xl font-bold">{mode === "opening" ? "Enter opening stock" : "Adjust stock"}</h2><div className="mt-6 space-y-4"><Button type="button" onClick={save} className="w-full">Save audited stock change</Button></div></aside></>}

      <ProductModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        editingProduct={editingProduct}
        onSaveProduct={handleSaveProduct}
      />
    </div>
  )
}
