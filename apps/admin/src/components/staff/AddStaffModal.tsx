"use client"

import * as React from "react"
import { Button, Dialog, DialogHeader, DialogTitle } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"

interface AddStaffModalProps {
  open: boolean
  onClose: () => void
  onAddStaff: (staff: { name: string; role: string; phone: string }) => void
}

export function AddStaffModal({
  open,
  onClose,
  onAddStaff,
}: AddStaffModalProps) {
  const { addToast } = useAdminShell()
  const [name, setName] = React.useState<string>("")
  const [role, setRole] = React.useState<string>("Admin / Operator")
  const [phone, setPhone] = React.useState<string>("")

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      addToast({
        title: "Validation error",
        description: "Both name and phone number are required.",
        type: "error",
      })
      return
    }

    onAddStaff({
      name: name.trim(),
      role,
      phone: phone.trim(),
    })

    addToast({
      title: `${name.trim()} added to staff`,
      type: "success",
    })

    // Reset and close
    setName("")
    setRole("Admin / Operator")
    setPhone("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div>
        <DialogHeader className="mb-4">
          <DialogTitle className="font-heading text-lg font-semibold text-[var(--ink-900)]">
            Add staff member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5 font-sans">
          {/* Full Name */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)]"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)] bg-white"
            >
              <option value="Admin / Operator">Admin / Operator</option>
              <option value="Delivery Worker">Delivery Worker</option>
              <option value="Warehouse Worker">Warehouse Worker</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Phone number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0300-1234567"
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)]"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2.5 mt-6 justify-end">
          <Button variant="outline" onClick={onClose} className="h-10 text-xs px-4">
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave} className="h-10 text-xs px-5">
            Add staff
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
