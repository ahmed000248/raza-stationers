import * as React from "react"
import { AlertCircle, ShieldCheck } from "lucide-react"
import { formatPKR } from "@/lib/pricing"
import { cn } from "@/lib/utils"

interface MinOrderNoticeProps {
  subtotal: number
  threshold?: number
  className?: string
}

export function MinOrderNotice({ subtotal, threshold = 2000, className }: MinOrderNoticeProps) {
  const isCompliant = subtotal >= threshold
  const remaining = Math.max(0, threshold - subtotal)

  if (isCompliant) {
    return (
      <div className={cn("flex items-center gap-2 p-3 rounded-xl bg-[var(--color-evergreen-600)]/10 text-xs font-medium text-[var(--color-ink-900)]", className)}>
        <ShieldCheck className="size-4 text-[var(--color-evergreen-600)] shrink-0" />
        <span>OF-01 Compliant: Subtotal meets the {formatPKR(threshold)} minimum order requirement.</span>
      </div>
    )
  }

  return (
    <div className={cn("p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1 animate-shake", className)}>
      <div className="flex items-center gap-1.5 font-bold">
        <AlertCircle className="size-4 shrink-0" />
        <span>OF-01 Minimum Order Requirement Not Met</span>
      </div>
      <p className="leading-relaxed opacity-90">
        Current subtotal is {formatPKR(subtotal)}. Minimum order threshold for wholesale delivery is {formatPKR(threshold)}. Please add {formatPKR(remaining)} more items to continue.
      </p>
    </div>
  )
}
