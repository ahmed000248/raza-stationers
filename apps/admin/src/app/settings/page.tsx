"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { BusinessProfileCard } from "@/components/settings/BusinessProfileCard"
import { OrderPreferencesCard } from "@/components/settings/OrderPreferencesCard"

export default function SettingsPage() {
  const { role } = useAdminShell()
  const ownerRole = isOwner(role)
  const [settings] = React.useState<any>({
    businessName: "Raza Stationers",
    contactPhone: "03001234567",
    pickupLocation: "Urdu Bazar, Karachi",
    pickupInstructions: "Collect from main counter",
    requireApproval: true,
    stockAlert: true,
    packingView: true,
  })

  const handleSave = async () => {
    alert("Backend rebuild in progress. Settings changes are disabled.")
  }

  if (!ownerRole) {
    return <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
      <h2 className="text-base font-semibold mb-2">Owner only</h2>
      <p className="text-xs text-muted-foreground mb-6">Business settings are managed by the owner.</p>
      <Link href="/dashboard"><Button variant="default" className="h-10 text-xs px-5">Back to dashboard</Button></Link>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 font-medium">Backend rebuild in progress</span>
      </div>
      <BusinessProfileCard name={settings?.businessName || ""} phone={settings?.contactPhone || ""} onNameChange={handleSave} onPhoneChange={handleSave} />
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-xs">
        <h2 className="text-sm font-semibold text-[var(--ink-900)]">Store pickup configuration</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Pickup location & instructions preview.</p>
        <div className="mt-4 grid gap-4">
          <label className="space-y-1 text-xs font-medium text-[var(--text-muted)]">Pickup location<input value={settings?.pickupLocation || ""} readOnly className="block h-11 w-full rounded-xl border border-gray-200 px-3 text-sm text-[var(--ink-900)] bg-muted" /></label>
          <label className="space-y-1 text-xs font-medium text-[var(--text-muted)]">Pickup instructions<textarea value={settings?.pickupInstructions || ""} readOnly rows={3} className="block w-full rounded-xl border border-gray-200 p-3 text-sm text-[var(--ink-900)] bg-muted" /></label>
          <Button type="button" onClick={handleSave} className="w-fit">Save pickup configuration (Disabled)</Button>
        </div>
      </section>
      <OrderPreferencesCard requireApproval={settings?.requireApproval ?? true} stockAlert={settings?.stockAlert ?? true} packingView={settings?.packingView ?? true} onToggleApproval={handleSave} onToggleStockAlert={handleSave} onTogglePackingView={handleSave} />
    </div>
  )
}
