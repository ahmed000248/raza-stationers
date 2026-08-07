"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { StaffTable } from "@/components/staff/StaffTable"
import { AddStaffModal } from "@/components/staff/AddStaffModal"

export default function StaffManagementPage() {
  const { role } = useAdminShell()
  const ownerRole = isOwner(role)
  const [staff] = React.useState<any[]>([])
  const [addModalOpen, setAddModalOpen] = React.useState(false)

  if (!ownerRole) {
    return <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
      <h2 className="text-base font-semibold mb-2">Owner only</h2>
      <p className="text-xs text-muted-foreground mb-6">Staff accounts and access are managed by the business owner.</p>
      <Link href="/dashboard"><Button variant="default" className="h-10 text-xs px-5">Back to dashboard</Button></Link>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-heading text-2xl font-bold">Staff Management</h1></div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 font-medium">Backend rebuild in progress</span>
          <Button variant="default" onClick={() => setAddModalOpen(true)} className="h-10 text-xs px-4">+ Add Staff</Button>
        </div>
      </div>
      <StaffTable staff={staff} onToggleActive={async () => alert("Backend rebuild in progress.")} />
      <AddStaffModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onInvite={async () => alert("Backend rebuild in progress.")} />
    </div>
  )
}
