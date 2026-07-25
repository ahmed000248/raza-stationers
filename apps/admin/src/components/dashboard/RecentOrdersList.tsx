"use client"

import * as React from "react"
import Link from "next/link"
import { MOCK_RECENT_ORDERS } from "@/content/mock/dashboard-data"

export function RecentOrdersList() {
  return (
    <div className="bg-white border border-[var(--border-subtle)] rounded-[16px] p-6">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[14px] font-semibold text-[var(--ink-900)]">
          Recent orders
        </div>
        <Link
          href="/orders"
          className="text-[12px] text-[var(--evergreen-600)] hover:underline font-medium"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        {MOCK_RECENT_ORDERS.map((order) => (
          <div key={order.id} className="flex justify-between items-center py-2.5 text-[13px]">
            <span className="text-[var(--ink-900)] font-medium truncate pr-2">
              <span className="text-[var(--text-muted)]">{order.id}</span> · {order.client}
            </span>
            <span className="font-semibold text-[var(--ink-900)] shrink-0">
              {order.totalFmt}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
