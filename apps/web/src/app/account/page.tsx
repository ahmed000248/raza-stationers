"use client"

import * as React from "react"

import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { CreditStatusCard } from "@/components/account/CreditStatusCard"
import { BusinessProfileTab } from "@/components/account/BusinessProfileTab"
import { NotificationPreferencesTab } from "@/components/account/NotificationPreferencesTab"
import { NotificationsFeedTab } from "@/components/account/NotificationsFeedTab"
import { StaffTab } from "@/components/account/StaffTab"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, CreditCard, Bell, ShieldCheck, Lock, LogOut, Users, MessageSquare, Loader2, Check } from "lucide-react"
import { createAPIClient } from "@raza-stationers/api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || newPassword.length < 4) return
    setLoading(true)
    setMessage("")
    try {
      const api = createAPIClient({ baseUrl: API_BASE })
      await api.changePassword(currentPassword, newPassword)
      setMessage("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: any) {
      setMessage(err.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
      <h3 className="font-heading font-bold text-base border-b border-border pb-3 flex items-center gap-2">
        <Lock className="size-4 text-[var(--color-evergreen-600)]" /><span>Change Password</span>
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold">Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        {message && <p className={`text-xs font-medium ${message.includes("success") ? "text-[var(--color-evergreen-600)]" : "text-destructive"}`}>{message}</p>}
        <Button type="submit" disabled={loading} size="sm" className="rounded-full gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          <span>Update Password</span>
        </Button>
      </form>
    </div>
  )
}

function AccountPageContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "profile"

  const { accountStatus, user, clientBusiness, businessRole, logout } = useAuth()
  const validTabs = ["profile", "credit", "notifications", "preferences", "staff", "security"] as const
  type TabId = typeof validTabs[number]
  const [activeTab, setActiveTab] = React.useState<TabId>(
    validTabs.includes(initialTab as TabId) ? (initialTab as TabId) : "profile"
  )

  const isOwnerOrManager = businessRole === "owner" || businessRole === "manager"

  return (
    <div className="py-10 px-6 min-h-screen">
      <div className="mx-auto max-w-none w-full space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">
              FR-ACC-01 Wholesale Customer Portal
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)] mt-1">
              Account & Shop Settings
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Welcome back, <strong className="text-foreground">{user?.name || "Guest User"}</strong> ({clientBusiness?.businessName || "Guest Shop"})
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Badge variant={accountStatus === "approved" ? "evergreen" : "amber"} className="px-3 py-1 text-xs">
              <ShieldCheck className="size-3.5 mr-1" />
              <span>Status: {accountStatus.toUpperCase()}</span>
            </Badge>

            {accountStatus !== "guest" && (
              <Button size="sm" variant="outline" onClick={logout} className="rounded-full gap-1.5 text-xs">
                <LogOut className="size-3.5" />
                <span>Log Out</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "profile"
                ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)] bg-[var(--color-evergreen-600)]/10 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="size-4" />
            <span>Business Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("credit")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "credit"
                ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)] bg-[var(--color-evergreen-600)]/10 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard className="size-4" />
            <span>Wholesale Credit (PY-01)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "notifications"
                ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)] bg-[var(--color-evergreen-600)]/10 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="size-4" />
            <span>Notifications Feed (FR-NTF-06)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preferences")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "preferences"
                ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)] bg-[var(--color-evergreen-600)]/10 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-4" />
            <span>Notification Preferences (FR-NTF-01)</span>
          </button>

          {isOwnerOrManager && (
            <button
              type="button"
              onClick={() => setActiveTab("staff")}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "staff"
                  ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)] bg-[var(--color-evergreen-600)]/10 font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="size-4" />
              <span>Staff & Team (FR-CB-05/06)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "security"
                ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)] bg-[var(--color-evergreen-600)]/10 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="size-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "profile" && <BusinessProfileTab />}

        {activeTab === "credit" && <CreditStatusCard clientBusiness={clientBusiness} />}

        {activeTab === "notifications" && <NotificationsFeedTab />}

        {activeTab === "preferences" && <NotificationPreferencesTab />}

        {activeTab === "staff" && isOwnerOrManager && <StaffTab />}

        {activeTab === "security" && (
          <SecurityTab />
        )}
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <React.Suspense fallback={<div className="p-10 text-center text-xs text-muted-foreground">Loading account...</div>}>
      <AccountPageContent />
    </React.Suspense>
  )
}
