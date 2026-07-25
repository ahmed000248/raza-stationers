"use client"

import * as React from "react"
import { CartItem } from "@/hooks/use-cart"
import { QuantityStepper } from "@/components/product/QuantityStepper"
import { ProductIconBlock } from "@/components/ui/product-icon-block"
import { calculateLineTotal } from "@/lib/cart-math"
import { formatPKR } from "@/lib/pricing"
import { Trash2 } from "lucide-react"

interface CartLineItemProps {
  item: CartItem
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function CartLineItem({ item, onUpdateQuantity, onRemove }: CartLineItemProps) {
  const lineTotal = calculateLineTotal(item.price, item.quantity)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-foreground/20">
      {/* Left: Product Icon & Title Info */}
      <div className="flex items-center gap-4 min-w-0">
        <ProductIconBlock
          category={(item.category || "paper") as any}
          size="sm"
          className="size-14 rounded-xl shrink-0"
        />
        <div className="space-y-1 min-w-0">
          <h4 className="font-heading font-semibold text-sm leading-snug text-[var(--color-ink-900)] truncate">
            {item.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Unit: <strong className="text-foreground">{item.unit}</strong></span>
            <span>•</span>
            <span>{formatPKR(item.price)} / unit</span>
          </div>
        </div>
      </div>

      {/* Right: Quantity Stepper, Line Total & Remove */}
      <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        <QuantityStepper
          quantity={item.quantity}
          onChange={(qty) => onUpdateQuantity(item.id, qty)}
        />

        <div className="text-right min-w-[90px]">
          <span className="text-[10px] text-muted-foreground font-medium block sm:hidden">Total</span>
          <span className="font-heading font-bold text-base text-[var(--color-evergreen-600)]">
            {formatPKR(lineTotal)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}
