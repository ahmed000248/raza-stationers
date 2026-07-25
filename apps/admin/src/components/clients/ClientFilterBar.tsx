"use client"

import * as React from "react"
import { Search } from "lucide-react"

export type ClientFilterType = "all" | "active" | "pending" | "tier-a" | "overdue"

interface ClientFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  activeFilter: ClientFilterType
  onFilterChange: (filter: ClientFilterType) => void
}

const FILTERS: { key: ClientFilterType; label: string }[] = [
  { key: "all", label: "All clients" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending approval" },
  { key: "tier-a", label: "Tier A" },
  { key: "overdue", label: "Overdue" },
]

export function ClientFilterBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: ClientFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 my-5">
      {/* Search Input */}
      <div className="relative w-[280px]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or city…"
          className="w-full h-11 rounded-full border border-[var(--mist-100)] bg-white px-4 text-xs text-[var(--ink-900)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--sage-400)] transition-all font-sans"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilterChange(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                isActive
                  ? "bg-[var(--evergreen-600)] text-white border-[var(--evergreen-600)]"
                  : "bg-white text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-[var(--sage-400)] hover:text-[var(--ink-900)]"
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
