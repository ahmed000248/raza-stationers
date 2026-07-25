"use client"

import * as React from "react"
import { DeliveryItem } from "@/content/mock/delivery-data"
import { Button } from "@raza-stationers/ui"

interface ActiveDeliveriesListProps {
  orders: DeliveryItem[]
  title: string
  onOpenOutcomeModal: (order: DeliveryItem, outcome: "delivered" | "failed") => void
}

export function ActiveDeliveriesList({
  orders,
  title,
  onOpenOutcomeModal,
}: ActiveDeliveriesListProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-6 text-center text-xs text-[var(--text-muted)] font-sans">
        No active delivery runs found.
      </div>
    )
  }

  const STEPS = ["Assigned", "Dispatched", "Delivered"]

  return (
    <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs font-sans">
      <div className="px-5 py-4 text-sm font-semibold text-[var(--ink-900)] border-b border-[var(--border-subtle)]">
        {title}
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {orders.map((order) => {
          const isFailed = order.status === "failed"
          const isDelivered = order.status === "delivered"
          const isDispatched = order.status === "dispatched"

          const activeStepIdx = isDispatched ? 1 : isDelivered || isFailed ? 2 : 0

          return (
            <div key={order.id} className="p-5 animate-fade-in">
              {/* Header line */}
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs text-[var(--ink-900)]">
                  <span className="font-bold">{order.id}</span> · {order.client}{" "}
                  <span className="text-[var(--text-muted)]">— {order.city}</span>
                </div>
                <div className="text-xs text-[var(--text-muted)] font-medium">
                  {order.driver}
                </div>
              </div>

              {/* Step Timeline */}
              <div className="flex items-center gap-1.5 mb-4">
                {STEPS.map((stepLabel, idx) => {
                  const isCurrent = idx === activeStepIdx
                  const isDone = idx <= activeStepIdx
                  const isFailedStep = isFailed && idx === 2

                  const dotBg = isFailedStep
                    ? "bg-[#d93838]"
                    : isDone
                    ? "bg-[var(--evergreen-600)]"
                    : "bg-gray-200"

                  const textColor = isDone
                    ? "text-[var(--forest-700)] font-semibold"
                    : "text-[var(--text-muted)] font-normal"

                  const labelText = isFailedStep ? "Failed" : stepLabel

                  return (
                    <React.Fragment key={idx}>
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotBg}`}
                        />
                        <span className={`text-[11px] ${textColor}`}>
                          {labelText}
                        </span>
                        {idx < STEPS.length - 1 && (
                          <div className="h-px bg-[var(--border-subtle)] flex-1 mx-1" />
                        )}
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>

              {/* Actions for dispatched orders */}
              {isDispatched && (
                <div className="flex gap-2.5 mt-2">
                  <Button
                    variant="default"
                    onClick={() => onOpenOutcomeModal(order, "delivered")}
                    className="h-9 text-xs px-4"
                  >
                    Mark delivered
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onOpenOutcomeModal(order, "failed")}
                    className="h-9 text-xs px-4 text-red-700 border-red-200 hover:bg-red-50"
                  >
                    Mark failed
                  </Button>
                </div>
              )}

              {/* Details line for completed/failed runs */}
              {isDelivered && (
                <div className="text-[11.5px] text-[var(--text-muted)] bg-[var(--canvas)] px-3 py-1.5 rounded-lg inline-block">
                  Delivered • Cash collected: Rs{" "}
                  {(order.cashCollected || 0).toLocaleString()}
                </div>
              )}
              {isFailed && order.failedReason && (
                <div className="text-[11.5px] text-red-700 bg-red-50 px-3 py-1.5 rounded-lg inline-block font-medium">
                  Failed: {order.failedReason}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
