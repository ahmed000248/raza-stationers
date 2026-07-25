"use client"

import * as React from "react"
import Link from "next/link"
import { getMockOrderById } from "@/content/mock/orders"
import { InvoiceView } from "@/components/orders/InvoiceView"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { Dialog } from "@/components/ui/dialog"
import { formatPKR } from "@/lib/pricing"
import { CheckCircle2, FileText, Home } from "lucide-react"

interface OrderConfirmationPageProps {
  params: Promise<{
    id: string
  }>
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { id } = React.use(params)
  const order = getMockOrderById(id)
  const [showInvoiceModal, setShowInvoiceModal] = React.useState(false)

  return (
    <div className="py-12 px-6 min-h-screen">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Success Banner Card */}
        <div className="p-8 rounded-3xl border border-[var(--color-evergreen-600)]/30 bg-[var(--color-evergreen-600)]/10 text-center space-y-4 shadow-sm">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-[var(--color-evergreen-600)] text-white shadow-md mx-auto">
            <CheckCircle2 className="size-8 animate-bounce" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">
              Order Submitted Successfully!
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-ink-900)]">
              Order #{order.orderNumber} Confirmed
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Your wholesale order has been recorded and submitted for dispatch verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Badge variant="evergreen" className="px-3 py-1 text-xs">
              Status: Pending Review
            </Badge>
            <Badge variant="mist" className="px-3 py-1 text-xs">
              Payment: {order.paymentMethod.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        {/* Status Timeline Guide (FR-ORD-05/06) */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <h3 className="font-heading text-sm font-semibold text-[var(--color-ink-900)] border-b border-border pb-3">
            Wholesale Order Timeline (FR-ORD-05)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[var(--color-evergreen-600)]/10 border border-[var(--color-evergreen-600)]/30 space-y-1">
              <span className="font-bold text-[var(--color-evergreen-600)] block">1. Placed</span>
              <p className="text-muted-foreground text-[11px]">Order submitted & logged in system</p>
            </div>
            <div className="p-3 rounded-xl bg-muted border border-border space-y-1 opacity-70">
              <span className="font-bold text-foreground block">2. Verified</span>
              <p className="text-muted-foreground text-[11px]">Credit & stock allocation checked</p>
            </div>
            <div className="p-3 rounded-xl bg-muted border border-border space-y-1 opacity-70">
              <span className="font-bold text-foreground block">3. Dispatched</span>
              <p className="text-muted-foreground text-[11px]">Handed to zone delivery rider</p>
            </div>
            <div className="p-3 rounded-xl bg-muted border border-border space-y-1 opacity-70">
              <span className="font-bold text-foreground block">4. Delivered</span>
              <p className="text-muted-foreground text-[11px]">Received at shop address</p>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="font-heading font-bold text-base text-[var(--color-ink-900)]">
              Order Items Breakdown
            </h3>
            <span className="text-xs text-muted-foreground">Total: {formatPKR(order.total)}</span>
          </div>

          <div className="divide-y divide-border">
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

          <div className="pt-4 border-t border-border flex items-center justify-between text-sm font-bold">
            <span>Total Payable</span>
            <span className="text-xl text-[var(--color-evergreen-600)]">{formatPKR(order.total)}</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            variant="default"
            onClick={() => setShowInvoiceModal(true)}
            className="rounded-full gap-2 w-full sm:w-auto text-sm font-semibold shadow-md px-8"
          >
            <FileText className="size-4" />
            <Bilingual en="View & Download Tax Invoice (OF-03)" ur="ٹیکس انوائس دیکھیں" layout="inline" />
          </Button>

          <Link href="/catalogue" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="rounded-full gap-2 w-full text-sm font-semibold">
              <Home className="size-4" />
              <span>Back to Home / Catalogue</span>
            </Button>
          </Link>
        </div>

        {/* Invoice View Modal */}
        <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
          <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto pr-1">
            <InvoiceView order={order} onClose={() => setShowInvoiceModal(false)} />
          </div>
        </Dialog>
      </div>
    </div>
  )
}
