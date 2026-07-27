"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { StaffTable } from "@/components/staff/StaffTable"
import { AddStaffModal } from "@/components/staff/AddStaffModal"
import { createAPIClient } from "@raza-stationers/api"
import { Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function StaffManagementPage() {
  const { role, addToast } = useAdminShell()
  const ownerRole = isOwner(role)
  const [staff, setStaff] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addModalOpen, setAddModalOpen] = React.useState(false)

  const api = createAPIClient({ baseUrl: API_BASE })
  const fetchStaff = React.useCallback(async () => {
    try { const d = await api.listStaff(); setStaff(d || []) } catch {} finally { setLoading(false) }
  }, [])

  React.useEffect(() => { if (ownerRole) fetchStaff() }, [ownerRole])

  if (!ownerRole) {
    return <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
      <h2 className="text-base font-semibold mb-2">Owner only</h2>
      <p className="text-xs text-muted-foreground mb-6">Staff accounts and access are managed by the business owner.</p>
      <Link href="/dashboard"><Button variant="default" className="h-10 text-xs px-5">Back to dashboard</Button></Link>
    </div>
  }

  const handleCreateStaff = async (data: { name: string; mobileNumber: string; password: string; role: string }) => {
    await api.createStaff(data)
    setAddModalOpen(false)
    fetchStaff()
  }

  const handleToggleActive = async (id: string) => {
    await api.toggleStaffActive(id)
    fetchStaff()
  }

  const handleChangeRole = async (id: string, role: string) => {
    await api.changeStaffRole(id, role)
    fetchStaff()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-heading text-2xl font-bold">Staff Management</h1></div>
        <Button variant="default" onClick={() => setAddModalOpen(true)} className="h-10 text-xs px-4">+ Add Staff</Button>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin" /></div> : (
        <StaffTable staff={staff} onToggleActive={handleToggleActive} />
      )}
      <AddStaffModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onAddStaff={(s) => handleCreateStaff({ name: s.name, mobileNumber: s.phone, password: "changeme123", role: s.role })} />
    </div>
  )
}
