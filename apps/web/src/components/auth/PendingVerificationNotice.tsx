import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface PendingVerificationNoticeProps {
  businessName?: string
  className?: string
}

export function PendingVerificationNotice({ businessName = "Your Business", className }: PendingVerificationNoticeProps) {
  return (
    <div className={cn("p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-950 space-y-2", className)}>
      <div className="flex items-center justify-between font-bold text-[var(--color-amber-ink)]">
        <span className="flex items-center gap-2">
          <Clock className="size-4 text-amber-600 shrink-0" />
          <span>FR-AUTH-02 Business Account Pending Verification</span>
        </span>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold">
          Under Review
        </span>
      </div>
      <p className="leading-relaxed opacity-90">
        Registration submitted for <strong className="text-foreground">{businessName}</strong>. Our admin team is verifying your NTN/CNIC document. Standard catalog prices apply until verification completes.
      </p>
    </div>
  )
}
