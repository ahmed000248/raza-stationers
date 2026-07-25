"use client"

import * as React from "react"
import { MOCK_CATEGORY_BARS } from "@/content/mock/dashboard-data"

export function CategoryBars() {
  return (
    <div className="bg-white border border-[var(--border-subtle)] rounded-[16px] p-6">
      <div className="text-[14px] font-semibold mb-3.5 text-[var(--ink-900)]">
        Sales by category
      </div>
      <div className="flex gap-3.5 items-end h-[130px] pt-4">
        {MOCK_CATEGORY_BARS.map((bar) => (
          <div key={bar.label} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
            <div
              style={{ height: `${bar.value}%` }}
              className={`w-full max-w-[34px] rounded-t-md transition-all duration-600 ease-out ${
                bar.emphasis ? "bg-[var(--evergreen-600)]" : "bg-[var(--sage-400)]"
              }`}
            />
            <div className="text-[10.5px] text-[var(--text-muted)] font-medium truncate max-w-full">
              {bar.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
