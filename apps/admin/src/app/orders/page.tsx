"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import {
  MOCK_ORDERS,
  AdminOrder,
  AdminOrderStatus,
} from "@/content/mock/order-data"
import {
  OrderFilterBar,
  OrderFilterType,
} from "@/components/orders/OrderFilterBar"
import { OrderTable } from "@/components/orders/OrderTable"
import { OrderDetailDrawer } from "@/components/orders/OrderDetailDrawer"

export default function OrderQueuePage() {
  const { role } = useAdminShell()

  const [orders, setOrders] = React.useState<AdminOrder[]>(MOCK_ORDERS)
  const [activeFilter, setActiveFilter] = React.useState<OrderFilterType>("all")
  const [sortDir, setSortDir] = React.useState<0 | 1 | -1>(0)
  const [selectedOrder, setSelectedOrder] = React.useState<AdminOrder | null>(
    null
  )

  // Full-page block for Delivery role
  if (role === "delivery") {
    return (
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
        <h2 className="text-base font-semibold text-[var(--ink-900)] mb-2">
          This section isn't part of your role
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Delivery workers see their assigned runs on the Delivery page.
        </p>
        <Link href="/delivery">
          <Button variant="default" className="h-10 text-xs px-5">
            Go to Delivery
          </Button>
        </Link>
      </div>
    )
  }

  const handleToggleSortTotal = () => {
    setSortDir((prev) => (prev === 1 ? -1 : prev === -1 ? 0 : 1))
  }

  const handleUpdateOrder = (
    id: string,
    newStatus: AdminOrderStatus,
    historyNote?: string
  ) => {
    const nowIso = new Date().toISOString()
    const statusLabels: Record<AdminOrderStatus, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      packed: "Packed",
      dispatched: "Dispatched",
      delivered: "Delivered",
      rejected: "Rejected",
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const newHistory = [
          ...o.history,
          {
            status: statusLabels[newStatus],
            at: nowIso,
            note: historyNote,
          },
        ]
        return {
          ...o,
          status: newStatus,
          history: newHistory,
        }
      })
    )

    // Update active drawer instance if open
    setSelectedOrder((prev) => {
      if (!prev || prev.id !== id) return prev
      return {
        ...prev,
        status: newStatus,
        history: [
          ...prev.history,
          {
            status: statusLabels[newStatus],
            at: nowIso,
            note: historyNote,
          },
        ],
      }
    })
  }

  // Filter & Sort orders
  const processedOrders = React.useMemo(() => {
    let list = [...orders]

    // Role view filtering for Packing Staff
    if (role === "packing") {
      list = list.filter(
        (o) => o.status === "confirmed" || o.status === "packed"
      )
    }

    // Status filter
    if (activeFilter !== "all") {
      list = list.filter((o) => o.status === activeFilter)
    }

    // Sorting
    if (sortDir !== 0) {
      list.sort((a, b) => (a.total - b.total) * sortDir)
    }

    return list
  }, [orders, role, activeFilter, sortDir])

  const subtitle =
    role === "packing"
      ? "confirmed orders ready to pack"
      : "incoming and in-progress orders"

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">
          Order Queue
        </h1>
        <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">
          آرڈر قطار · {subtitle}
        </div>
      </div>

      {/* Filter Bar */}
      <OrderFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Order Table */}
      <OrderTable
        orders={processedOrders}
        sortDir={sortDir}
        onToggleSortTotal={handleToggleSortTotal}
        onSelectOrder={(order) => setSelectedOrder(order)}
      />

      {/* Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateOrder={handleUpdateOrder}
      />
    </div>
  )
}
