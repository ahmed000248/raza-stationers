"use client"

import * as React from "react"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { LowStockTable } from "@/components/stock/LowStockTable"
import { StockEntriesTable } from "@/components/stock/StockEntriesTable"
import { LogRestockDialog } from "@/components/stock/LogRestockDialog"
import { StockCorrectionDialog } from "@/components/stock/StockCorrectionDialog"
import { createAPIClient } from "@raza-stationers/api"
import { Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function StockManagementPage() {
  const { role, addToast } = useAdminShell()
  const ownerRole = isOwner(role)
  const [products, setProducts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const api = createAPIClient({ baseUrl: API_BASE })
    api.getAllStock().then((data: any) => setProducts(data.items || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const lowStockItems = products.filter((p: any) => {
    const available = Number(p.onHandQuantity || 0) - Number(p.reservedQuantity || 0)
    return available < 10
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-heading text-2xl font-bold">Stock Management</h1><p className="text-xs text-[var(--text-muted)] mt-1">Track inventory levels and movements</p></div>
        <div className="flex items-center gap-2">
          {ownerRole && <Button variant="secondary" className="h-9 text-xs rounded-lg">Restock Product</Button>}
          {ownerRole && <Button variant="secondary" className="h-9 text-xs rounded-lg">Stock Correction</Button>}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div> : (
        <LowStockTable products={lowStockItems.map((p: any) => ({ id: p.product?.id, name: p.product?.name, sku: p.product?.sku, stock: Number(p.onHandQuantity || 0) - Number(p.reservedQuantity || 0), threshold: 10, location: p.stockLocation?.name, unit: "Pc" }))} />
      )}
      <StockEntriesTable entries={[]} />
    </div>
  )
}
