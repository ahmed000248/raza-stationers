"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { FinancialTiles } from "@/components/accounting/FinancialTiles"
import { SalesTrendChart } from "@/components/accounting/SalesTrendChart"
import { ExpensesAndOutstandingGrid } from "@/components/accounting/ExpensesAndOutstandingGrid"
import { createAPIClient } from "@raza-stationers/api"
import { Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function AccountingPage() {
  const { role } = useAdminShell()
  const ownerRole = isOwner(role)
  const [summary, setSummary] = React.useState<any>(null)
  const [revenue, setRevenue] = React.useState<any[]>([])
  const [expenses, setExpenses] = React.useState<any[]>([])
  const [outstanding, setOutstanding] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!ownerRole) return
    const api = createAPIClient({ baseUrl: API_BASE })
    Promise.all([
      api.getAccountingSummary().then(setSummary).catch(() => {}),
      api.getAccountingRevenue().then(setRevenue).catch(() => {}),
      api.getAccountingExpenses().then((d: any) => setExpenses(d.items || [])).catch(() => {}),
      api.getOutstandingClients().then(setOutstanding).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [ownerRole])

  if (!ownerRole) {
    return <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
      <h2 className="text-base font-semibold mb-2">Owner only</h2>
      <p className="text-xs text-muted-foreground mb-6">Financial reports are visible to the business owner only.</p>
      <Link href="/dashboard"><Button variant="default" className="h-10 text-xs px-5">Back to dashboard</Button></Link>
    </div>
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  const outstandingTotal = outstanding.reduce((sum: number, c: any) => sum + Number(c.creditLimit || 0), 0)

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Accounting & Reports</h1>
      <FinancialTiles summary={summary} outstandingTotal={outstandingTotal} />
      <SalesTrendChart data={revenue} />
      <ExpensesAndOutstandingGrid expenses={expenses} outstanding={outstanding} />
    </div>
  )
}
