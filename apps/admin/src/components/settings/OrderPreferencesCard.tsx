"use client"

import * as React from "react"

interface OrderPreferencesCardProps {
  requireApproval: boolean
  stockAlert: boolean
  packingView: boolean
  onToggleApproval: () => void
  onToggleStockAlert: () => void
  onTogglePackingView: () => void
}

export function OrderPreferencesCard({
  requireApproval,
  stockAlert,
  packingView,
  onToggleApproval,
  onToggleStockAlert,
  onTogglePackingView,
}: OrderPreferencesCardProps) {
  const preferences = [
    {
      id: "approval",
      label: "Require owner approval for new wholesale accounts",
      active: requireApproval,
      onToggle: onToggleApproval,
    },
    {
      id: "stock",
      label: "Auto-notify on low stock",
      active: stockAlert,
      onToggle: onToggleStockAlert,
    },
    {
      id: "packing",
      label: "Allow packing staff to view order queue",
      active: packingView,
      onToggle: onTogglePackingView,
    },
  ]

  return (
    <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-4 shadow-xs font-sans">
      <div className="text-sm font-semibold text-[var(--ink-900)] mb-4">
        Order preferences
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {preferences.map((pref) => (
          <div
            key={pref.id}
            className="flex items-center justify-between py-3.5"
          >
            <span className="text-xs font-medium text-[var(--ink-900)] pr-4">
              {pref.label}
            </span>

            <button
              type="button"
              onClick={pref.onToggle}
              className={`w-[38px] h-[22px] rounded-full relative cursor-pointer transition-colors duration-150 block shrink-0 ${
                pref.active
                  ? "bg-[var(--evergreen-600)]"
                  : "bg-gray-200"
              }`}
              aria-label={`Toggle ${pref.label}`}
            >
              <span
                className={`w-[18px] h-[18px] rounded-full bg-white absolute top-0.5 transition-all duration-150 block shadow-xs ${
                  pref.active ? "left-[18px]" : "left-[2px]"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
