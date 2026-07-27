"use client"

import * as React from "react"

interface SalesTrendChartProps {
  data?: Array<{ month: string; revenue: number }>
}

export function SalesTrendChart({ data = [] }: SalesTrendChartProps) {
  if (data.length === 0) {
    return <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-5 shadow-xs"><div className="text-sm font-semibold mb-4">Sales trend</div><p className="text-xs text-muted-foreground">No sales data yet.</p></div>
  }

  const maxSales = Math.max(...data.map((p) => p.revenue)) || 1

  return (
    <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-5 shadow-xs">
      <div className="text-sm font-semibold text-[var(--ink-900)] mb-4">Sales trend</div>
      <div className="h-32 flex items-end gap-3 pt-4 px-2">
        {data.map((point, idx) => {
          const heightPct = Math.round((point.revenue / maxSales) * 100)
          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="text-[10px] font-semibold text-[var(--evergreen-600)] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">Rs {(point.revenue / 1000).toFixed(0)}k</div>
              <div className="w-full rounded-[4px] bg-[var(--evergreen-600)]/70 hover:bg-[var(--evergreen-600)] transition-colors cursor-pointer" style={{ height: `${heightPct}%` }} />
              <div className="text-[10px] text-[var(--text-muted)] mt-1.5">{point.month.slice(5)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
