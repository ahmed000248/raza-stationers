"use client"

import * as React from "react"
import { DiscountTierGrid } from "@/components/discount-credit/DiscountTierGrid"
import { CreditLimitTable } from "@/components/discount-credit/CreditLimitTable"

export default function DiscountCreditPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">
          Discount & Credit
        </h1>
        <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">
          رعایت اور کریڈٹ · pricing tiers and client credit limits
        </div>
      </div>

      {/* Discount Tiers Section */}
      <DiscountTierGrid />

      {/* Credit Limits Section */}
      <CreditLimitTable />
    </div>
  )
}
