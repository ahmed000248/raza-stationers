"use client"

import * as React from "react"
import Link from "next/link"
import { OrderHistoryCard } from "@/components/orders/OrderHistoryCard"
import { EmptyState } from "@/components/ui/empty-state"
import { createAPIClient } from "@raza-stationers/api"
import { Package, ArrowLeft, Loader2 } from "lucide-react"
import { getApiBaseUrl } from "@/lib/public-config"

const API_BASE = getApiBaseUrl()

export default function OrderHistoryPage() {
  const [orders, setOrders] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filterStatus, setFilterStatus] = React.useState<string>("all")

  React.useEffect(() => {
    const api = createAPIClient({ baseUrl: API_BASE })
    const params: any = {}
    if (filterStatus !== "all") params.status = filterStatus
    api.getOrders(params).then((data: any) => setOrders(data.items || [])).catch(() => setOrders([])).finally(() => setLoading(false))
  }, [filterStatus])

  const filteredOrders = filterStatus === "all" ? orders : orders.filter((o: any) => o.status === filterStatus)

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

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState icon={Package} title="No Orders Found" description="You have no orders matching the selected filter." />
        ) : (
          <div className="space-y-4">{filteredOrders.map((order: any) => (<OrderHistoryCard key={order.id} order={order} />))}</div>
        )}
      </div>
    </div>
  )
}
