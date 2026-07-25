"use client"

import * as React from "react"
import { Search, Bell } from "lucide-react"
import { useAdminShell } from "./AdminShell"

export function TopBar() {
  const { userName, alertCount } = useAdminShell()
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-[var(--border-subtle)] bg-white sticky top-0 z-10">
      {/* Global Search Bar */}
      <div className="flex items-center gap-2.5 bg-[var(--canvas)] rounded-full px-4 py-2 w-[320px] border border-[var(--border-subtle)] focus-within:ring-1 focus-within:ring-[var(--sage-400)] transition-all">
        <Search size={16} className="text-[var(--sage-400)] shrink-0" />
        <input
          type="text"
          placeholder="Search products, orders, clients..."
          className="bg-transparent text-xs text-[var(--ink-900)] placeholder:text-[var(--text-muted)] focus:outline-none w-full font-sans"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative text-[var(--forest-700)] hover:text-[var(--ink-900)] transition-colors cursor-pointer p-1"
        >
          <Bell size={21} />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-1 bg-[var(--red-500)] text-white text-[9px] font-bold min-w-[15px] h-[15px] rounded-full flex items-center justify-center animate-pulse">
              {alertCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-[var(--evergreen-600)] text-white text-xs font-semibold flex items-center justify-center border border-[var(--border-subtle)]">
          {initials}
        </div>
      </div>
    </header>
  )
}
