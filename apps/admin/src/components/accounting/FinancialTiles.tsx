"use client"

import * as React from "react"
import { MOCK_ORDERS } from "@/content/mock/order-data"
import { MOCK_CLIENTS } from "@/content/mock/client-data"
import { MOCK_EXPENSES } from "@/content/mock/accounting-data"

export function FinancialTiles() {
  const revenueTotal = React.useMemo(() => {
    return MOCK_ORDERS.filter((o) => o.status === "delivered").reduce(
      (acc, o) => acc + o.total,
      0
    )
  }, [])

  const expensesTotal = React.useMemo(() => {
    return MOCK_EXPENSES.reduce((acc, e) => acc + e.amount, 0)
  }, [])

  const netIncome = revenueTotal - expensesTotal

  const outstandingTotal = React.useMemo(() => {
    return MOCK_CLIENTS.reduce((acc, c) => acc + c.outstandingBalance, 0)
  }, [])

  const tiles = [
    {
      label: "Revenue (delivered)",
      value: `Rs ${revenueTotal.toLocaleString()}`,
      color: "text-[var(--evergreen-600)]",
    },
    {
      label: "Expenses (this month)",
      value: `Rs ${expensesTotal.toLocaleString()}`,
      color: "text-[#d93838]",
    },
    {
      label: "Net",
      value: `Rs ${netIncome.toLocaleString()}`,
      color: "text-[var(--ink-900)]",
    },
    {
      label: "Outstanding (all clients)",
      value: `Rs ${outstandingTotal.toLocaleString()}`,
      color: "text-amber-700",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {tiles.map((tile, idx) => (
        <div
          key={idx}
          className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs font-sans"
        >
          <div className="text-xs text-[var(--text-muted)] font-medium">
            {tile.label}
          </div>
          <div
            className={`text-2xl font-bold mt-2 ${tile.color}`}
          >
            {tile.value}
          </div>
        </div>
      ))}
    </div>
  )
}
