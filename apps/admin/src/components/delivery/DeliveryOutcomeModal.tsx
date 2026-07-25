"use client"

import * as React from "react"
import { Button, Dialog, DialogHeader, DialogTitle } from "@raza-stationers/ui"
import { DeliveryItem } from "@/content/mock/delivery-data"
import { useAdminShell } from "@/components/shell/AdminShell"

interface DeliveryOutcomeModalProps {
  open: boolean
  onClose: () => void
  order: DeliveryItem | null
  outcome: "delivered" | "failed" | null
  onSaveOutcome: (
    orderId: string,
    outcome: "delivered" | "failed",
    data: { cashCollected?: number; failedReason?: string }
  ) => void
}

export function DeliveryOutcomeModal({
  open,
  onClose,
  order,
  outcome,
  onSaveOutcome,
}: DeliveryOutcomeModalProps) {
  const { addToast } = useAdminShell()
  const [cashCollected, setCashCollected] = React.useState<string>("")
  const [failedReason, setFailedReason] = React.useState<string>("")

  React.useEffect(() => {
    if (order) {
      setCashCollected(order.total.toString())
      setFailedReason("")
    }
  }, [order, open])

  if (!order || !outcome) return null

  const isDelivered = outcome === "delivered"
  const isCashPayment =
    order.paymentMethod === "Cash on Delivery" ||
    order.paymentMethod === "partial"

  const isSaveDisabled = !isDelivered && !failedReason.trim()

  const handleSave = () => {
    if (!isDelivered && !failedReason.trim()) {
      addToast({
        title: "Validation error",
        description: "A reason is required when marking a delivery as failed.",
        type: "error",
      })
      return
    }

    const cashNum = Number(cashCollected) || 0

    onSaveOutcome(order.id, outcome, {
      cashCollected: isDelivered ? cashNum : 0,
      failedReason: !isDelivered ? failedReason.trim() : undefined,
    })

    addToast({
      title: isDelivered
        ? `Order ${order.id} marked delivered`
        : `Order ${order.id} marked failed`,
      type: isDelivered ? "success" : "error",
    })

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div>
        <DialogHeader className="mb-4">
          <DialogTitle className="font-heading text-lg font-semibold text-[var(--ink-900)]">
            {isDelivered
              ? `Record Delivery Success — ${order.id}`
              : `Record Delivery Failure — ${order.id}`}
          </DialogTitle>
          <div className="text-xs text-[var(--text-muted)] font-sans">
            Client: {order.client} ({order.city}) · Total: Rs{" "}
            {order.total.toLocaleString()}
          </div>
        </DialogHeader>

        <div className="space-y-3.5 font-sans">
          {isDelivered ? (
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                Cash collected (Rs) {isCashPayment ? "(Required)" : "(Optional)"}
              </label>
              <input
                type="number"
                min={0}
                value={cashCollected}
                onChange={(e) => setCashCollected(e.target.value)}
                placeholder="Enter amount collected"
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)]"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                Failure reason (Required per FR-DLV-04)
              </label>
              <textarea
                value={failedReason}
                onChange={(e) => setFailedReason(e.target.value)}
                placeholder="e.g. shop closed, customer refused delivery, invalid address"
                rows={3}
                className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)] resize-y"
              />
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2.5 mt-6 justify-end">
          <Button variant="outline" onClick={onClose} className="h-10 text-xs px-4">
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isSaveDisabled}
            className={`h-10 text-xs px-5 ${
              !isDelivered ? "bg-red-600 hover:bg-red-700 text-white" : ""
            }`}
          >
            {isDelivered ? "Confirm Delivery" : "Save Failure Record"}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
