"use client"

import * as React from "react"
import { mockOrders } from "@/content/mock/orders"
import { Order, OrderStatus } from "@raza-stationers/types"
import { formatPKR } from "@/lib/pricing"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, CheckCircle2, Truck, Package, ShieldAlert, ArrowRight } from "lucide-react"

export function OrderOperationsTable() {
  const [orders, setOrders] = React.useState<Order[]>(mockOrders)

  const advanceOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    )
  }

  return (
    <div className="space-y-6 p-6 rounded-2xl border border-border bg-card shadow-xs">
      <div className="border-b border-border pb-4">
        <h3 className="font-heading font-bold text-base text-[var(--color-ink-900)] flex items-center gap-2">
          <ShoppingBag className="size-4 text-[var(--color-evergreen-600)]" />
          <span>Order Dispatch & State Machine Operations (FR-ORD-01..03)</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Execute order state transitions and review owner approvals for over-credit orders.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <th className="py-3 px-2">Order #</th>
              <th className="py-3 px-2">Customer Account</th>
              <th className="py-3 px-2 text-center">Payment Method</th>
              <th className="py-3 px-2 text-right">Total Payable</th>
              <th className="py-3 px-2 text-center">Current Status</th>
              <th className="py-3 px-2 text-right">Advance State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/20">
                <td className="py-3 px-2 font-bold text-foreground">{order.orderNumber}</td>
                <td className="py-3 px-2 text-muted-foreground">Al-Raza Book Depot</td>
                <td className="py-3 px-2 text-center">{order.paymentMethod.replace(/_/g, " ")}</td>
                <td className="py-3 px-2 text-right font-bold text-[var(--color-evergreen-600)]">
                  {formatPKR(order.total)}
                </td>
                <td className="py-3 px-2 text-center">
                  <Badge variant={order.status === "delivered" ? "evergreen" : "amber"}>
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-right">
                  {order.status === "pending_review" && (
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => advanceOrderStatus(order.id, "confirmed")}
                      className="rounded-full gap-1 text-[11px]"
                    >
                      <span>Approve & Confirm</span>
                      <ArrowRight className="size-3" />
                    </Button>
                  )}

                  {order.status === "confirmed" && (
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => advanceOrderStatus(order.id, "packed")}
                      className="rounded-full gap-1 text-[11px]"
                    >
                      <Package className="size-3" />
                      <span>Mark Packed</span>
                    </Button>
                  )}

                  {order.status === "packed" && (
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => advanceOrderStatus(order.id, "out_for_delivery")}
                      className="rounded-full gap-1 text-[11px]"
                    >
                      <Truck className="size-3" />
                      <span>Dispatch to Rider</span>
                    </Button>
                  )}

                  {order.status === "out_for_delivery" && (
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => advanceOrderStatus(order.id, "delivered")}
                      className="rounded-full gap-1 text-[11px]"
                    >
                      <CheckCircle2 className="size-3" />
                      <span>Mark Delivered</span>
                    </Button>
                  )}

                  {order.status === "delivered" && (
                    <span className="text-xs text-[var(--color-evergreen-600)] font-bold">Fulfilled ✓</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
