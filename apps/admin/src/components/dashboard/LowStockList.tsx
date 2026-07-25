"use client"

import * as React from "react"
import Link from "next/link"
import { MOCK_LOW_STOCK } from "@/content/mock/dashboard-data"

export function LowStockList() {
  return (
    <div className="bg-white border border-[var(--border-subtle)] rounded-[16px] p-6">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[14px] font-semibold text-[var(--ink-900)]">
          Low stock alerts
        </div>
        <Link
          href="/stock"
          className="text-[12px] text-[var(--evergreen-600)] hover:underline font-medium"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        {MOCK_LOW_STOCK.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2.5 text-[13px]">
            <span className="text-[var(--ink-900)] font-medium truncate pr-2">
              {item.name}
            </span>
            <span className="font-bold text-[var(--amber-ink)] shrink-0">
              {item.stock} left
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
