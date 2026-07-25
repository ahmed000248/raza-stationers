"use client"

import * as React from "react"
import { AdminOrder } from "@/content/mock/order-data"
import { Badge } from "@raza-stationers/ui"

interface OrderTableProps {
  orders: AdminOrder[]
  sortDir: 0 | 1 | -1
  onToggleSortTotal: () => void
  onSelectOrder: (order: AdminOrder) => void
}

export function OrderTable({
  orders,
  sortDir,
  onToggleSortTotal,
  onSelectOrder,
}: OrderTableProps) {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
      case "packed":
      case "delivered":
        return { variant: "default" as const, className: "bg-[var(--mist-100)] text-[var(--evergreen-600)]" }
      case "dispatched":
        return { variant: "secondary" as const, className: "bg-amber-100 text-amber-800" }
      case "rejected":
        return { variant: "destructive" as const, className: "bg-red-100 text-red-800" }
      case "pending":
      default:
        return { variant: "secondary" as const, className: "bg-blue-50 text-blue-700" }
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="bg-[var(--canvas)] text-[var(--sage-400)] text-[11px] uppercase tracking-wider font-semibold border-b border-[var(--border-subtle)]">
              <th className="px-5 py-3">Order #</th>
              <th className="px-3 py-3">Client</th>
              <th
                className="px-3 py-3 cursor-pointer select-none"
                onClick={onToggleSortTotal}
              >
                Total {sortDir === 1 ? "↑" : sortDir === -1 ? "↓" : ""}
              </th>
              <th className="px-3 py-3">Status</th>
              <th className="px-5 py-3">Placed</th>
              <th className="px-5 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-xs text-[var(--text-muted)]"
                >
                  No orders found matching the selected filter.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const badgeStyle = getBadgeVariant(order.status)
                const dateObj = new Date(order.placedAt)
                const dateStr = dateObj.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-black/[0.01] transition-colors animate-fade-in"
                  >
                    <td className="px-5 py-3.5 font-semibold text-[var(--ink-900)]">
                      {order.id}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="font-semibold text-[var(--ink-900)]">
                        {order.client}
                      </div>
                      <div className="text-[11.5px] text-[var(--text-muted)]">
                        {order.city}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 font-semibold text-[var(--ink-900)]">
                      Rs {order.total.toLocaleString()}
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge
                        className={`text-[11px] px-2.5 py-0.5 font-medium ${badgeStyle.className}`}
                      >
                        {getStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-muted)] text-[12px]">
                      {dateStr}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order)}
                        className="text-xs font-semibold text-[var(--evergreen-600)] hover:underline cursor-pointer"
                      >
                        View
                      </button>
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
