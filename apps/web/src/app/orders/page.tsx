"use client"

import * as React from "react"
import Link from "next/link"
import { mockOrders } from "@/content/mock/orders"
import { OrderHistoryCard } from "@/components/orders/OrderHistoryCard"
import { EmptyState } from "@/components/ui/empty-state"
import { Package, ArrowLeft } from "lucide-react"

export default function OrderHistoryPage() {
  const [filterStatus, setFilterStatus] = React.useState<"all" | "pending_review" | "out_for_delivery" | "delivered">("all")

  const filteredOrders = React.useMemo(() => {
    if (filterStatus === "all") return mockOrders
    return mockOrders.filter((o) => o.status === filterStatus)
  }, [filterStatus])

  return (
    <div className="py-10 px-6 min-h-screen">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Account</span>
            </Link>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)]">
              Wholesale Order History
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Track active dispatches, view invoices, or re-order past stationery items (FR-ORD-05/06).
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === "all"
                  ? "bg-[var(--color-ink-900)] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All Orders
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus("pending_review")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === "pending_review"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Pending
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus("out_for_delivery")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === "out_for_delivery"
                  ? "bg-[var(--color-evergreen-600)] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Dispatched
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus("delivered")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === "delivered"
                  ? "bg-[var(--color-evergreen-600)] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Orders Found"
            description="You have no order history matching the selected status filter."
            actionLabel="View All Orders"
            onAction={() => setFilterStatus("all")}
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderHistoryCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
