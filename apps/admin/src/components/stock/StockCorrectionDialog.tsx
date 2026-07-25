"use client"

import * as React from "react"
import { Button, Dialog, DialogHeader, DialogTitle } from "@raza-stationers/ui"
import { StockProductItem } from "@/content/mock/stock-data"
import { useAdminShell } from "@/components/shell/AdminShell"

interface StockCorrectionDialogProps {
  open: boolean
  onClose: () => void
  products: StockProductItem[]
  onSaveCorrection: (correction: {
    productName: string
    delta: number
    reason: string
  }) => void
}

export function StockCorrectionDialog({
  open,
  onClose,
  products,
  onSaveCorrection,
}: StockCorrectionDialogProps) {
  const { addToast } = useAdminShell()
  const [selectedProduct, setSelectedProduct] = React.useState<string>("")
  const [delta, setDelta] = React.useState<string>("")
  const [reason, setReason] = React.useState<string>("")

  React.useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0].name)
    }
  }, [products, selectedProduct])

  const deltaNum = Number(delta)
  const isSaveDisabled =
    !delta || isNaN(deltaNum) || deltaNum === 0 || !reason.trim()

  const handleSave = () => {
    if (isSaveDisabled) return

    onSaveCorrection({
      productName: selectedProduct,
      delta: deltaNum,
      reason: reason.trim(),
    })

    addToast({
      title: "Stock correction recorded — written to audit log",
      description: `Adjustment of ${deltaNum > 0 ? `+${deltaNum}` : deltaNum} applied to ${selectedProduct}`,
      type: "success",
    })

    // Reset and close
    setDelta("")
    setReason("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div>
        <DialogHeader className="mb-2">
          <DialogTitle className="font-heading text-lg font-semibold text-[var(--ink-900)]">
            Stock Correction
          </DialogTitle>
          <div className="text-xs text-[var(--text-muted)] font-sans">
            Owner only · manual adjustment outside routine restock, always logged
          </div>
        </DialogHeader>

        <div className="space-y-3.5 font-sans mt-3">
          {/* Product Select */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Select product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)] bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Delta */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Quantity change (use − for write-off, + to add)
            </label>
            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="e.g. -14 or 20"
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)]"
            />
          </div>

          {/* Reason textarea */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Reason (required)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. damaged in storage, miscount correction"
              rows={3}
              className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)] resize-y"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2.5 mt-6 justify-end">
          <Button variant="outline" onClick={onClose} className="h-10 text-xs px-4">
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="h-10 text-xs px-5"
          >
            Save correction
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
