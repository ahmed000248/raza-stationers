"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldCheck, BookOpen, Users, Package, ShoppingBag, Percent, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-[var(--color-ink-900)] text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--color-evergreen-600)] text-white shadow-xs">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <span className="font-heading font-bold text-sm text-white block">
              Raza Stationers Ops Portal
            </span>
            <span className="text-[10px] text-[var(--color-sage-400)]">Owner & Admin Operations</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/catalogue"
            className="text-xs font-semibold text-white/80 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/10"
          >
            ← Back to Customer Website
          </Link>
        </div>
      </div>
    </header>
  )
}
