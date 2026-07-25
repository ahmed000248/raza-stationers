"use client"

import * as React from "react"
import { mockStaffMembers, StaffWithUser } from "@/content/mock/admin-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, ShieldCheck, Check, Power } from "lucide-react"

export function StaffManagementTable() {
  const [staffList, setStaffList] = React.useState<StaffWithUser[]>(mockStaffMembers)
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [role, setRole] = React.useState<"admin" | "packing" | "delivery">("packing")

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return

    const newStaff: StaffWithUser = {
      id: `sp-${Date.now()}`,
      userId: `u-${Date.now()}`,
      name,
      phone,
      staffRole: role,
      isActive: true,
      joinDate: new Date().toISOString().split("T")[0],
    }

    setStaffList((prev) => [newStaff, ...prev])
    setName("")
    setPhone("")
  }

  const toggleActive = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    )
  }

  return (
    <div className="space-y-6 p-6 rounded-2xl border border-border bg-card shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-heading font-bold text-base text-[var(--color-ink-900)] flex items-center gap-2">
            <Users className="size-4 text-[var(--color-evergreen-600)]" />
            <span>Staff Account Management (FR-STF-01..06)</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assign staff operational roles (Admin, Packing, Delivery) and manage active permissions.
          </p>
        </div>
      </div>

      {/* Add New Staff Form */}
      <form onSubmit={handleAddStaff} className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
        <span className="text-xs font-bold text-foreground block">Add Operations Staff Member</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Staff Member Name"
          />
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile Phone Number"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none"
          >
            <option value="packing">Packing Staff</option>
            <option value="delivery">Delivery Rider</option>
            <option value="admin">System Admin</option>
          </select>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" className="rounded-full gap-1.5 font-semibold">
            <UserPlus className="size-4" />
            <span>Add Staff Member</span>
          </Button>
        </div>
      </form>

      {/* Staff Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <th className="py-3 px-2">Staff Name</th>
              <th className="py-3 px-2">Phone</th>
              <th className="py-3 px-2 text-center">Operational Role</th>
              <th className="py-3 px-2 text-center">Join Date</th>
              <th className="py-3 px-2 text-center">Status</th>
              <th className="py-3 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {staffList.map((staff) => (
              <tr key={staff.id} className="hover:bg-muted/20">
                <td className="py-3 px-2 font-bold text-foreground">{staff.name}</td>
                <td className="py-3 px-2 text-muted-foreground">{staff.phone}</td>
                <td className="py-3 px-2 text-center font-medium capitalize">
                  <Badge variant={staff.staffRole === "admin" ? "evergreen" : "mist"}>
                    {staff.staffRole}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-center text-muted-foreground">{staff.joinDate}</td>
                <td className="py-3 px-2 text-center">
                  {staff.isActive ? (
                    <span className="text-[var(--color-evergreen-600)] font-bold">Active</span>
                  ) : (
                    <span className="text-muted-foreground">Inactive</span>
                  )}
                </td>
                <td className="py-3 px-2 text-right">
                  <Button
                    size="xs"
                    variant={staff.isActive ? "outline" : "default"}
                    onClick={() => toggleActive(staff.id)}
                    className="rounded-full gap-1 text-[11px]"
                  >
                    <Power className="size-3" />
                    <span>{staff.isActive ? "Deactivate" : "Activate"}</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
