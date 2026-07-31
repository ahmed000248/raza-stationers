"use client"

import * as React from "react"
import Link from "next/link"
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline"
import { InvoiceView } from "@/components/orders/InvoiceView"
import { useCart } from "@/hooks/use-cart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { formatPKR } from "@/lib/pricing"
import { createAPIClient } from "@raza-stationers/api"
import { ArrowLeft, Phone, Truck, FileText, RotateCcw, Clock, Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

interface Props { params: Promise<{ id: string }> }

export default function OrderTrackingPage({ params }: Props) {
  const { id } = React.use(params)
  const { addItem } = useCart()
  const [order, setOrder] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [showInvoiceModal, setShowInvoiceModal] = React.useState(false)
  const [reordered, setReordered] = React.useState(false)

  React.useEffect(() => {
    const api = createAPIClient({ baseUrl: API_BASE })
    api.getOrder(id).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="py-20 flex items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
  if (!order) return <div className="py-20 text-center text-sm text-muted-foreground">Order not found.</div>

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })

  const handleReorder = () => {
    order.items?.forEach((item: any) => {
      addItem({ id: item.productId || item.skuSnapshot, title: item.productNameSnapshot, price: Number(item.unitPriceSnapshot), unit: item.unitCodeSnapshot }, Number(item.quantity))
    })
    setReordered(true)
    setTimeout(() => { window.location.href = "/cart" }, 400)
  }

  return (
    <div className="py-10 px-6 min-h-screen">
      <div className="mx-auto max-w-none w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2">
              <ArrowLeft className="size-4" /><span>Back to Order History</span>
            </Link>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">Track Order #{order.orderNumber}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Placed on {formattedDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowInvoiceModal(true)} className="rounded-full gap-1.5 text-xs"><FileText className="size-3.5" /><span>Invoice</span></Button>
            <Button size="sm" variant="default" onClick={handleReorder} disabled={reordered} className="rounded-full gap-1.5 text-xs"><RotateCcw className="size-3.5" /><span>Reorder</span></Button>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <span className="font-heading font-bold text-base flex items-center gap-2"><Clock className="size-4 text-[var(--color-evergreen-600)]" /><span>Status Timeline</span></span>
            <Badge variant="evergreen" className="px-3 py-1 text-xs">Current: {order.status?.replace(/_/g, " ")}</Badge>
          </div>
          <OrderTrackingTimeline status={order.status} />
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
          <div className="flex justify-between items-baseline border-b border-border pb-3">
            <h3 className="font-heading font-bold text-base">Order Items</h3>
            <span className="text-xs text-muted-foreground">{order.items?.length || 0} items</span>
          </div>
          <div className="divide-y divide-border/60">
            {(order.items || []).map((item: any) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div><p className="font-semibold">{item.productNameSnapshot}</p><span className="text-muted-foreground">{Number(item.quantity)} x {formatPKR(Number(item.unitPriceSnapshot))} ({item.unitCodeSnapshot})</span></div>
                <span className="font-bold">{formatPKR(Number(item.subtotalSnapshot))}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-border flex justify-between items-baseline text-sm font-bold">
            <span>Total</span>
            <span className="text-xl text-[var(--color-evergreen-600)]">{formatPKR(Number(order.grandTotal || order.subtotal))}</span>
          </div>
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
