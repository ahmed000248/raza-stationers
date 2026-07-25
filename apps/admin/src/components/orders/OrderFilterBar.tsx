"use client"

import * as React from "react"
import { AdminOrderStatus } from "@/content/mock/order-data"

export type OrderFilterType = "all" | AdminOrderStatus

interface OrderFilterBarProps {
  activeFilter: OrderFilterType
  onFilterChange: (filter: OrderFilterType) => void
}

const FILTER_ITEMS: { key: OrderFilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "dispatched", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
  { key: "rejected", label: "Rejected" },
]

export function OrderFilterBar({
  activeFilter,
  onFilterChange,
}: OrderFilterBarProps) {
  return (
    <div className="flex gap-2 my-5 flex-wrap">
      {FILTER_ITEMS.map((item) => {
        const isActive = activeFilter === item.key
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onFilterChange(item.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              isActive
                ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                : "bg-white text-[var(--forest-700)] border-[var(--border-subtle)] hover:bg-[var(--canvas)]"
            }`}
          >
            {item.label}
          </button>
        )}
      )}
    </div>
  )
}
