"use client"

import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { Building2, Save, Check, ShieldCheck } from "lucide-react"

export function BusinessProfileTab() {
  const { user, clientBusiness, accountStatus } = useAuth()

  const [shopName, setShopName] = React.useState(clientBusiness?.businessName || "Al-Raza Book Depot & Stationers")
  const [ownerName, setOwnerName] = React.useState(user?.name || "Ahmed Raza")
  const [phone, setPhone] = React.useState(user?.mobileNumber || "")
  const [email, setEmail] = React.useState(clientBusiness?.email || "ahmed@alrazabookdepot.com")
  const [city, setCity] = React.useState(clientBusiness?.city || "Karachi")
  const [address, setAddress] = React.useState(clientBusiness?.address || "Shop #42, Main Stationery Market, Urdu Bazar")
  const [saved, setSaved] = React.useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSave} className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="font-heading font-bold text-base text-[var(--color-ink-900)] flex items-center gap-2">
            <Building2 className="size-4 text-[var(--color-evergreen-600)]" />
            <span>Business & Shop Profile (FR-ACC-01)</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your verified business credentials and primary delivery address.
          </p>
        </div>

        <span className="rounded-full bg-[var(--color-evergreen-600)]/10 text-[var(--color-evergreen-600)] px-3 py-1 text-xs font-bold flex items-center gap-1">
          <ShieldCheck className="size-3" />
          <span>Status: {accountStatus.toUpperCase()}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Registered Shop / Business Name</label>
          <Input value={shopName} onChange={(e) => setShopName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Primary Owner / Contact Name</label>
          <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Mobile Phone Number</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel-national" maxLength={11} placeholder="03XXXXXXXXX" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Business Email Address</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">City</label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">NTN / CNIC Number</label>
          <Input value="1234567-8" disabled className="bg-muted cursor-not-allowed" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">Default Delivery Address</label>
        <textarea
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" size="default" className="rounded-full gap-2 font-semibold">
          {saved ? (
            <>
              <Check className="size-4 text-[var(--color-evergreen-600)]" />
              <span>Profile Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="size-4" />
              <Bilingual en="Save Profile Changes" ur="تبدیلیاں محفوظ کریں" layout="inline" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
