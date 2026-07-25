"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { MOCK_AUDIT_LOG } from "@/content/mock/audit-data"
import { AuditTimeline } from "@/components/audit/AuditTimeline"

export default function AuditLogPage() {
  const { role } = useAdminShell()
  const ownerRole = isOwner(role)

  // Full-page block for non-owner roles
  if (!ownerRole) {
    return (
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
        <h2 className="text-base font-semibold text-[var(--ink-900)] mb-2">
          Owner only
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          The audit trail of sensitive actions is visible to the business owner only.
        </p>
        <Link href="/dashboard">
          <Button variant="default" className="h-10 text-xs px-5">
            Back to dashboard
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">
          Audit Log
        </h1>
        <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">
          آڈٹ لاگ · a record of sensitive actions taken across the panel
        </div>
      </div>

      {/* Audit Timeline */}
      <AuditTimeline entries={MOCK_AUDIT_LOG} />
    </div>
  )
}
