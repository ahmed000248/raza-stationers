"use client"

import * as React from "react"
import { Order } from "@raza-stationers/types"
import { formatPKR } from "@/lib/pricing"
import { Button } from "@/components/ui/button"
import { Printer, Building2 } from "lucide-react"

interface InvoiceViewProps {
  order: Order
  onClose?: () => void
}

export function InvoiceView({ order, onClose }: InvoiceViewProps) {
  const handlePrint = () => {
    window.print()
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="bg-card p-6 sm:p-10 rounded-2xl border border-border max-w-4xl mx-auto space-y-8 shadow-sm">
      {/* Top Controls (Hidden on Print) */}
      <div className="flex items-center justify-between border-b border-border pb-4 print:hidden">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-[var(--color-evergreen-600)]" />
          <span className="font-heading font-bold text-sm text-[var(--color-ink-900)]">
            Wholesale Tax Invoice (OF-03)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={handlePrint} className="rounded-lg gap-2">
            <Printer className="size-4" />
            <span>Print Invoice (PDF)</span>
          </Button>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose} className="rounded-lg">
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Document Main Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-border pb-6">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-[var(--color-ink-900)] tracking-tight">
            RAZA STATIONERS
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Wholesale Stationers & Paper Merchants
          </p>
          <p className="text-xs text-muted-foreground">
            Main GT Road, New City Phase 1, Wah Cantt, Pakistan
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            NTN: 1234567-8 • STRN: 3277876543210
          </p>
        </div>

        <div className="sm:text-right space-y-1 text-xs">
          <div className="inline-block px-3 py-1 rounded-full bg-[var(--color-evergreen-600)]/10 text-[var(--color-evergreen-600)] font-bold text-xs">
            TAX INVOICE #{order.orderNumber}
          </div>
          <p className="text-muted-foreground pt-1">
            Date: <strong className="text-foreground">{formattedDate}</strong>
          </p>
          <p className="text-muted-foreground">
            Payment Method: <strong className="text-foreground">{order.paymentMethod.replace(/_/g, " ")}</strong>
          </p>
          <p className="text-muted-foreground">
            Status: <strong className="text-[var(--color-evergreen-600)] uppercase">{order.status}</strong>
          </p>
        </div>
      </div>

      {/* Billed To / Shipping Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-muted/40 text-xs">
        <div>
          <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Billed To / Customer Account:
          </span>
          <p className="font-bold text-sm text-[var(--color-ink-900)]">Al-Raza Book Depot</p>
          <p className="text-muted-foreground mt-0.5">Account ID: {order.clientBusinessId}</p>
          <p className="text-muted-foreground">Verified Wholesale Business Member</p>
        </div>
        <div>
          <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Delivery Destination:
          </span>
          <p className="text-foreground font-medium">{order.deliveryAddress}</p>
        </div>
      </div>

      {/* Itemized Line Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <th className="py-3 px-2">Item Description</th>
              <th className="py-3 px-2 text-center">Unit Format</th>
              <th className="py-3 px-2 text-center">Qty</th>
              <th className="py-3 px-2 text-right">Unit Price</th>
              <th className="py-3 px-2 text-right">Total Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {order.items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/20">
                <td className="py-3 px-2 font-medium text-foreground">{item.productName}</td>
                <td className="py-3 px-2 text-center text-muted-foreground">{item.unit}</td>
                <td className="py-3 px-2 text-center font-semibold">{item.quantity}</td>
                <td className="py-3 px-2 text-right text-muted-foreground">{formatPKR(item.unitPriceAtOrder)}</td>
                <td className="py-3 px-2 text-right font-bold text-foreground">{formatPKR(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculation Totals */}
      <div className="flex justify-end pt-4 border-t border-border">
        <div className="w-full sm:w-72 space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-medium text-foreground">{formatPKR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Sales Tax (0% Wholesale Exempt)</span>
            <span className="font-medium text-foreground">{formatPKR(0)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Fee</span>
            <span className="font-medium text-[var(--color-evergreen-600)]">Free (Zone Covered)</span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between items-baseline">
            <span className="font-heading font-bold text-sm text-[var(--color-ink-900)]">Grand Total</span>
            <span className="font-heading font-bold text-xl text-[var(--color-evergreen-600)]">
              {formatPKR(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="pt-6 border-t border-border/40 text-[11px] text-muted-foreground text-center space-y-1">
        <p className="font-semibold text-foreground">Thank you for ordering with Raza Stationers!</p>
        <p>For order queries, contact support@razastationers.com or call 03125120693.</p>
      </div>
    </div>
  )
}
