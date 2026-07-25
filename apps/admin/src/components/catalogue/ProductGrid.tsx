"use client"

import * as React from "react"
import { AdminCatalogueProduct } from "@/content/mock/catalogue-data"
import { Package } from "lucide-react"

interface ProductGridProps {
  products: AdminCatalogueProduct[]
  onEditProduct: (product: AdminCatalogueProduct) => void
}

export function ProductGrid({ products, onEditProduct }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white border border-[var(--border-subtle)] rounded-2xl p-12 text-center text-xs text-[var(--text-muted)] font-sans my-4">
        No products found in this category.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const isLowStock = product.stock <= product.threshold

        return (
          <div
            key={product.id}
            className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-xs animate-fade-in flex flex-col justify-between"
          >
            {/* Top Icon Slot (No photography per design rule) */}
            <div className="w-full aspect-square bg-[var(--canvas)] flex flex-col items-center justify-center text-[var(--sage-400)] p-4">
              <Package className="w-12 h-12 stroke-1 text-[var(--sage-400)] mb-1" />
              <span className="text-[11px] font-mono text-[var(--sage-400)]">
                {product.sku}
              </span>
            </div>

            {/* Content Details */}
            <div className="p-3.5 font-sans flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[10.5px] text-[var(--sage-400)] uppercase tracking-wider font-semibold">
                  {product.category}
                </div>
                <div className="text-[13.5px] font-semibold text-[var(--ink-900)] mt-1 mb-2 leading-snug">
                  {product.name}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-bold text-[var(--ink-900)]">
                    Rs {product.price.toLocaleString()}
                  </span>
                  <span
                    className={`text-[11.5px] font-semibold ${
                      isLowStock ? "text-[#d93838]" : "text-[var(--evergreen-600)]"
                    }`}
                  >
                    {product.stock} {product.unit}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onEditProduct(product)}
                    className="text-xs font-semibold text-[var(--evergreen-600)] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <span className="text-[10px] text-[var(--text-muted)] capitalize">
                    {product.purchaseType}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
