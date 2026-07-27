"use client"

import * as React from "react"

interface ExpensesAndOutstandingGridProps {
  expenses?: Array<{ id: string; category: string; description: string; amount: number; createdAt: string }>
  outstanding?: Array<{ id: string; businessName: string; creditLimit: number; creditDays: number }>
}

export function ExpensesAndOutstandingGrid({ expenses = [], outstanding = [] }: ExpensesAndOutstandingGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 text-sm font-semibold text-[var(--ink-900)] border-b border-[var(--border-subtle)]">Recent expenses</div>
        {expenses.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-[var(--text-muted)]">No expenses recorded.</div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)] max-h-64 overflow-y-auto">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center px-5 py-3.5 hover:bg-black/[0.01] transition-colors">
                <div>
                  <div className="text-xs font-semibold text-[var(--ink-900)]">{expense.category}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{expense.description || "—"}</div>
                </div>
                <div className="text-xs font-bold text-[var(--ink-900)]">Rs {Number(expense.amount).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 text-sm font-semibold text-[var(--ink-900)] border-b border-[var(--border-subtle)]">Outstanding credit</div>
        {outstanding.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-[var(--text-muted)]">No outstanding credit.</div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)] max-h-64 overflow-y-auto">
            {outstanding.map((c) => (
              <div key={c.id} className="flex justify-between items-center px-5 py-3.5 hover:bg-black/[0.01] transition-colors">
                <div>
                  <div className="text-xs font-semibold text-[var(--ink-900)]">{c.businessName}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Limit: Rs {Number(c.creditLimit).toLocaleString()} / {c.creditDays}d</div>
                </div>
                <div className="text-xs font-bold text-[#d93838]">Rs {Number(c.creditLimit).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
