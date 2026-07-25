"use client"

import * as React from "react"
import { mockDiscountChangeLogs } from "@/content/mock/admin-data"
import { DiscountChangeLog } from "@raza-stationers/types"
import { validateDiscountChangeReason } from "@/lib/admin-ops"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Percent, AlertCircle, Save, FileText } from "lucide-react"

export function DiscountRulesManager() {
  const [logs, setLogs] = React.useState<DiscountChangeLog[]>(mockDiscountChangeLogs)
  const [currentDiscount, setCurrentDiscount] = React.useState(15)
  const [newDiscount, setNewDiscount] = React.useState(18)
  const [reason, setReason] = React.useState("")
  const [error, setError] = React.useState("")

  const handleUpdateDiscount = (e: React.FormEvent) => {
    e.preventDefault()

    // FR-PRC-05 Guard: Mandatory reason required for discount override changes
    if (!validateDiscountChangeReason(reason)) {
      setError("Mandatory audit reason required for discount percentage changes (FR-PRC-05). Minimum 5 characters.")
      return
    }

    setError("")

    const newLog: DiscountChangeLog = {
      id: `dcl-${Date.now()}`,
      clientBusinessId: "cb-101",
      previousValue: `${currentDiscount}%`,
      newValue: `${newDiscount}%`,
      changedByUserId: "u-staff-1",
      reason,
      createdAt: new Date().toISOString(),
    }

    setLogs((prev) => [newLog, ...prev])
    setCurrentDiscount(newDiscount)
    setReason("")
  }

  return (
    <div className="space-y-6 p-6 rounded-2xl border border-border bg-card shadow-xs">
      <div className="border-b border-border pb-4">
        <h3 className="font-heading font-bold text-base text-[var(--color-ink-900)] flex items-center gap-2">
          <Percent className="size-4 text-[var(--color-evergreen-600)]" />
          <span>Discount Rules & Immutable Audit Change Logs (FR-PRC-01..05)</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure per-client business discount overrides and maintain audit logs with mandatory change reasons (FR-PRC-05).
        </p>
      </div>

      {/* Override Change Form */}
      <form onSubmit={handleUpdateDiscount} className="p-4 rounded-xl bg-muted/40 border border-border space-y-4">
        <span className="text-xs font-bold text-foreground block">
          Update Client Business Discount Override (Al-Raza Book Depot)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Current Discount Tier</label>
            <Input value={`${currentDiscount}%`} disabled className="bg-muted cursor-not-allowed font-bold" />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">New Discount Tier (%)</label>
            <Input
              type="number"
              min={0}
              max={50}
              value={newDiscount}
              onChange={(e) => setNewDiscount(parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <div className="space-y-1 sm:col-span-1">
            <label className="font-semibold text-foreground">Mandatory Reason (FR-PRC-05) *</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Approved bulk purchase relationship upgrade"
              className={error ? "border-destructive" : ""}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-1.5 animate-shake">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="sm" className="rounded-full gap-1.5 font-semibold">
            <Save className="size-4" />
            <span>Save Discount Change & Log (FR-PRC-05)</span>
          </Button>
        </div>
      </form>

      {/* Audit Log Table */}
      <div className="space-y-3">
        <h4 className="font-heading font-semibold text-sm text-[var(--color-ink-900)]">
          FR-PRC-05 Immutable Discount Change Logs
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-2">Timestamp</th>
                <th className="py-2.5 px-2">Account ID</th>
                <th className="py-2.5 px-2">Prev $\rightarrow$ New</th>
                <th className="py-2.5 px-2">Mandatory Change Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20">
                  <td className="py-2.5 px-2 text-muted-foreground">{log.createdAt.split("T")[0]}</td>
                  <td className="py-2.5 px-2 font-semibold">{log.clientBusinessId}</td>
                  <td className="py-2.5 px-2 font-bold text-[var(--color-evergreen-600)]">
                    {log.previousValue} $\rightarrow$ {log.newValue}
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
