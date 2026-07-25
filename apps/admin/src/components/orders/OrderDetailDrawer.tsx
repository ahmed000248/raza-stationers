"use client"

import * as React from "react"
import { AdminOrder, DELIVERY_STAFF } from "@/content/mock/order-data"
import { Button, Badge } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"

interface OrderDetailDrawerProps {
  order: AdminOrder | null
  onClose: () => void
  onUpdateOrder: (
    id: string,
    newStatus: AdminOrder["status"],
    historyNote?: string
  ) => void
}

export function OrderDetailDrawer({
  order,
  onClose,
  onUpdateOrder,
}: OrderDetailDrawerProps) {
  const { role, addToast } = useAdminShell()
  const [rejecting, setRejecting] = React.useState<boolean>(false)
  const [rejectNote, setRejectNote] = React.useState<string>("")
  const [selectedDriver, setSelectedDriver] = React.useState<string>(
    DELIVERY_STAFF[0] || ""
  )

  React.useEffect(() => {
    setRejecting(false)
    setRejectNote("")
  }, [order])

  if (!order) return null

  const isDeliveryRole = role === "delivery"
  const isPackingRole = role === "packing"

  const canConfirm = !isDeliveryRole && !isPackingRole && order.status === "pending"
  const canPack =
    (role === "admin" || role === "owner" || isPackingRole) &&
    order.status === "confirmed"
  const canAssign =
    (role === "admin" || role === "owner") && order.status === "packed"

  const handleConfirm = () => {
    onUpdateOrder(order.id, "confirmed")
    addToast({
      title: `Order ${order.id} confirmed`,
      type: "success",
    })
  }

  const handleReject = () => {
    if (!rejectNote.trim()) return
    onUpdateOrder(order.id, "rejected", rejectNote.trim())
    addToast({
      title: `Order ${order.id} rejected`,
      type: "error",
    })
    setRejecting(false)
    setRejectNote("")
    onClose()
  }

  const handlePrintSlip = () => {
    addToast({
      title: "Picking slip sent to printer",
      type: "info",
    })
  }

  const handlePack = () => {
    onUpdateOrder(order.id, "packed", "Ready for dispatch")
    addToast({
      title: `Order ${order.id} marked packed`,
      type: "success",
    })
    onClose()
  }

  const handleAssign = () => {
    onUpdateOrder(order.id, "dispatched", `Driver: ${selectedDriver}`)
    addToast({
      title: `Order ${order.id} assigned to ${selectedDriver}`,
      type: "success",
    })
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40 transition-opacity animate-fade-in"
      />

      {/* Slide-over Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[440px] bg-white z-50 shadow-2xl overflow-y-auto p-7 font-sans">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="font-heading text-xl font-semibold text-[var(--ink-900)]">
              {order.id}
            </h2>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {order.client} · {order.city}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-[var(--text-muted)] hover:text-black cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Status Badge */}
        <div className="my-3">
          <Badge className="text-xs px-3 py-1 font-semibold bg-[var(--mist-100)] text-[var(--evergreen-600)]">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>

        {/* Pricing Tier */}
        <div className="text-xs text-[var(--text-muted)] mt-4">
          Pricing tier applied
        </div>
        <div className="text-sm font-semibold text-[var(--ink-900)] mb-5">
          {order.tier}
        </div>

        {/* Items Section */}
        <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Items
        </div>
        <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden mb-5">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 border-b border-[var(--border-subtle)] text-xs"
            >
              <span className="text-[var(--ink-900)] font-medium">
                {item.name}{" "}
                <span className="text-[var(--text-muted)] font-normal">
                  × {item.qty}
                </span>
              </span>
              <span className="font-semibold text-[var(--ink-900)]">
                Rs {(item.qty * item.price).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center p-3 text-sm font-bold bg-[var(--canvas)] text-[var(--ink-900)]">
            <span>Total</span>
            <span>Rs {order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Status History Section */}
        <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
          Status history
        </div>
        <div className="space-y-3 mb-6">
          {order.history.map((h, idx) => {
            const dateStr = new Date(h.at).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
            return (
              <div key={idx} className="flex gap-2.5 items-start">
                <div className="w-2 h-2 rounded-full bg-[var(--evergreen-600)] mt-1.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-[var(--ink-900)]">
                    {h.status}
                  </div>
                  <div className="text-[11.5px] text-[var(--text-muted)]">
                    {dateStr}
                  </div>
                  {h.note && (
                    <div className="text-xs text-[var(--text-muted)] italic mt-0.5">
                      {h.note}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Controls */}
        {canConfirm && (
          <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={handleConfirm}
                className="h-10 text-xs px-4"
              >
                Confirm order
              </Button>
              <Button
                variant="outline"
                onClick={() => setRejecting(!rejecting)}
                className="h-10 text-xs px-4"
              >
                Reject
              </Button>
            </div>

            {rejecting && (
              <div className="space-y-2 mt-2">
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Reason for rejection (required)"
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)]"
                />
                <Button
                  variant="default"
                  onClick={handleReject}
                  disabled={!rejectNote.trim()}
                  className="h-10 text-xs px-4 bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirm rejection
                </Button>
              </div>
            )}
          </div>
        )}

        {canPack && (
          <div className="flex gap-2 border-t border-[var(--border-subtle)] pt-4">
            <Button
              variant="outline"
              onClick={handlePrintSlip}
              className="h-10 text-xs px-4"
            >
              Print picking slip
            </Button>
            <Button
              variant="default"
              onClick={handlePack}
              className="h-10 text-xs px-4"
            >
              Mark packed
            </Button>
          </div>
        )}

        {canAssign && (
          <div className="space-y-2.5 border-t border-[var(--border-subtle)] pt-4">
            <label className="block text-xs text-[var(--text-muted)]">
              Assign delivery driver
            </label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full h-11 rounded-full border border-gray-200 px-4 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)] bg-white"
            >
              {DELIVERY_STAFF.map((driver) => (
                <option key={driver} value={driver}>
                  {driver}
                </option>
              ))}
            </select>
            <Button
              variant="default"
              onClick={handleAssign}
              className="h-10 text-xs px-5 w-full"
            >
              Assign to delivery
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
