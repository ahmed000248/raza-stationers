"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Order } from "@raza-stationers/types"
import { useCart } from "@/hooks/use-cart"
import { formatPKR } from "@/lib/pricing"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { Package, RotateCcw, ArrowRight, Truck, Calendar } from "lucide-react"

interface OrderHistoryCardProps {
  order: Order
}

export function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [reordered, setReordered] = React.useState(false)

  const handleReorderAll = () => {
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
      router.push("/cart")
    }, 400)
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <div className="p-5 rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-foreground/20 space-y-4">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
            <Package className="size-5" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-[var(--color-ink-900)]">
              Order #{order.orderNumber}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                <span>{formattedDate}</span>
              </span>
              <span>•</span>
              <span>{order.items.length} items</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.status === "delivered" ? (
            <Badge variant="evergreen" className="text-xs">
              Delivered
            </Badge>
          ) : order.status === "out_for_delivery" ? (
            <Badge variant="amber" className="text-xs">
              Dispatched
            </Badge>
          ) : (
            <Badge variant="mist" className="text-xs">
              Pending Review
            </Badge>
          )}
        </div>
      </div>

      {/* Items Preview */}
      <div className="space-y-1.5 text-xs text-muted-foreground">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span className="truncate max-w-[280px] sm:max-w-md text-foreground font-medium">
              {item.quantity}x {item.productName} ({item.unit})
            </span>
            <span className="font-semibold text-foreground">{formatPKR(item.lineTotal)}</span>
          </div>
        ))}
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <div>
          <span className="text-[10px] text-muted-foreground font-medium block">Total Payable</span>
          <span className="font-heading font-bold text-lg text-[var(--color-evergreen-600)]">
            {formatPKR(order.total)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReorderAll}
            disabled={reordered}
            className="rounded-full gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" />
            <Bilingual en="Reorder Items (FR-CRT-08)" ur="دوبارہ آرڈر کریں" layout="inline" />
          </Button>

          <Link href={`/orders/${order.id}`}>
            <Button size="sm" variant="default" className="rounded-full gap-1 text-xs">
              <span>Track Order</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
