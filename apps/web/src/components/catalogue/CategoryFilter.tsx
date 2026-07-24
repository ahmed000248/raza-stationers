"use client"

import * as React from "react"
import { Category } from "@raza-stationers/types"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  categories: Category[]
  selectedId: string | null
  onSelect: (categoryId: string | null) => void
  className?: string
}

export function CategoryFilter({ categories, selectedId, onSelect, className }: CategoryFilterProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all select-none focus:outline-none focus:ring-2 focus:ring-ring",
          selectedId === null
            ? "bg-[var(--color-evergreen-600)] text-white shadow-xs font-semibold"
            : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        All Categories
      </button>

      {categories.map((cat) => {
        const isSelected = selectedId === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all select-none focus:outline-none focus:ring-2 focus:ring-ring",
              isSelected
                ? "bg-[var(--color-evergreen-600)] text-white shadow-xs font-semibold"
                : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <span>{cat.name}</span>
            {cat.nameUrdu && (
              <span dir="rtl" className="font-urdu text-[10px] opacity-75">
                {cat.nameUrdu}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
