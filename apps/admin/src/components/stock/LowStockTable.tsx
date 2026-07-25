"use client"

import * as React from "react"
import { StockProductItem } from "@/content/mock/stock-data"

interface LowStockTableProps {
  products: StockProductItem[]
}

export function LowStockTable({ products }: LowStockTableProps) {
  const lowStockProducts = React.useMemo(
    () => products.filter((p) => p.stock <= p.threshold),
    [products]
  )

  return (
    <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs my-5">
      <div className="px-5 py-4 text-sm font-semibold text-[var(--ink-900)] border-b border-[var(--border-subtle)]">
        Low stock (at or below reorder threshold)
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="bg-[var(--canvas)] text-[var(--sage-400)] text-[11px] uppercase tracking-wider font-semibold border-b border-[var(--border-subtle)]">
              <th className="px-5 py-2.5">Product</th>
              <th className="px-3 py-2.5">SKU</th>
              <th className="px-3 py-2.5">In stock</th>
              <th className="px-5 py-2.5">Threshold</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {lowStockProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-6 text-center text-xs text-[var(--text-muted)]"
                >
                  All products are currently above their reorder thresholds.
                </td>
              </tr>
            ) : (
              lowStockProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-black/[0.01] transition-colors animate-fade-in"
                >
                  <td className="px-5 py-3.5 font-semibold text-[var(--ink-900)]">
                    {product.name}
                  </td>
                  <td className="px-3 py-3.5 text-[var(--text-muted)] font-mono text-[11px]">
                    {product.sku}
                  </td>
                  <td className="px-3 py-3.5 font-bold text-[#d93838]">
                    {product.stock} {product.unit}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-muted)]">
                    {product.threshold} {product.unit}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
