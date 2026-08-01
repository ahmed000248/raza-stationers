"use client"

import * as React from "react"
import { BusinessUserRole } from "@raza-stationers/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { UserPlus, Briefcase } from "lucide-react"
import { normalizePakistaniMobile } from "@raza-stationers/validation"

interface StaffMember {
  id: string
  name: string
  mobileNumber: string
  email: string
  businessRole: BusinessUserRole
  status: "active" | "invited"
}

const mockStaff: StaffMember[] = [
  {
    id: "link-01",
    name: "Ahmed Raza",
    mobileNumber: "03001234567",
    email: "ahmed@alrazabookdepot.com",
    businessRole: "owner",
    status: "active",
  },
  {
    id: "link-02",
    name: "Mohammad Usman",
    mobileNumber: "03339876543",
    email: "usman@alrazabookdepot.com",
    businessRole: "manager",
    status: "active",
  },
  {
    id: "link-03",
    name: "Bilal Farooq",
    mobileNumber: "03125554321",
    email: "bilal@alrazabookdepot.com",
    businessRole: "purchase_officer",
    status: "active",
  },
]

export function StaffTab() {
  const [staffList, setStaffList] = React.useState<StaffMember[]>(mockStaff)
  const [showInviteForm, setShowInviteForm] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [newMobile, setNewMobile] = React.useState("")
  const [newRole, setNewRole] = React.useState<BusinessUserRole>("purchase_officer")

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    const mobileNumber = normalizePakistaniMobile(newMobile)
    if (!newName || !mobileNumber) return

    const newMember: StaffMember = {
      id: `link-${Date.now()}`,
      name: newName,
      mobileNumber,
      email: `${newName.toLowerCase().replace(/\s+/g, ".")}@alrazabookdepot.com`,
      businessRole: newRole,
      status: "invited",
    }

    setStaffList((prev) => [...prev, newMember])
    setNewName("")
    setNewMobile("")
    setShowInviteForm(false)
  }

  const roleLabel: Record<BusinessUserRole, string> = {
    owner: "Business Owner",
    manager: "Shop Manager",
    purchase_officer: "Purchase Officer",
    branch_employee: "Branch Employee",
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg text-[var(--color-ink-900)]">
                Staff & Authorized Logins
              </h3>
              <Badge variant="evergreen" className="text-xs">
                {staffList.length} Linked Members
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              FR-CB-05 & FR-CB-06 Linked individual logins sharing shop pricing, order history and credit balance
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="rounded-full gap-2 text-xs shrink-0"
          >
            <UserPlus className="size-4" />
            <span>{showInviteForm ? "Cancel Invite" : "Link New Staff Member"}</span>
          </Button>
        </div>

        {showInviteForm && (
          <form onSubmit={handleInvite} className="p-4 rounded-xl bg-muted/50 border border-border space-y-4 text-xs">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <UserPlus className="size-4 text-[var(--color-evergreen-600)]" />
              <span>Link Staff Account to Business</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Full Name *</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tariq Khan"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Mobile Number *</label>
                <Input
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel-national"
                  maxLength={11}
                  placeholder="03XXXXXXXXX"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Business Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as BusinessUserRole)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="manager">Shop Manager</option>
                  <option value="purchase_officer">Purchase Officer</option>
                  <option value="branch_employee">Branch Employee</option>
                </select>
              </div>
            </div>

            <Button type="submit" size="sm" className="rounded-full">
              Send Invite Link
            </Button>
          </form>
        )}

        <div className="divide-y divide-border/60">
          {staffList.map((member) => (
            <div key={member.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-[var(--color-evergreen-600)]/10 text-[var(--color-evergreen-600)] flex items-center justify-center font-bold text-sm shrink-0">
                  {member.name.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-sm text-[var(--color-ink-900)]">
                      {member.name}
                    </h5>
                    {member.businessRole === "owner" && (
                      <Badge variant="evergreen" className="text-[10px] py-0">
                        Primary Owner
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.mobileNumber} • {member.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border">
                  <Briefcase className="size-3.5 text-[var(--color-evergreen-600)]" />
                  <span>{roleLabel[member.businessRole]}</span>
                </div>

                <Badge
                  variant={member.status === "active" ? "outline" : "amber"}
                  className="text-xs px-2.5 py-0.5"
                >
                  {member.status === "active" ? "Active Link" : "Invite Pending"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
