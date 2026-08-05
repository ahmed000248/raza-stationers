"use client"

import * as React from "react"
import { Button } from "@raza-stationers/ui"
import { CategoryFilterBar } from "@/components/catalogue/CategoryFilterBar"
import { ProductListTable } from "@/components/catalogue/ProductListTable"
import { ProductModal } from "@/components/catalogue/ProductModal"
import { BulkImportModal } from "@/components/catalogue/BulkImportModal"
import { createAPIClient } from "@raza-stationers/api"
import { Loader2, Search } from "lucide-react"
import { getApiBaseUrl } from "@/lib/public-config"

const API_BASE = getApiBaseUrl()

export default function ProductCataloguePage() {
  const [products, setProducts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string>("all")
  const [productModalOpen, setProductModalOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<any>(null)
  const [bulkImportModalOpen, setBulkImportModalOpen] = React.useState(false)

  const api = React.useMemo(() => createAPIClient({ baseUrl: API_BASE }), [])

  const fetchAll = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getAdminProducts({ limit: 500 })
      setProducts(data.items || [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [api])

  React.useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const mapToGrid = (p: any) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category?.name || "",
    price: Number(p.packaging?.[0]?.prices?.[0]?.amount || 0),
    stock: 0,
    threshold: 10,
    unit: "pc",
    purchaseType: p.purchaseType,
    status: p.status,
    shopName: p.shopName,
    description: p.description,
    packagingCount: p._count?.packaging || 0,
  })

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setProductModalOpen(true)
  }

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product)
    setProductModalOpen(true)
  }

  const handleSaveProduct = async (input: any) => {
    try {
      if (input.id) {
        await api.updateProduct(input.id, {
          name: input.name,
          categoryId: input.categoryId,
          shopName: input.shopName,
          description: input.description,
          purchaseType: input.purchaseType,
        })
      } else {
        await api.createProduct({
          name: input.name,
          categoryId: input.categoryId,
          purchaseType: input.purchaseType,
          shopName: input.shopName,
          description: input.description,
          wholesalePrice: input.price,
        })
      }
      setProductModalOpen(false)
      fetchAll()
    } catch {}
  }

  const filteredProducts = products.filter((p: any) => {
    const matchesCategory =
      activeCategory === "all" ||
      p.category?.slug === activeCategory ||
      p.category?.name === activeCategory

    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)

    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Product Catalogue</h1>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            {filteredProducts.length} of {products.length} products
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" onClick={() => setBulkImportModalOpen(true)} className="h-10 text-xs px-4">
            Bulk Import
          </Button>
          <Button variant="default" onClick={handleOpenAdd} className="h-10 text-xs px-4">
            + Add product
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <CategoryFilterBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-xs outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ProductListTable products={filteredProducts.map(mapToGrid)} onEditProduct={handleOpenEdit} />
      )}

      <ProductModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        editingProduct={editingProduct ? mapToGrid(editingProduct) : null}
        onSaveProduct={handleSaveProduct}
      />
      <BulkImportModal
        open={bulkImportModalOpen}
        onClose={() => setBulkImportModalOpen(false)}
        onImportValidProducts={() => {}}
      />
    </div>
  )
}
