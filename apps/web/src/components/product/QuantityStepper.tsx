"use client"

import * as React from "react"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuantityStepperProps {
  quantity: number
  onChange: (quantity: number) => void
  min?: number
  max?: number
  className?: string
}

export function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  max = 999,
  className,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (quantity > min) onChange(quantity - 1)
  }

  const handleIncrement = () => {
    if (quantity < max) onChange(quantity + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (isNaN(val)) {
      onChange(min)
    } else {
      onChange(Math.max(min, Math.min(max, val)))
    }
  }

  return (
    <div className={cn("inline-flex items-center rounded-xl border border-border bg-card p-1 shadow-xs", className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= min}
        className="flex size-8 items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" />
      </button>

      <input
        type="number"
        min={min}
        max={max}
        value={quantity}
        onChange={handleInputChange}
        className="w-12 text-center text-sm font-semibold font-heading bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max}
        className="flex size-8 items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
