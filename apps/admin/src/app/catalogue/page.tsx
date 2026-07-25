"use client"

import * as React from "react"
import { Button } from "@raza-stationers/ui"
import {
  MOCK_CATALOGUE_PRODUCTS,
  AdminCatalogueProduct,
} from "@/content/mock/catalogue-data"
import { CategoryFilterBar } from "@/components/catalogue/CategoryFilterBar"
import { ProductGrid } from "@/components/catalogue/ProductGrid"
import { ProductModal } from "@/components/catalogue/ProductModal"
import { BulkImportModal } from "@/components/catalogue/BulkImportModal"
import { ProductPurchaseType } from "@raza-stationers/types"

export default function ProductCataloguePage() {
  const [products, setProducts] = React.useState<AdminCatalogueProduct[]>(
    MOCK_CATALOGUE_PRODUCTS
  )
  const [activeCategory, setActiveCategory] = React.useState<string>("all")
  const [productModalOpen, setProductModalOpen] = React.useState<boolean>(false)
  const [editingProduct, setEditingProduct] = React.useState<AdminCatalogueProduct | null>(
    null
  )
  const [bulkImportModalOpen, setBulkImportModalOpen] = React.useState<boolean>(false)

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setProductModalOpen(true)
  }

  const handleOpenEdit = (product: AdminCatalogueProduct) => {
    setEditingProduct(product)
    setProductModalOpen(true)
  }

  const handleSaveProduct = (input: {
    id?: string
    name: string
    category: string
    price: number
    stock: number
    purchaseType: ProductPurchaseType
  }) => {
    if (input.id) {
      // Edit existing
      setProducts((prev) =>
        prev.map((p) =>
          p.id === input.id
            ? {
                ...p,
                name: input.name,
                category: input.category,
                price: input.price,
                stock: input.stock,
                purchaseType: input.purchaseType,
              }
            : p
        )
      )
    } else {
      // Add new
      const newProduct: AdminCatalogueProduct = {
        id: `p-${Date.now()}`,
        sku: `RS-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
        name: input.name,
        category: input.category,
        price: input.price,
        stock: input.stock,
        threshold: 15,
        unit: "pc",
        purchaseType: input.purchaseType,
      }
      setProducts((prev) => [newProduct, ...prev])
    }
  }

  const handleImportValidProducts = (newProducts: AdminCatalogueProduct[]) => {
    setProducts((prev) => [...newProducts, ...prev])
  }

  // Filter products by category
  const filteredProducts = React.useMemo(() => {
    if (activeCategory === "all") return products
    return products.filter((p) => p.category === activeCategory)
  }, [products, activeCategory])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">
            Product Catalogue
          </h1>
          <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">
            مصنوعات کیٹلاگ · {products.length} products
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setBulkImportModalOpen(true)}
            className="h-10 text-xs px-4"
          >
            Bulk Import
          </Button>

          <Button
            variant="default"
            onClick={handleOpenAdd}
            className="h-10 text-xs px-4"
          >
            + Add product
          </Button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <CategoryFilterBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Product Grid */}
      <ProductGrid
        products={filteredProducts}
        onEditProduct={handleOpenEdit}
      />

      {/* Product Add/Edit Modal */}
      <ProductModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        editingProduct={editingProduct}
        onSaveProduct={handleSaveProduct}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        open={bulkImportModalOpen}
        onClose={() => setBulkImportModalOpen(false)}
        onImportValidProducts={handleImportValidProducts}
      />
    </div>
  )
}
