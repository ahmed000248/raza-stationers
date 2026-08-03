"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { AuditTimeline } from "@/components/audit/AuditTimeline"
import { createAPIClient } from "@raza-stationers/api"
import { Loader2 } from "lucide-react"
import { getApiBaseUrl } from "@/lib/public-config"

const API_BASE = getApiBaseUrl()

export default function AuditLogPage() {
  const { role } = useAdminShell()
  const ownerRole = isOwner(role)
  const [logs, setLogs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!ownerRole) return
    const api = createAPIClient({ baseUrl: API_BASE })
    api.getAuditLogs().then((data: any) => setLogs(data.items || [])).catch(() => {}).finally(() => setLoading(false))
  }, [ownerRole])

  if (!ownerRole) {
    return <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
      <h2 className="text-base font-semibold text-[var(--ink-900)] mb-2">Owner only</h2>
      <p className="text-xs text-[var(--text-muted)] mb-6">The audit trail is visible to the business owner only.</p>
      <Link href="/dashboard"><Button variant="default" className="h-10 text-xs px-5">Back to dashboard</Button></Link>
    </div>
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Audit Log</h1>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <AuditTimeline entries={logs} />
      )}
    </div>
  )
}
