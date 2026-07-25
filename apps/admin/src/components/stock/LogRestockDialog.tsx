"use client"

import * as React from "react"
import { Button, Dialog, DialogHeader, DialogTitle } from "@raza-stationers/ui"
import { StockProductItem, MOCK_SUPPLIERS } from "@/content/mock/stock-data"
import { useAdminShell } from "@/components/shell/AdminShell"

interface LogRestockDialogProps {
  open: boolean
  onClose: () => void
  products: StockProductItem[]
  onSaveRestock: (entry: {
    productName: string
    qty: number
    price: number
    supplier: string
  }) => void
}

export function LogRestockDialog({
  open,
  onClose,
  products,
  onSaveRestock,
}: LogRestockDialogProps) {
  const { addToast } = useAdminShell()
  const [selectedProduct, setSelectedProduct] = React.useState<string>("")
  const [qty, setQty] = React.useState<string>("")
  const [price, setPrice] = React.useState<string>("")
  const [supplier, setSupplier] = React.useState<string>(MOCK_SUPPLIERS[0] || "")

  React.useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0].name)
    }
  }, [products, selectedProduct])

  const handleSave = () => {
    const qtyNum = Number(qty)
    const priceNum = Number(price)

    if (!qtyNum || qtyNum <= 0 || !priceNum || priceNum <= 0) {
      addToast({
        title: "Validation error",
        description: "Please enter a valid quantity and unit cost.",
        type: "error",
      })
      return
    }

    onSaveRestock({
      productName: selectedProduct,
      qty: qtyNum,
      price: priceNum,
      supplier,
    })

    addToast({
      title: "Stock entry recorded",
      description: `Added ${qtyNum} units to ${selectedProduct}`,
      type: "success",
    })

    // Reset and close
    setQty("")
    setPrice("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div>
        <DialogHeader className="mb-4">
          <DialogTitle className="font-heading text-lg font-semibold text-[var(--ink-900)]">
            Record stock entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5 font-sans">
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

          {/* Quantity & Unit Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Quantity"
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                Unit cost (Rs)
              </label>
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Unit cost (Rs)"
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)]"
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Supplier
            </label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)] bg-white"
            >
              {MOCK_SUPPLIERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2.5 mt-6 justify-end">
          <Button variant="outline" onClick={onClose} className="h-10 text-xs px-4">
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave} className="h-10 text-xs px-5">
            Save entry
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
