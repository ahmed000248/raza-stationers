"use client"

import * as React from "react"
import { ClientBusiness } from "@raza-stationers/types"
import { formatPKR } from "@/lib/pricing"
import { CreditCard, ShieldCheck, AlertTriangle, Lock } from "lucide-react"

interface CreditStatusCardProps {
  clientBusiness: ClientBusiness | null
}

export function CreditStatusCard({ clientBusiness }: CreditStatusCardProps) {
  if (!clientBusiness) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card text-center space-y-2">
        <CreditCard className="size-8 text-muted-foreground mx-auto" />
        <h4 className="font-heading font-semibold text-sm text-[var(--color-ink-900)]">
          Wholesale Credit Available for Registered Shops
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Register your business and get verified to unlock 30-day payment credit terms up to Rs. 100,000.
        </p>
      </div>
    )
  }

  const creditLimit = clientBusiness.creditLimit || 50000
  const currentBalance = clientBusiness.outstandingBalance || 0
  const availableCredit = Math.max(0, creditLimit - currentBalance)
  const isBlocked = clientBusiness.creditStatus === "blocked" || clientBusiness.creditStatus === "suspended"

  return (
    <div className="p-6 rounded-2xl border border-border bg-card space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--color-evergreen-600)] text-white shadow-xs">
            <CreditCard className="size-5" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-base text-[var(--color-ink-900)]">
              Wholesale Business Credit (PY-01)
            </h4>
            <p className="text-xs text-muted-foreground">30-day revolving credit account</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isBlocked ? (
            <span className="rounded-full bg-destructive/10 text-destructive px-3 py-1 text-xs font-bold flex items-center gap-1">
              <Lock className="size-3" />
              <span>Credit Suspended</span>
            </span>
          ) : (
            <span className="rounded-full bg-[var(--color-evergreen-600)]/10 text-[var(--color-evergreen-600)] px-3 py-1 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="size-3" />
              <span>Credit Active</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Approved Credit Limit
          </span>
          <span className="font-heading font-bold text-xl text-[var(--color-ink-900)]">
            {formatPKR(creditLimit)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Current Balance (Owed)
          </span>
          <span className="font-heading font-bold text-xl text-amber-700">
            {formatPKR(currentBalance)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-evergreen-600)]/10 border border-[var(--color-evergreen-600)]/30 space-y-1">
          <span className="text-[11px] text-[var(--color-evergreen-600)] font-semibold uppercase tracking-wider block">
            Available Credit Line
          </span>
          <span className="font-heading font-bold text-xl text-[var(--color-evergreen-600)]">
            {formatPKR(availableCredit)}
          </span>
        </div>
      </div>

      {isBlocked && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-start gap-2">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>
            Credit facility is temporarily suspended. Please settle your outstanding balance of {formatPKR(currentBalance)} to restore Pay-Later credit checkout.
          </span>
        </div>
      )}
    </div>
  )
}
