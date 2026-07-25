"use client"

import * as React from "react"
import { Button, Dialog, DialogHeader, DialogTitle } from "@raza-stationers/ui"
import {
  AdminCatalogueProduct,
  MOCK_CATEGORIES,
} from "@/content/mock/catalogue-data"
import { ProductPurchaseType } from "@raza-stationers/types"
import { useAdminShell } from "@/components/shell/AdminShell"

interface ProductModalProps {
  open: boolean
  onClose: () => void
  editingProduct: AdminCatalogueProduct | null
  onSaveProduct: (product: {
    id?: string
    name: string
    category: string
    price: number
    stock: number
    purchaseType: ProductPurchaseType
  }) => void
}

export function ProductModal({
  open,
  onClose,
  editingProduct,
  onSaveProduct,
}: ProductModalProps) {
  const { addToast } = useAdminShell()
  const [name, setName] = React.useState<string>("")
  const [category, setCategory] = React.useState<string>(MOCK_CATEGORIES[0] || "")
  const [price, setPrice] = React.useState<string>("")
  const [stock, setStock] = React.useState<string>("")
  const [purchaseType, setPurchaseType] = React.useState<ProductPurchaseType>("both")

  React.useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name)
      setCategory(editingProduct.category)
      setPrice(editingProduct.price.toString())
      setStock(editingProduct.stock.toString())
      setPurchaseType(editingProduct.purchaseType || "both")
    } else {
      setName("")
      setCategory(MOCK_CATEGORIES[0] || "")
      setPrice("")
      setStock("")
      setPurchaseType("both")
    }
  }, [editingProduct, open])

  const isEditing = !!editingProduct

  const handleSave = () => {
    if (!name.trim()) {
      addToast({
        title: "Validation error",
        description: "Product name is required.",
        type: "error",
      })
      return
    }

    const priceNum = Number(price)
    const stockNum = Number(stock)

    if (isNaN(priceNum) || priceNum < 0) {
      addToast({
        title: "Validation error",
        description: "Please enter a valid price.",
        type: "error",
      })
      return
    }

    onSaveProduct({
      id: editingProduct?.id,
      name: name.trim(),
      category,
      price: priceNum,
      stock: isNaN(stockNum) ? 0 : stockNum,
      purchaseType,
    })

    addToast({
      title: isEditing ? "Product updated" : "Product added",
      description: `${name.trim()} has been ${isEditing ? "updated" : "added"} successfully.`,
      type: "success",
    })

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div>
        <DialogHeader className="mb-4">
          <DialogTitle className="font-heading text-lg font-semibold text-[var(--ink-900)]">
            {isEditing ? "Edit product" : "Add product"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5 font-sans">
          {/* Product Name */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Product name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dollar Ballpoint Pen Blue"
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)] bg-white"
            >
              {MOCK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                Price (Rs)
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price (Rs)"
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock"
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)]"
              />
            </div>
          </div>

          {/* Purchase Type */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Purchase Type
            </label>
            <select
              value={purchaseType}
              onChange={(e) =>
                setPurchaseType(e.target.value as ProductPurchaseType)
              }
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)] bg-white"
            >
              <option value="both">Individual & Bulk (Both)</option>
              <option value="individual">Individual Only</option>
              <option value="bulk">Bulk Pack Only</option>
            </select>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2.5 mt-6 justify-end">
          <Button variant="outline" onClick={onClose} className="h-10 text-xs px-4">
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave} className="h-10 text-xs px-5">
            {isEditing ? "Save changes" : "Add product"}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
