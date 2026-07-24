"use client"

import * as React from "react"
import { ProductPurchaseType } from "@raza-stationers/types"
import { cn } from "@/lib/utils"
import { Package, UserCheck, Layers } from "lucide-react"

export type PurchaseTypeFilter = "all" | ProductPurchaseType

interface PurchaseTypeToggleProps {
  value: PurchaseTypeFilter
  onChange: (value: PurchaseTypeFilter) => void
  className?: string
}

export function PurchaseTypeToggle({ value, onChange, className }: PurchaseTypeToggleProps) {
  const options: { id: PurchaseTypeFilter; label: string; ur: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "all", label: "All Items", ur: "تمام اشیاء", icon: Layers },
    { id: "individual", label: "Individual Units", ur: "انفرادی یونٹس", icon: UserCheck },
    { id: "bulk", label: "Bulk Wholesale Packs", ur: "تھوک پیکجز", icon: Package },
  ]

  return (
    <div className={cn("inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border text-xs", className)}>
      {options.map((opt) => {
        const Icon = opt.icon
        const isSelected = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all select-none focus:outline-none focus:ring-2 focus:ring-ring",
              isSelected
                ? "bg-background text-[var(--color-ink-900)] shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            )}
          >
            <Icon className="size-3.5" />
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
