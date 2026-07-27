"use client"

import * as React from "react"
import Link from "next/link"
import { InvoiceView } from "@/components/orders/InvoiceView"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { formatPKR } from "@/lib/pricing"
import { createAPIClient } from "@raza-stationers/api"
import { CheckCircle2, FileText, Home, Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

interface Props { params: Promise<{ id: string }> }

export default function OrderConfirmationPage({ params }: Props) {
  const { id } = React.use(params)
  const [order, setOrder] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [showInvoiceModal, setShowInvoiceModal] = React.useState(false)

  React.useEffect(() => {
    const api = createAPIClient({ baseUrl: API_BASE })
    api.getOrder(id).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="py-20 flex items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
  if (!order) return <div className="py-20 text-center text-sm text-muted-foreground">Order not found.</div>

  return (
    <div className="py-12 px-6 min-h-screen">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="p-8 rounded-3xl border border-[var(--color-evergreen-600)]/30 bg-[var(--color-evergreen-600)]/10 text-center space-y-4 shadow-sm">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-[var(--color-evergreen-600)] text-white shadow-md mx-auto">
            <CheckCircle2 className="size-8 animate-bounce" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">Order Submitted Successfully!</span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Order #{order.orderNumber} Confirmed</h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">Your wholesale order has been recorded and submitted for dispatch verification.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Badge variant="evergreen" className="px-3 py-1 text-xs">Status: {order.status?.replace(/_/g, " ")}</Badge>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <h3 className="font-heading text-sm font-semibold border-b border-border pb-3">Order Timeline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            {[
              { label: "Placed", desc: "Order submitted", done: true },
              { label: "Verified", desc: "Credit & stock checked", done: false },
              { label: "Dispatched", desc: "Handed to rider", done: false },
              { label: "Delivered", desc: "Received at shop", done: false },
            ].map((s) => (
              <div key={s.label} className={`p-3 rounded-xl border space-y-1 ${s.done ? "bg-[var(--color-evergreen-600)]/10 border-[var(--color-evergreen-600)]/30" : "bg-muted border-border opacity-70"}`}>
                <span className={`font-bold block ${s.done ? "text-[var(--color-evergreen-600)]" : ""}`}>{s.label}</span>
                <p className="text-muted-foreground text-[11px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="font-heading font-bold text-base">Order Items</h3>
            <span className="text-xs text-muted-foreground">Total: {formatPKR(Number(order.grandTotal || order.subtotal))}</span>
          </div>
          <div className="divide-y divide-border">
            {(order.items || []).map((item: any) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div><p className="font-semibold">{item.productNameSnapshot}</p><span className="text-muted-foreground">{Number(item.quantity)} x {formatPKR(Number(item.unitPriceSnapshot))}</span></div>
                <span className="font-bold">{formatPKR(Number(item.subtotalSnapshot))}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link href="/orders"><Button variant="outline" className="rounded-full gap-2"><FileText className="size-4" /><span>View My Orders</span></Button></Link>
          <Link href="/"><Button className="rounded-full gap-2"><Home className="size-4" /><span>Back to Home</span></Button></Link>
        </div>

        <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
          <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto pr-1">
            <InvoiceView order={order} onClose={() => setShowInvoiceModal(false)} />
          </div>
        </Dialog>
      </div>
    </div>
  )
}
