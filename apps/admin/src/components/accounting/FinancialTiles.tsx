"use client"

import * as React from "react"

interface FinancialTilesProps {
  summary?: { totalRevenue: number; totalExpenses: number; netProfit: number; totalOrders: number; pendingInvoices: number }
  outstandingTotal?: number
}

export function FinancialTiles({ summary, outstandingTotal = 0 }: FinancialTilesProps) {
  const revenue = Number(summary?.totalRevenue || 0)
  const expenses = Number(summary?.totalExpenses || 0)
  const net = Number(summary?.netProfit || 0)

  const tiles = [
    { label: "Revenue (delivered)", value: `Rs ${revenue.toLocaleString()}`, color: "text-[var(--evergreen-600)]" },
    { label: "Expenses", value: `Rs ${expenses.toLocaleString()}`, color: "text-[#d93838]" },
    { label: "Net", value: `Rs ${net.toLocaleString()}`, color: net >= 0 ? "text-[var(--evergreen-600)]" : "text-[#d93838]" },
    { label: "Outstanding Credit", value: `Rs ${outstandingTotal.toLocaleString()}`, color: "text-[var(--ink-900)]" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-[var(--text-muted)] mb-1">{tile.label}</div>
          <div className={`text-xl font-bold ${tile.color}`}>{tile.value}</div>
        </div>
      ))}
    </div>
  )
}
