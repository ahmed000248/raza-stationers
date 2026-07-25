"use client"

import * as React from "react"
import { StockEntryItem } from "@/content/mock/stock-data"
import { Badge } from "@raza-stationers/ui"

interface StockEntriesTableProps {
  entries: StockEntryItem[]
}

export function StockEntriesTable({ entries }: StockEntriesTableProps) {
  return (
    <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs">
      <div className="px-5 py-4 text-sm font-semibold text-[var(--ink-900)] border-b border-[var(--border-subtle)]">
        Recent stock entries
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="bg-[var(--canvas)] text-[var(--sage-400)] text-[11px] uppercase tracking-wider font-semibold border-b border-[var(--border-subtle)]">
              <th className="px-5 py-2.5">Date</th>
              <th className="px-3 py-2.5">Product</th>
              <th className="px-3 py-2.5">Qty</th>
              <th className="px-3 py-2.5">Supplier / Reason</th>
              <th className="px-5 py-2.5">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-6 text-center text-xs text-[var(--text-muted)]"
                >
                  No stock entries recorded yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const isCorrection = entry.type === "correction"
                const qtyFormatted =
                  entry.qty > 0 ? `+${entry.qty}` : `${entry.qty}`
                const totalFormatted =
                  isCorrection || !entry.total
                    ? "—"
                    : `Rs ${entry.total.toLocaleString()}`

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-black/[0.01] transition-colors animate-fade-in"
                  >
                    <td className="px-5 py-3.5 text-[var(--ink-900)] whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="px-3 py-3.5 font-semibold text-[var(--ink-900)]">
                      <div>{entry.product}</div>
                      <div className="mt-1">
                        <Badge
                          variant={isCorrection ? "secondary" : "default"}
                          className={`text-[10px] px-2 py-0.5 font-medium ${
                            isCorrection
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              : "bg-[var(--mist-100)] text-[var(--evergreen-600)] hover:bg-[var(--mist-100)]"
                          }`}
                        >
                          {isCorrection ? "Correction" : "Restock"}
                        </Badge>
                      </div>
                    </td>
                    <td
                      className={`px-3 py-3.5 font-semibold ${
                        entry.qty < 0 ? "text-[#d93838]" : "text-[var(--ink-900)]"
                      }`}
                    >
                      {qtyFormatted}
                    </td>
                    <td className="px-3 py-3.5 text-[var(--text-muted)]">
                      {isCorrection ? entry.reason : entry.supplier}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[var(--ink-900)]">
                      {totalFormatted}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
