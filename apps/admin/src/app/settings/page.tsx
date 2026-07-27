"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { BusinessProfileCard } from "@/components/settings/BusinessProfileCard"
import { OrderPreferencesCard } from "@/components/settings/OrderPreferencesCard"
import { createAPIClient } from "@raza-stationers/api"
import { Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function SettingsPage() {
  const { role } = useAdminShell()
  const ownerRole = isOwner(role)
  const [settings, setSettings] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  const api = createAPIClient({ baseUrl: API_BASE })

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
      <OrderPreferencesCard requireApproval={settings?.requireApproval ?? true} stockAlert={settings?.stockAlert ?? true} packingView={settings?.packingView ?? true} onToggleApproval={() => handleToggle("requireApproval", !settings?.requireApproval)} onToggleStockAlert={() => handleToggle("stockAlert", !settings?.stockAlert)} onTogglePackingView={() => handleToggle("packingView", !settings?.packingView)} />
    </div>
  )
}
