"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { DEFAULT_SETTINGS, BusinessSettings } from "@/content/mock/settings-data"
import { BusinessProfileCard } from "@/components/settings/BusinessProfileCard"
import { OrderPreferencesCard } from "@/components/settings/OrderPreferencesCard"

export default function SettingsPage() {
  const { role, addToast } = useAdminShell()
  const ownerRole = isOwner(role)

  const [settings, setSettings] = React.useState<BusinessSettings>(DEFAULT_SETTINGS)

  // Full-page block for non-owner roles
  if (!ownerRole) {
    return (
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs font-sans">
        <h2 className="text-base font-semibold text-[var(--ink-900)] mb-2">
          Owner only
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Business settings are managed by the owner.
        </p>
        <Link href="/dashboard">
          <Button variant="default" className="h-10 text-xs px-5">
            Back to dashboard
          </Button>
        </Link>
      </div>
    )
  }

  const handleSaveSettings = () => {
    addToast({
      title: "Settings saved",
      type: "success",
    })
  }

  return (
    <div className="max-w-2xl space-y-4 font-sans">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">
          Settings
        </h1>
        <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">
          ترتیبات · business preferences
        </div>
      </div>

      {/* Business Profile Card */}
      <BusinessProfileCard
        name={settings.businessName}
        phone={settings.contactPhone}
        onNameChange={(name) => setSettings((prev) => ({ ...prev, businessName: name }))}
        onPhoneChange={(phone) => setSettings((prev) => ({ ...prev, contactPhone: phone }))}
      />

      {/* Order Preferences Card */}
      <OrderPreferencesCard
        requireApproval={settings.requireApproval}
        stockAlert={settings.stockAlert}
        packingView={settings.packingView}
        onToggleApproval={() =>
          setSettings((prev) => ({ ...prev, requireApproval: !prev.requireApproval }))
        }
        onToggleStockAlert={() =>
          setSettings((prev) => ({ ...prev, stockAlert: !prev.stockAlert }))
        }
        onTogglePackingView={() =>
          setSettings((prev) => ({ ...prev, packingView: !prev.packingView }))
        }
      />

      {/* Save Action */}
      <div className="pt-2">
        <Button
          variant="default"
          onClick={handleSaveSettings}
          className="h-10 text-xs px-5"
        >
          Save settings
        </Button>
      </div>
    </div>
  )
}
