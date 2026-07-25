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
import { Building2, CreditCard, Bell, ShieldCheck, Lock, LogOut, Users, MessageSquare } from "lucide-react"

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
      <div className="mx-auto max-w-5xl space-y-8">
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
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h3 className="font-heading font-bold text-base text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
              <Lock className="size-4 text-[var(--color-evergreen-600)]" />
              <span>Password & Security Credentials</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your account password was last changed on 15 Jan 2026. Contact wholesale support if you require a two-factor authentication reset.
            </p>
          </div>
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
