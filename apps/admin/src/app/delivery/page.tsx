"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import {
  MOCK_DELIVERY_ORDERS,
  DeliveryItem,
  DeliveryStatus,
} from "@/content/mock/delivery-data"
import { ReadyDispatchTable } from "@/components/delivery/ReadyDispatchTable"
import { ActiveDeliveriesList } from "@/components/delivery/ActiveDeliveriesList"
import { DeliveryOutcomeModal } from "@/components/delivery/DeliveryOutcomeModal"

export default function DeliveryManagementPage() {
  const { role, addToast } = useAdminShell()

  const [orders, setOrders] = React.useState<DeliveryItem[]>(MOCK_DELIVERY_ORDERS)
  const [selectedOutcomeOrder, setSelectedOutcomeOrder] = React.useState<DeliveryItem | null>(null)
  const [outcomeType, setOutcomeType] = React.useState<"delivered" | "failed" | null>(null)

  // Full-page block for Packing role
  if (role === "packing") {
    return (
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
        <h2 className="text-base font-semibold text-[var(--ink-900)] mb-2">
          This section isn't part of your role
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Packing staff use the Order Queue to prepare confirmed orders.
        </p>
        <Link href="/orders">
          <Button variant="default" className="h-10 text-xs px-5">
            Go to Order Queue
          </Button>
        </Link>
      </div>
    )
  }

  const isDeliveryWorker = role === "delivery"

  const handleDispatch = (orderId: string, driver: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "dispatched" as DeliveryStatus,
              driver,
              dispatchedAt: new Date().toISOString(),
            }
          : o
      )
    )

    addToast({
      title: `Order ${orderId} dispatched with ${driver}`,
      type: "success",
    })
  }

  const handleOpenOutcomeModal = (
    order: DeliveryItem,
    outcome: "delivered" | "failed"
  ) => {
    setSelectedOutcomeOrder(order)
    setOutcomeType(outcome)
  }

  const handleSaveOutcome = (
    orderId: string,
    outcome: "delivered" | "failed",
    data: { cashCollected?: number; failedReason?: string }
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: outcome,
              cashCollected: data.cashCollected,
              failedReason: data.failedReason,
              deliveredAt: outcome === "delivered" ? new Date().toISOString() : undefined,
            }
          : o
      )
    )
  }

  // Filter packed orders awaiting dispatch
  const readyOrders = React.useMemo(
    () => orders.filter((o) => o.status === "packed"),
    [orders]
  )

  // Filter active/recent deliveries
  const activeDeliveries = React.useMemo(() => {
    let list = orders.filter(
      (o) =>
        o.status === "dispatched" ||
        o.status === "delivered" ||
        o.status === "failed"
    )

    if (isDeliveryWorker) {
      list = list.filter(
        (o) => o.driver.includes("Imran") || o.driver.includes("Delivery")
      )
    }

    return list
  }, [orders, isDeliveryWorker])

  const subtitle = isDeliveryWorker
    ? "your assigned runs"
    : "dispatch queue and live tracking"

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">
          Delivery Management
        </h1>
        <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">
          ترسیل کا انتظام · {subtitle}
        </div>
      </div>

      {/* Ready for Dispatch Table (Hidden for Delivery role) */}
      {!isDeliveryWorker && (
        <ReadyDispatchTable
          orders={readyOrders}
          onDispatch={handleDispatch}
        />
      )}

      {/* Active & Recent Deliveries List */}
      <ActiveDeliveriesList
        orders={activeDeliveries}
        title={isDeliveryWorker ? "My deliveries" : "Currently out & recent runs"}
        onOpenOutcomeModal={handleOpenOutcomeModal}
      />

      {/* Outcome Modal */}
      <DeliveryOutcomeModal
        open={!!selectedOutcomeOrder}
        onClose={() => {
          setSelectedOutcomeOrder(null)
          setOutcomeType(null)
        }}
        order={selectedOutcomeOrder}
        outcome={outcomeType}
        onSaveOutcome={handleSaveOutcome}
      />
    </div>
  )
}
