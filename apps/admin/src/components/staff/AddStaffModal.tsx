"use client"

import * as React from "react"
import { Button, Dialog, DialogHeader, DialogTitle } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"

interface StaffInvite { name: string; email: string; mobileNumber: string; role: "admin" | "packing" | "delivery" }

export function AddStaffModal({ open, onClose, onInvite }: { open: boolean; onClose: () => void; onInvite: (staff: StaffInvite) => Promise<void> }) {
  const { addToast } = useAdminShell()
  const [form, setForm] = React.useState<StaffInvite>({ name: "", email: "", mobileNumber: "", role: "admin" })
  const [saving, setSaving] = React.useState(false)

  const save = async () => {
    if (form.name.trim().length < 2 || !form.email.includes("@") || !/^03\d{9}$/.test(form.mobileNumber)) {
      addToast({ title: "Check the invitation details", description: "Name, valid email and mobile in 03XXXXXXXXX format are required.", type: "error" }); return
    }
    setSaving(true)
    try { await onInvite({ ...form, name: form.name.trim(), email: form.email.trim().toLowerCase() }); setForm({ name: "", email: "", mobileNumber: "", role: "admin" }); onClose() }
    catch (cause) { addToast({ title: "Invitation failed", description: cause instanceof Error ? cause.message : undefined, type: "error" }) }
    finally { setSaving(false) }
  }

  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><div><DialogHeader className="mb-4"><DialogTitle>Invite staff member</DialogTitle><p className="text-xs text-[var(--text-muted)]">The staff member receives a Supabase email invitation. Only trusted application roles listed here can be assigned.</p></DialogHeader><div className="space-y-3.5"><label className="block space-y-1 text-xs">Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" className="block h-11 w-full rounded-xl border border-gray-200 px-3 text-sm" /></label><label className="block space-y-1 text-xs">Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" className="block h-11 w-full rounded-xl border border-gray-200 px-3 text-sm" /></label><label className="block space-y-1 text-xs">Mobile number<input value={form.mobileNumber} onChange={(event) => setForm({ ...form, mobileNumber: event.target.value })} inputMode="tel" maxLength={11} placeholder="03XXXXXXXXX" className="block h-11 w-full rounded-xl border border-gray-200 px-3 text-sm" /></label><label className="block space-y-1 text-xs">Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as StaffInvite["role"] })} className="block h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"><option value="admin">Admin / Operator</option><option value="packing">Packing</option><option value="delivery">Delivery</option></select></label></div><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? "Sending…" : "Send secure invitation"}</Button></div></div></Dialog>
}
