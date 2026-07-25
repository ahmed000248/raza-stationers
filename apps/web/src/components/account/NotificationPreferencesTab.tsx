"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Bell, Smartphone, Mail, MessageSquare, Check } from "lucide-react"

export function NotificationPreferencesTab() {
  const [smsOrderUpdates, setSmsOrderUpdates] = React.useState(true)
  const [whatsappReceipts, setWhatsappReceipts] = React.useState(true)
  const [emailInvoices, setEmailInvoices] = React.useState(true)
  const [restockAlerts, setRestockAlerts] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSave} className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
      <div className="border-b border-border pb-4">
        <h3 className="font-heading font-bold text-base text-[var(--color-ink-900)] flex items-center gap-2">
          <Bell className="size-4 text-[var(--color-evergreen-600)]" />
          <span>Notification Channel Preferences (FR-NTF-06)</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure per-channel alerts for dispatch updates, invoices, and restock notifications.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
          <div className="flex items-center gap-3">
            <Smartphone className="size-5 text-[var(--color-evergreen-600)] shrink-0" />
            <div>
              <span className="font-semibold text-sm text-foreground block">SMS Dispatch Alerts</span>
              <span className="text-xs text-muted-foreground">Receive instant SMS when your rider is dispatched</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={smsOrderUpdates}
            onChange={(e) => setSmsOrderUpdates(e.target.checked)}
            className="size-5 rounded accent-[var(--color-evergreen-600)] cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
          <div className="flex items-center gap-3">
            <MessageSquare className="size-5 text-[var(--color-evergreen-600)] shrink-0" />
            <div>
              <span className="font-semibold text-sm text-foreground block">WhatsApp Order Summaries & Receipts</span>
              <span className="text-xs text-muted-foreground">Receive PDF invoices directly on WhatsApp (+92 300 1234567)</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={whatsappReceipts}
            onChange={(e) => setWhatsappReceipts(e.target.checked)}
            className="size-5 rounded accent-[var(--color-evergreen-600)] cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-[var(--color-evergreen-600)] shrink-0" />
            <div>
              <span className="font-semibold text-sm text-foreground block">Email Tax Invoices (OF-03)</span>
              <span className="text-xs text-muted-foreground">Receive printable tax invoice PDFs by email upon delivery</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={emailInvoices}
            onChange={(e) => setEmailInvoices(e.target.checked)}
            className="size-5 rounded accent-[var(--color-evergreen-600)] cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
          <div className="flex items-center gap-3">
            <Bell className="size-5 text-[var(--color-evergreen-600)] shrink-0" />
            <div>
              <span className="font-semibold text-sm text-foreground block">Out-of-Stock Item Restock Notifications</span>
              <span className="text-xs text-muted-foreground">Alert me when opt-in stock items are replenished</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={restockAlerts}
            onChange={(e) => setRestockAlerts(e.target.checked)}
            className="size-5 rounded accent-[var(--color-evergreen-600)] cursor-pointer"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" size="default" className="rounded-full gap-2 font-semibold">
          {saved ? (
            <>
              <Check className="size-4 text-[var(--color-evergreen-600)]" />
              <span>Notification Preferences Saved!</span>
            </>
          ) : (
            <span>Save Preferences (FR-NTF-06)</span>
          )}
        </Button>
      </div>
    </form>
  )
}
