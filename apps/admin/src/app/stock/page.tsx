"use client"

import * as React from "react"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import {
  MOCK_STOCK_PRODUCTS,
  MOCK_STOCK_ENTRIES,
  StockProductItem,
  StockEntryItem,
} from "@/content/mock/stock-data"
import { LowStockTable } from "@/components/stock/LowStockTable"
import { StockEntriesTable } from "@/components/stock/StockEntriesTable"
import { LogRestockDialog } from "@/components/stock/LogRestockDialog"
import { StockCorrectionDialog } from "@/components/stock/StockCorrectionDialog"

export default function StockManagementPage() {
  const { role, addToast } = useAdminShell()
  const ownerRole = isOwner(role)

  const [products, setProducts] = React.useState<StockProductItem[]>(MOCK_STOCK_PRODUCTS)
  const [entries, setEntries] = React.useState<StockEntryItem[]>(MOCK_STOCK_ENTRIES)

  const [restockDialogOpen, setRestockDialogOpen] = React.useState<boolean>(false)
  const [correctionDialogOpen, setCorrectionDialogOpen] = React.useState<boolean>(false)

  // Handle Log Restock Save
  const handleSaveRestock = (newRestock: {
    productName: string
    qty: number
    price: number
    supplier: string
  }) => {
    const today = new Date().toISOString().split("T")[0]

    // Append entry
    const newEntry: StockEntryItem = {
      id: `ent-${Date.now()}`,
      date: today,
      product: newRestock.productName,
      qty: newRestock.qty,
      supplier: newRestock.supplier,
      price: newRestock.price,
      total: newRestock.qty * newRestock.price,
      type: "restock",
    }
    setEntries((prev) => [newEntry, ...prev])

    // Update product stock level
    setProducts((prev) =>
      prev.map((p) =>
        p.name === newRestock.productName
          ? { ...p, stock: p.stock + newRestock.qty }
          : p
      )
    )
  }

  // Handle Open Stock Correction Dialog
  const handleOpenCorrection = () => {
    if (!ownerRole) {
      addToast({
        title: "Owner only — ask the business owner for access",
        type: "warning",
      })
      return
    }
    setCorrectionDialogOpen(true)
  }

  // Handle Save Stock Correction
  const handleSaveCorrection = (newCorrection: {
    productName: string
    delta: number
    reason: string
  }) => {
    const today = new Date().toISOString().split("T")[0]

    // Append entry
    const newEntry: StockEntryItem = {
      id: `ent-${Date.now()}`,
      date: today,
      product: newCorrection.productName,
      qty: newCorrection.delta,
      reason: newCorrection.reason,
      supplier: "",
      price: 0,
      total: 0,
      type: "correction",
    }
    setEntries((prev) => [newEntry, ...prev])

    // Update product stock level (prevent negative stock)
    setProducts((prev) =>
      prev.map((p) =>
        p.name === newCorrection.productName
          ? { ...p, stock: Math.max(0, p.stock + newCorrection.delta) }
          : p
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">
            Stock Management
          </h1>
          <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">
            اسٹاک کا انتظام · inventory levels and restocking
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="default"
            onClick={() => setRestockDialogOpen(true)}
            className="h-10 text-xs px-4"
          >
            + Log Restock
          </Button>

          <Button
            variant="outline"
            onClick={handleOpenCorrection}
            className={`h-10 text-xs px-4 ${
              !ownerRole ? "opacity-60 cursor-pointer" : ""
            }`}
          >
            {ownerRole ? "Stock Correction" : "🔒 Stock Correction"}
          </Button>
        </div>
      </div>

      {/* Low Stock Section */}
      <LowStockTable products={products} />

      {/* Recent Stock Entries Section */}
      <StockEntriesTable entries={entries} />

      {/* Dialogs */}
      <LogRestockDialog
        open={restockDialogOpen}
        onClose={() => setRestockDialogOpen(false)}
        products={products}
        onSaveRestock={handleSaveRestock}
      />

      <StockCorrectionDialog
        open={correctionDialogOpen}
        onClose={() => setCorrectionDialogOpen(false)}
        products={products}
        onSaveCorrection={handleSaveCorrection}
      />
    </div>
  )
}
