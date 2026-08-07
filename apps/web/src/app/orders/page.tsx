"use client"

import * as React from "react"
import Link from "next/link"
import { EmptyState } from "@/components/ui/empty-state"
import { Package, ArrowLeft } from "lucide-react"

export default function OrderHistoryPage() {
  const [filterStatus, setFilterStatus] = React.useState<string>("all")

  return (
    <div className="py-10 px-6 min-h-screen">
      <div className="mx-auto max-w-none w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <Link href="/account" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2">
              <ArrowLeft className="size-4" /><span>Back to Account</span>
            </Link>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)]">Wholesale Order History</h1>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border text-xs self-start sm:self-auto">
            {["all", "pending_review", "out_for_delivery", "delivered"].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filterStatus === s ? "bg-[var(--color-ink-900)] text-white shadow-xs" : "text-muted-foreground hover:bg-muted"}`}>
                {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <EmptyState icon={Package} title="Backend Rebuild in Progress" description="Order history is temporarily offline while the backend service is being updated." />
      </div>
    </div>
  )
}
