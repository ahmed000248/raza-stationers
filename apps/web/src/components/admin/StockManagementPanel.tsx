"use client"

import * as React from "react"
import { mockProducts } from "@/content/mock/products"
import { mockStockMovements } from "@/content/mock/admin-data"
import { StockMovement } from "@raza-stationers/types"
import { validateStockAdjustmentReason } from "@/lib/admin-ops"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, AlertCircle, Plus, Minus, FileText } from "lucide-react"

export function StockManagementPanel() {
  const [movements, setMovements] = React.useState<StockMovement[]>(mockStockMovements)
  const [selectedProductId, setSelectedProductId] = React.useState("prod-1")
  const [quantityChange, setQuantityChange] = React.useState(100)
  const [reason, setReason] = React.useState("")
  const [movementType, setMovementType] = React.useState<"restock" | "adjustment">("restock")
  const [supplier, setSupplier] = React.useState("Century Paper Mills")
  const [error, setError] = React.useState("")

  const handleSubmitMovement = (e: React.FormEvent) => {
    e.preventDefault()

    if (movementType === "adjustment") {
      // FR-STK-07 Guard: Mandatory reason required for manual adjustments
      if (!validateStockAdjustmentReason(reason)) {
        setError("Mandatory reason required for manual stock adjustments (FR-STK-07). Minimum 5 characters.")
        return
      }
    }

    setError("")

    const newMovement: StockMovement = {
      id: `sm-${Date.now()}`,
      productId: selectedProductId,
      quantityChange: movementType === "adjustment" ? -Math.abs(quantityChange) : Math.abs(quantityChange),
      movementType,
      supplier: movementType === "restock" ? supplier : undefined,
      reason: movementType === "adjustment" ? reason : undefined,
      enteredByUserId: "u-staff-1",
      createdAt: new Date().toISOString(),
    }

    setMovements((prev) => [newMovement, ...prev])
    setReason("")
  }

  return (
    <div className="space-y-6 p-6 rounded-2xl border border-border bg-card shadow-xs">
      <div className="border-b border-border pb-4">
        <h3 className="font-heading font-bold text-base text-[var(--color-ink-900)] flex items-center gap-2">
          <Package className="size-4 text-[var(--color-evergreen-600)]" />
          <span>Inventory Stock Movements & Restock (FR-STK-01..07)</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Record routine restock shipments or submit manual stock corrections with mandatory audit reasons (FR-STK-07).
        </p>
      </div>

      {/* Movement Entry Form */}
      <form onSubmit={handleSubmitMovement} className="p-4 rounded-xl bg-muted/40 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Record Inventory Stock Action</span>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => setMovementType("restock")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                movementType === "restock" ? "bg-[var(--color-evergreen-600)] text-white" : "bg-card text-muted-foreground"
              }`}
            >
              Routine Restock
            </button>
            <button
              type="button"
              onClick={() => setMovementType("adjustment")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                movementType === "adjustment" ? "bg-amber-600 text-white" : "bg-card text-muted-foreground"
              }`}
            >
              Manual Adjustment (FR-STK-07)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none"
            >
              {mockProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.currentQuantity})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              {movementType === "adjustment" ? "Units to Deduct / Add" : "Restock Quantity"}
            </label>
            <Input
              type="number"
              value={quantityChange}
              onChange={(e) => setQuantityChange(parseInt(e.target.value, 10) || 0)}
            />
          </div>

          {movementType === "restock" ? (
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Supplier Name</label>
              <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-1 sm:col-span-1">
              <label className="font-semibold text-foreground">Mandatory Reason (FR-STK-07) *</label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Damaged reams during warehouse rain leak"
                className={error ? "border-destructive" : ""}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-1.5 animate-shake">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="sm" className="rounded-full gap-1.5 font-semibold">
            <Package className="size-4" />
            <span>Submit Stock Entry</span>
          </Button>
        </div>
      </form>

      {/* Movement History Log Table */}
      <div className="space-y-3">
        <h4 className="font-heading font-semibold text-sm text-[var(--color-ink-900)]">
          Audit Log of Recent Stock Movements
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-2">Date</th>
                <th className="py-2.5 px-2">Type</th>
                <th className="py-2.5 px-2">Qty Change</th>
                <th className="py-2.5 px-2">Supplier / Reason Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {movements.map((mov) => (
                <tr key={mov.id} className="hover:bg-muted/20">
                  <td className="py-2.5 px-2 text-muted-foreground">{mov.createdAt.split("T")[0]}</td>
                  <td className="py-2.5 px-2">
                    <Badge variant={mov.movementType === "restock" ? "evergreen" : "amber"}>
                      {mov.movementType}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-2 font-bold">
                    {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange}
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground">
                    {mov.supplier || mov.reason || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
