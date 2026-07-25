"use client"

import * as React from "react"
import { MOCK_SALES_TREND_POINTS } from "@/content/mock/accounting-data"

export function SalesTrendChart() {
  const maxSales = Math.max(...MOCK_SALES_TREND_POINTS.map((p) => p.sales)) || 1

  return (
    <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-5 shadow-xs font-sans">
      <div className="text-sm font-semibold text-[var(--ink-900)] mb-4">
        Sales trend
      </div>

      <div className="h-32 flex items-end gap-3 pt-4 px-2">
        {MOCK_SALES_TREND_POINTS.map((point, idx) => {
          const heightPct = Math.round((point.sales / maxSales) * 100)

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group"
            >
              {/* Tooltip value on hover */}
              <div className="text-[10px] font-semibold text-[var(--evergreen-600)] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Rs {(point.sales / 1000).toFixed(0)}k
              </div>

              {/* Bar */}
              <div
                style={{ height: `${heightPct}%` }}
                className="w-full bg-[var(--mist-100)] group-hover:bg-[var(--evergreen-600)] rounded-t-lg transition-all duration-200"
              />

              {/* Day Label */}
              <span className="text-[11px] text-[var(--text-muted)] mt-2 font-medium">
                {point.day}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
