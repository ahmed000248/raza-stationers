"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { MOCK_STAFF_MEMBERS, StaffMember } from "@/content/mock/staff-data"
import { StaffTable } from "@/components/staff/StaffTable"
import { AddStaffModal } from "@/components/staff/AddStaffModal"

export default function StaffManagementPage() {
  const { role, addToast } = useAdminShell()
  const ownerRole = isOwner(role)

  const [staff, setStaff] = React.useState<StaffMember[]>(MOCK_STAFF_MEMBERS)
  const [addModalOpen, setAddModalOpen] = React.useState<boolean>(false)

  // Full-page block for non-owner roles
  if (!ownerRole) {
    return (
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
        <h2 className="text-base font-semibold text-[var(--ink-900)] mb-2">
          Owner only
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Staff accounts and access are managed by the business owner.
        </p>
        <Link href="/dashboard">
          <Button variant="default" className="h-10 text-xs px-5">
            Back to dashboard
          </Button>
        </Link>
      </div>
    )
  }

  const handleToggleActive = (id: string) => {
    let memberName = ""
    let newActiveState = false

    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          memberName = s.name
          newActiveState = !s.active
          return { ...s, active: newActiveState }
        }
        return s
      })
    )

    if (memberName) {
      addToast({
        title: `${memberName} ${newActiveState ? "activated" : "deactivated"}`,
        type: newActiveState ? "success" : "warning",
      })
    }
  }

  const handleAddStaff = (newStaff: {
    name: string
    role: string
    phone: string
  }) => {
    const todayIso = new Date().toISOString()
    const member: StaffMember = {
      id: `s-${Date.now()}`,
      name: newStaff.name,
      role: newStaff.role,
      phone: newStaff.phone,
      active: true,
      lastLogin: todayIso,
    }

    setStaff((prev) => [...prev, member])
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">
            Staff Management
          </h1>
          <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">
            عملے کا انتظام · team accounts and permissions
          </div>
        </div>

        {/* Action Button */}
        <div>
          <Button
            variant="default"
            onClick={() => setAddModalOpen(true)}
            className="h-10 text-xs px-4"
          >
            + Add staff
          </Button>
        </div>
      </div>

      {/* Staff Table */}
      <StaffTable staff={staff} onToggleActive={handleToggleActive} />

      {/* Add Staff Modal */}
      <AddStaffModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddStaff={handleAddStaff}
      />
    </div>
  )
}
