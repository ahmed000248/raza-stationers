"use client"

import * as React from "react"
import { ProductUnit } from "@raza-stationers/types"
import { cn } from "@/lib/utils"
import { Layers } from "lucide-react"

interface ProductUnitSelectorProps {
  units: ProductUnit[]
  selectedUnit: ProductUnit
  onSelectUnit: (unit: ProductUnit) => void
  className?: string
}

export function ProductUnitSelector({
  units,
  selectedUnit,
  onSelectUnit,
  className,
}: ProductUnitSelectorProps) {
  if (!units || units.length === 0) return null

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Layers className="size-3.5" />
        <span>Unit / Sale Format (PR-02)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {units.map((unit) => {
          const isSelected = selectedUnit.id === unit.id
          return (
            <button
              key={unit.id}
              type="button"
              onClick={() => onSelectUnit(unit)}
              className={cn(
                "flex flex-col items-start px-3.5 py-2 rounded-xl border text-xs font-medium transition-all select-none focus:outline-none focus:ring-2 focus:ring-ring",
                isSelected
                  ? "border-[var(--color-evergreen-600)] bg-[var(--color-evergreen-600)]/10 text-[var(--color-ink-900)] font-semibold shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              <span className="font-semibold text-sm">{unit.unitName}</span>
              {unit.conversionToBase > 1 && (
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  ({unit.conversionToBase}x base units)
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
