"use client"

import * as React from "react"
import { AdminCatalogueProduct } from "@/content/mock/catalogue-data"
import { Badge } from "@raza-stationers/ui"
import { Edit2 } from "lucide-react"

interface ProductListTableProps {
  products: AdminCatalogueProduct[]
  onEditProduct: (product: AdminCatalogueProduct) => void
}

export function ProductListTable({ products, onEditProduct }: ProductListTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white border border-[var(--border-subtle)] rounded-2xl p-12 text-center text-xs text-[var(--text-muted)] font-sans my-4">
        No products found in this category.
      </div>
    )
  }

  return (
    <div className="bg-white border border-[var(--border-subtle)] rounded-[16px] overflow-hidden shadow-xs">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--canvas)] text-[var(--sage-400)] text-[11px] uppercase tracking-wider font-semibold border-b border-[var(--border-subtle)]">
              <th className="py-3 px-5">SKU</th>
              <th className="py-3 px-5">Product Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Purchase Type</th>
              <th className="py-3 px-4">Wholesale Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] font-sans">
            {products.map((product) => {
              const isInactive = product.status === "inactive" || product.status === "archived"

              return (
                <tr
                  key={product.id}
                  className="hover:bg-[var(--canvas)] transition-colors animate-fadeIn"
                >
                  <td className="py-3.5 px-5 font-mono text-[11px] text-[var(--sage-400)] font-medium">
                    {product.sku || "N/A"}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-[var(--ink-900)]">
                    <div>{product.name}</div>
                    {product.shopName && (
                      <div className="text-[11px] font-normal text-[var(--text-muted)]">
                        {product.shopName}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[var(--ink-900)]">
                    {product.category || "General"}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-[var(--ink-900)]">
                    {product.purchaseType || "wholesale"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[var(--ink-900)]">
                    Rs {Number(product.price || 0).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {isInactive ? (
                      <Badge variant="secondary" className="bg-[var(--amber-tint)] text-[var(--amber-ink)] border-transparent font-medium text-[11px]">
                        Inactive
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-[var(--mist-100)] text-[var(--evergreen-600)] border-transparent font-medium text-[11px]">
                        Active
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => onEditProduct(product)}
                      className="font-semibold text-[var(--evergreen-600)] hover:underline inline-flex items-center gap-1 cursor-pointer text-xs"
                    >
                      <Edit2 size={13} />
                      Edit
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
