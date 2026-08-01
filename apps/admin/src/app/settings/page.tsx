"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { BusinessProfileCard } from "@/components/settings/BusinessProfileCard"
import { OrderPreferencesCard } from "@/components/settings/OrderPreferencesCard"
import { Loader2 } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function SettingsPage() {
  const { role } = useAdminShell()
  const { api } = useAdminAuth()
  const ownerRole = isOwner(role)
  const [settings, setSettings] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!ownerRole) return
    api.getSettings().then(setSettings).catch(() => {}).finally(() => setLoading(false))
  }, [ownerRole])

  const handleSave = async (data: any) => {
    await api.updateSettings(data)
    const updated = await api.getSettings()
    setSettings(updated)
  }

  const handleToggle = async (field: string, value: boolean) => {
    await api.updateSettings({ [field]: value })
    const updated = await api.getSettings()
    setSettings(updated)
  }

  if (!ownerRole) {
    return <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
      <h2 className="text-base font-semibold mb-2">Owner only</h2>
      <p className="text-xs text-muted-foreground mb-6">Business settings are managed by the owner.</p>
      <Link href="/dashboard"><Button variant="default" className="h-10 text-xs px-5">Back to dashboard</Button></Link>
    </div>
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>
      <BusinessProfileCard name={settings?.businessName || ""} phone={settings?.contactPhone || ""} onNameChange={(v) => handleSave({ businessName: v })} onPhoneChange={(v) => handleSave({ contactPhone: v })} />
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-xs">
        <h2 className="text-sm font-semibold text-[var(--ink-900)]">Store pickup configuration</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Pickup remains unavailable at checkout until both real owner-supplied values are saved.</p>
        <div className="mt-4 grid gap-4">
          <label className="space-y-1 text-xs font-medium text-[var(--text-muted)]">Pickup location<input value={settings?.pickupLocation || ""} onChange={(event) => setSettings((current: any) => ({ ...current, pickupLocation: event.target.value }))} placeholder="Owner-supplied pickup address" className="block h-11 w-full rounded-xl border border-gray-200 px-3 text-sm text-[var(--ink-900)]" /></label>
          <label className="space-y-1 text-xs font-medium text-[var(--text-muted)]">Pickup instructions<textarea value={settings?.pickupInstructions || ""} onChange={(event) => setSettings((current: any) => ({ ...current, pickupInstructions: event.target.value }))} placeholder="Owner-supplied hours and collection instructions" rows={3} className="block w-full rounded-xl border border-gray-200 p-3 text-sm text-[var(--ink-900)]" /></label>
          <Button type="button" onClick={() => handleSave({ pickupLocation: settings?.pickupLocation?.trim() || null, pickupInstructions: settings?.pickupInstructions?.trim() || null })} className="w-fit">Save pickup configuration</Button>
        </div>
      </section>
      <OrderPreferencesCard requireApproval={settings?.requireApproval ?? true} stockAlert={settings?.stockAlert ?? true} packingView={settings?.packingView ?? true} onToggleApproval={() => handleToggle("requireApproval", !settings?.requireApproval)} onToggleStockAlert={() => handleToggle("stockAlert", !settings?.stockAlert)} onTogglePackingView={() => handleToggle("packingView", !settings?.packingView)} />
    </div>
  )
}
