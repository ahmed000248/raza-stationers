"use client"

import * as React from "react"
import { MOCK_CATEGORIES } from "@/content/mock/catalogue-data"

interface CategoryFilterBarProps {
  activeCategory: string
  onCategoryChange: (cat: string) => void
}

export function CategoryFilterBar({
  activeCategory,
  onCategoryChange,
}: CategoryFilterBarProps) {
  const categories = ["all", ...MOCK_CATEGORIES]

  return (
    <div className="flex gap-2 my-5 flex-wrap">
      {categories.map((cat) => {
        const isActive = activeCategory === cat
        const label = cat === "all" ? "All" : cat

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              isActive
                ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                : "bg-white text-[var(--forest-700)] border-[var(--border-subtle)] hover:bg-[var(--canvas)]"
            }`}
          >
            {label}
          </button>
        )}
      )}
    </div>
  )
}
