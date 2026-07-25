"use client"

import * as React from "react"
import { PaymentMethodType } from "@raza-stationers/validation"
import { CreditCard, Wallet, Banknote, Upload, Check, AlertCircle, Building2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaymentMethodPickerProps {
  value: PaymentMethodType
  onChange: (method: PaymentMethodType) => void
  isCreditActive?: boolean
  creditLimit?: number
  outstandingBalance?: number
  receiptUploaded?: boolean
  onUploadReceipt?: () => void
  className?: string
}

export function PaymentMethodPicker({
  value,
  onChange,
  isCreditActive = false,
  creditLimit = 50000,
  outstandingBalance = 12500,
  receiptUploaded = false,
  onUploadReceipt,
  className,
}: PaymentMethodPickerProps) {
  const availableCredit = Math.max(0, creditLimit - outstandingBalance)

  const paymentOptions: {
    id: PaymentMethodType
    label: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
    requiresReceipt?: boolean
    isCredit?: boolean
  }[] = [
    {
      id: "CASH_ON_DELIVERY",
      label: "Cash on Delivery",
      description: "Pay cash upon delivery at your shop or office",
      icon: Banknote,
    },
    {
      id: "ONLINE_EASYPAISA",
      label: "Easypaisa",
      description: "Pay instantly via Easypaisa mobile account",
      icon: Wallet,
    },
    {
      id: "ONLINE_JAZZCASH",
      label: "JazzCash",
      description: "Pay instantly via JazzCash mobile account",
      icon: Wallet,
    },
    {
      id: "ONLINE_NAYAPAY",
      label: "NayaPay",
      description: "Pay instantly via NayaPay digital wallet",
      icon: Wallet,
    },
    {
      id: "ONLINE_BANK_TRANSFER",
      label: "Manual Bank Transfer",
      description: "Direct bank transfer with receipt slip upload",
      icon: Building2,
      requiresReceipt: true,
    },
  ]

  // Conditionally include Pay Later Credit option ONLY if credit is active (PY-01, FR-PAY-04)
  if (isCreditActive) {
    paymentOptions.push({
      id: "PAY_LATER_CREDIT",
      label: "Pay Later Wholesale Credit",
      description: `30-day business credit term (Available: Rs. ${availableCredit.toLocaleString()})`,
      icon: CreditCard,
      badge: "Credit Active",
      isCredit: true,
    })
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-heading font-semibold text-sm text-[var(--color-ink-900)]">
          Select Payment Method
        </h4>
        <span className="text-xs text-muted-foreground">FR-CRT-02 / PY-01</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {paymentOptions.map((opt) => {
          const Icon = opt.icon
          const isSelected = value === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "relative flex flex-col items-start p-4 rounded-xl border text-left transition-all select-none focus:outline-none focus:ring-2 focus:ring-ring",
                isSelected
                  ? "border-[var(--color-evergreen-600)] bg-[var(--color-evergreen-600)]/10 text-[var(--color-ink-900)] font-semibold shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-[var(--color-evergreen-600)] shrink-0" />
                  <span className="font-semibold text-sm text-foreground">{opt.label}</span>
                </div>
                {opt.badge && (
                  <span className="rounded-full bg-[var(--color-evergreen-600)] px-2 py-0.5 text-[10px] font-bold text-white">
                    {opt.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
            </button>
          )
        })}
      </div>

      {/* Manual Bank Transfer Receipt Upload Simulator */}
      {value === "ONLINE_BANK_TRANSFER" && (
        <div className="p-4 rounded-xl border border-dashed border-[var(--color-evergreen-600)]/40 bg-[var(--color-evergreen-600)]/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-ink-900)]">
              Manual Bank Transfer Receipt Upload
            </span>
            <span className="text-[10px] text-muted-foreground">Account: Habib Bank Ltd 0123-4567890</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant={receiptUploaded ? "secondary" : "outline"}
              onClick={onUploadReceipt}
              className="rounded-lg gap-2"
            >
              {receiptUploaded ? (
                <>
                  <Check className="size-4 text-[var(--color-evergreen-600)]" />
                  <span>Receipt Uploaded</span>
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  <span>Simulate Receipt Slip Upload</span>
                </>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              {receiptUploaded ? "receipt_slip_v1.pdf attached" : "JPG, PNG or PDF slip required"}
            </span>
          </div>
        </div>
      )}

      {/* Pay Later Credit Summary Banner */}
      {value === "PAY_LATER_CREDIT" && (
        <div className="p-4 rounded-xl border border-[var(--color-evergreen-600)]/30 bg-[var(--color-evergreen-600)]/10 text-xs text-[var(--color-ink-900)] space-y-2">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-[var(--color-evergreen-600)]" />
              <span>Wholesale Business Credit Account Active</span>
            </span>
            <span>Credit Limit: Rs. {creditLimit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground text-[11px]">
            <span>Current Outstanding: Rs. {outstandingBalance.toLocaleString()}</span>
            <span className="font-bold text-foreground">Available Credit: Rs. {availableCredit.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
