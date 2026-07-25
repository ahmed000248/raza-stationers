"use client"

import * as React from "react"
import { OrderStatus } from "@raza-stationers/types"
import { Check, Clock, Package, Truck, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderTrackingTimelineProps {
  status: OrderStatus
  className?: string
}

const steps = [
  { id: "pending_review", label: "Placed", icon: Clock },
  { id: "confirmed", label: "Verified", icon: Check },
  { id: "packed", label: "Packed", icon: Package },
  { id: "out_for_delivery", label: "Dispatched", icon: Truck },
  { id: "delivered", label: "Delivered", icon: Home },
]

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case "pending_review":
      return 0
    case "confirmed":
      return 1
    case "packed":
      return 2
    case "out_for_delivery":
      return 3
    case "delivered":
      return 4
    default:
      return 0
  }
}

export function OrderTrackingTimeline({ status, className }: OrderTrackingTimelineProps) {
  const currentIndex = getStepIndex(status)

  return (
    <div className={cn("py-4", className)}>
      <div className="relative flex items-center justify-between">
        {/* Background Progress Line */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-border -z-0" />
        <div
          className="absolute top-5 left-6 h-0.5 bg-[var(--color-evergreen-600)] transition-all duration-500 -z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon
          const isCompleted = idx <= currentIndex
          const isCurrent = idx === currentIndex

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 transition-all shadow-xs",
                  isCompleted
                    ? "border-[var(--color-evergreen-600)] bg-[var(--color-evergreen-600)] text-white"
                    : "border-border bg-card text-muted-foreground",
                  isCurrent && "ring-4 ring-[var(--color-evergreen-600)]/20 scale-110"
                )}
              >
                <Icon className="size-4" />
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-semibold tracking-tight transition-colors text-center",
                  isCompleted ? "text-[var(--color-ink-900)] font-bold" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
