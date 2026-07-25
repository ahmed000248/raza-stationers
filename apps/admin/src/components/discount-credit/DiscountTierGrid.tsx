"use client"

import * as React from "react"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"

export interface DiscountTier {
  id: string
  name: string
  pct: number
  minOrder: number
}

const INITIAL_TIERS: DiscountTier[] = [
  { id: "t1", name: "Tier 1", pct: 5, minOrder: 10000 },
  { id: "t2", name: "Tier 2", pct: 10, minOrder: 25000 },
  { id: "t3", name: "Tier 3", pct: 15, minOrder: 50000 },
  { id: "t4", name: "Tier 4", pct: 20, minOrder: 100000 },
]

export function DiscountTierGrid() {
  const { addToast } = useAdminShell()
  const [tiers, setTiers] = React.useState<DiscountTier[]>(INITIAL_TIERS)

  const handlePctChange = (id: string, value: string) => {
    const num = Math.max(0, Math.min(100, Number(value) || 0))
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pct: num } : t))
    )
  }

  const handleSave = () => {
    addToast({
      title: "Discount tiers saved",
      description: "Tier discount percentages have been updated successfully.",
      type: "success",
    })
  }

  return (
    <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-6">
      <div className="text-sm font-semibold text-[var(--ink-900)] mb-4">
        Discount tiers
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="border border-[var(--border-subtle)] rounded-xl p-4 bg-white"
          >
            <div className="text-xs font-bold text-[var(--ink-900)] mb-2">
              {tier.name}
            </div>
            
            <div className="flex items-center gap-1.5 mb-2">
              <input
                type="number"
                min={0}
                max={100}
                value={tier.pct}
                onChange={(e) => handlePctChange(tier.id, e.target.value)}
                className="w-14 h-8.5 rounded-lg border border-gray-200 px-2 font-sans text-xs text-[var(--ink-900)] focus:outline-none focus:border-[var(--evergreen-600)]"
              />
              <span className="text-xs text-[var(--text-muted)]">% off</span>
            </div>

            <div className="text-[11.5px] text-[var(--text-muted)] font-sans">
              Min order Rs {tier.minOrder.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button variant="default" onClick={handleSave} className="h-10 text-xs px-5">
          Save tier changes
        </Button>
      </div>
    </div>
  )
}
