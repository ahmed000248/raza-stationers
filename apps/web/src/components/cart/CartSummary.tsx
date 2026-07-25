"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { formatPKR } from "@/lib/pricing"
import { ShoppingBag, ArrowRight, Truck, AlertCircle, ShieldCheck } from "lucide-react"

interface CartSummaryProps {
  subtotal: number
  totalItems: number
  minOrderThreshold?: number
}

export function CartSummary({
  subtotal,
  totalItems,
  minOrderThreshold = 2000,
}: CartSummaryProps) {
  const isBelowMinOrder = subtotal < minOrderThreshold
  const remainingForMinOrder = Math.max(0, minOrderThreshold - subtotal)

  return (
    <div className="space-y-6 p-6 rounded-2xl border border-border bg-card shadow-sm sticky top-24">
      <h3 className="font-heading text-lg font-bold tracking-tight text-[var(--color-ink-900)] border-b border-border pb-3">
        Order Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Items ({totalItems})</span>
          <span className="font-medium text-foreground">{formatPKR(subtotal)}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>Delivery Charge</span>
          <span className="text-xs font-semibold text-[var(--color-evergreen-600)]">
            Calculated at Checkout
          </span>
        </div>

        <div className="pt-3 border-t border-border flex justify-between items-baseline">
          <span className="font-heading font-bold text-base text-[var(--color-ink-900)]">
            Subtotal
          </span>
          <span className="font-heading font-bold text-2xl text-[var(--color-evergreen-600)]">
            {formatPKR(subtotal)}
          </span>
        </div>
      </div>

      {/* FR-CRT-02 / OF-01 Minimum Order Notice */}
      {isBelowMinOrder ? (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--color-amber-ink)]">
            <AlertCircle className="size-4 shrink-0 text-[var(--color-amber-500)]" />
            <span>Minimum Wholesale Order Notice</span>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            Minimum order for zone delivery is <strong className="text-foreground">{formatPKR(minOrderThreshold)}</strong>. Add <strong className="text-foreground">{formatPKR(remainingForMinOrder)}</strong> more to proceed.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-evergreen-600)]/10 text-xs text-[var(--color-ink-900)] font-medium">
          <ShieldCheck className="size-4 text-[var(--color-evergreen-600)] shrink-0" />
          <span>Minimum order threshold reached!</span>
        </div>
      )}

      {/* Delivery Zone Info */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Truck className="size-4 text-[var(--color-evergreen-600)] shrink-0 mt-0.5" />
        <span>Delivery available in Karachi & major Punjab city zones.</span>
      </div>

      {/* Proceed to Checkout Button */}
      <Link href={isBelowMinOrder ? "#" : "/checkout"} className="block">
        <Button
          size="lg"
          variant="default"
          disabled={isBelowMinOrder || totalItems === 0}
          className="w-full rounded-full gap-2 text-sm font-semibold shadow-md py-6"
        >
          <Bilingual en="Proceed to Checkout" ur="چیک آؤٹ پر جائیں" layout="inline" />
          <ArrowRight className="size-4" />
        </Button>
      </Link>
    </div>
  )
}
