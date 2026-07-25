"use client"

import * as React from "react"
import { MOCK_EXPENSES } from "@/content/mock/accounting-data"
import { MOCK_CLIENTS } from "@/content/mock/client-data"

export function ExpensesAndOutstandingGrid() {
  const clientsWithOutstanding = React.useMemo(() => {
    return MOCK_CLIENTS.filter((c) => c.outstandingBalance > 0).sort(
      (a, b) => b.outstandingBalance - a.outstandingBalance
    )
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
      {/* Recent Expenses Card */}
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 text-sm font-semibold text-[var(--ink-900)] border-b border-[var(--border-subtle)]">
          Recent expenses
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {MOCK_EXPENSES.map((expense) => (
            <div
              key={expense.id}
              className="flex justify-between items-center px-5 py-3.5 hover:bg-black/[0.01] transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-[var(--ink-900)]">
                  {expense.category}
                </div>
                <div className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
                  {expense.date} · {expense.note}
                </div>
              </div>
              <div className="text-xs font-bold text-[#d93838]">
                Rs {expense.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outstanding by Client Card */}
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 text-sm font-semibold text-[var(--ink-900)] border-b border-[var(--border-subtle)]">
          Outstanding by client
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {clientsWithOutstanding.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-muted)]">
              No clients currently have an outstanding balance.
            </div>
          ) : (
            clientsWithOutstanding.map((client) => (
              <div
                key={client.id}
                className="flex justify-between items-center px-5 py-3.5 hover:bg-black/[0.01] transition-colors"
              >
                <div className="text-xs font-semibold text-[var(--ink-900)]">
                  {client.businessName}
                </div>
                <div className="text-xs font-bold text-[#d93838]">
                  Rs {client.outstandingBalance.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
