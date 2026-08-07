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
  const { role } = useAdminShell()
  const ownerRole = isOwner(role)
  const [summary] = React.useState<any>(null)
  const [revenue] = React.useState<any[]>([])
  const [expenses] = React.useState<any[]>([])
  const [outstanding] = React.useState<any[]>([])

  if (!ownerRole) {
    return (
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
        <h2 className="text-base font-semibold mb-2">Owner only</h2>
        <p className="text-xs text-muted-foreground mb-6">Financial reports are visible to the business owner only.</p>
        <Link href="/dashboard"><Button variant="default" className="h-10 text-xs px-5">Back to dashboard</Button></Link>
      </div>
    )
  }

  const outstandingTotal = outstanding.reduce((sum: number, c: any) => sum + Number(c.creditLimit || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Accounting & Reports</h1>
        <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 font-medium">Backend rebuild in progress</span>
      </div>
      <FinancialTiles summary={summary} outstandingTotal={outstandingTotal} />
      <SalesTrendChart data={revenue} />
      <ExpensesAndOutstandingGrid expenses={expenses} outstanding={outstanding} />
    </div>
  )
}
