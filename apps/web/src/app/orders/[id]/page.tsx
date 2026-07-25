"use client"

import * as React from "react"
import Link from "next/link"
import { getMockOrderById } from "@/content/mock/orders"
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline"
import { InvoiceView } from "@/components/orders/InvoiceView"
import { useCart } from "@/hooks/use-cart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { formatPKR } from "@/lib/pricing"
import { ArrowLeft, Phone, Truck, FileText, RotateCcw, Clock } from "lucide-react"

interface OrderTrackingPageProps {
  params: Promise<{
    id: string
  }>
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { id } = React.use(params)
  const order = getMockOrderById(id)
  const { addItem } = useCart()

  const [showInvoiceModal, setShowInvoiceModal] = React.useState(false)
  const [reordered, setReordered] = React.useState(false)

  const handleReorder = () => {
    order.items.forEach((item) => {
      addItem({
        id: item.productId,
        title: item.productName,
        price: item.unitPriceAtOrder,
        unit: item.unit,
      }, item.quantity)
    })
    setReordered(true)
    setTimeout(() => {
      window.location.href = "/cart"
    }, 400)
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="py-10 px-6 min-h-screen">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Order History</span>
            </Link>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)]">
              Track Order #{order.orderNumber}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Placed on {formattedDate} • Payment: {order.paymentMethod.replace(/_/g, " ")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowInvoiceModal(true)}
              className="rounded-full gap-1.5 text-xs"
            >
              <FileText className="size-3.5" />
              <span>Tax Invoice</span>
            </Button>

            <Button
              size="sm"
              variant="default"
              onClick={handleReorder}
              disabled={reordered}
              className="rounded-full gap-1.5 text-xs"
            >
              <RotateCcw className="size-3.5" />
              <span>Reorder Items</span>
            </Button>
          </div>
        </div>

        {/* Live Status Visual Stepper Card (FR-ORD-05/06) */}
        <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <span className="font-heading font-bold text-base text-[var(--color-ink-900)] flex items-center gap-2">
              <Clock className="size-4 text-[var(--color-evergreen-600)]" />
              <span>Live Delivery Status Timeline (FR-ORD-05)</span>
            </span>

            <Badge variant="evergreen" className="px-3 py-1 text-xs">
              Current Stage: {order.status.replace(/_/g, " ").toUpperCase()}
            </Badge>
          </div>

          {/* Stepper Timeline */}
          <OrderTrackingTimeline status={order.status} />

          {/* Logistics & Dispatch Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/40 text-xs">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block">
                Estimated Delivery Window
              </span>
              <p className="font-bold text-sm text-[var(--color-ink-900)]">Tomorrow, 11:00 AM - 2:00 PM</p>
              <p className="text-muted-foreground text-[11px]">Karachi Central Commercial Dispatch Zone</p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
                <Truck className="size-3.5 text-[var(--color-evergreen-600)]" />
                <span>Assigned Logistics Rider</span>
              </span>
              <p className="font-bold text-sm text-[var(--color-ink-900)]">Rider: Tariq Khan</p>
              <p className="text-muted-foreground text-[11px] flex items-center gap-1">
                <Phone className="size-3" />
                <span>Contact Rider: +92 300 9876543</span>
              </p>
            </div>
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
          <div className="flex justify-between items-baseline border-b border-border pb-3">
            <h3 className="font-heading font-bold text-base text-[var(--color-ink-900)]">
              Ordered Line Items
            </h3>
            <span className="text-xs text-muted-foreground">{order.items.length} items</span>
          </div>

          <div className="divide-y divide-border/60">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">{item.productName}</p>
                  <span className="text-muted-foreground">
                    {item.quantity} x {formatPKR(item.unitPriceAtOrder)} ({item.unit})
                  </span>
                </div>
                <span className="font-bold text-foreground">{formatPKR(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex justify-between items-baseline text-sm font-bold">
            <span>Total Amount Paid / Owed</span>
            <span className="text-xl text-[var(--color-evergreen-600)]">{formatPKR(order.total)}</span>
          </div>
        </div>

        {/* Invoice Modal */}
        <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
          <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto pr-1">
            <InvoiceView order={order} onClose={() => setShowInvoiceModal(false)} />
          </div>
        </Dialog>
      </div>
    </div>
  )
}
