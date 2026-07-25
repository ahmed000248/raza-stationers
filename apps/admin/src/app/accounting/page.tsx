"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { FinancialTiles } from "@/components/accounting/FinancialTiles"
import { SalesTrendChart } from "@/components/accounting/SalesTrendChart"
import { ExpensesAndOutstandingGrid } from "@/components/accounting/ExpensesAndOutstandingGrid"

export default function AccountingPage() {
  const { role, addToast } = useAdminShell()
  const ownerRole = isOwner(role)

  // Full-page block for non-owner roles
  if (!ownerRole) {
    return (
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
        <h2 className="text-base font-semibold text-[var(--ink-900)] mb-2">
          Owner only
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Financial reports are visible to the business owner only.
        </p>
        <Link href="/dashboard">
          <Button variant="default" className="h-10 text-xs px-5">
            Back to dashboard
          </Button>
        </Link>
      </div>
    )
  }

  const handleExportCSV = () => {
    addToast({
      title: "Report exported — check your downloads",
      type: "success",
    })
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">
          Accounting & Reports
        </h1>
        <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">
          حساب کتاب · revenue, expenses and outstanding balances
        </div>
      </div>

      {/* Summary KPI Tiles */}
      <FinancialTiles />

      {/* Sales Trend Chart */}
      <SalesTrendChart />

      {/* Expenses & Outstanding Grid */}
      <ExpensesAndOutstandingGrid />

      {/* Export Action */}
      <div className="pt-2">
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="h-10 text-xs px-5"
        >
          Export monthly report (CSV)
        </Button>
      </div>
    </div>
  )
}
