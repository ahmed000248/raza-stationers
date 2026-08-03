"use client"

import * as React from "react"
import { AdminRole } from "@/lib/role"
import { AdminNav } from "./AdminNav"
import { TopBar } from "./TopBar"
import { ToastContainer, ToastItem, ToastVariant } from "@raza-stationers/ui"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { TotpEnrollView } from "./TotpEnrollView"
import { TotpChallengeView } from "./TotpChallengeView"
import { BrandedLoader } from "./BrandedLoader"
import { usePathname, useRouter } from "next/navigation"
import { AUTH_PROVIDER_NOT_CONFIGURED } from "@raza-stationers/types"

interface AddToastInput {
  title: string
  description?: string
  type?: "success" | "warning" | "error" | "info"
}

interface AdminShellContextValue {
  role: AdminRole
  userName: string
  alertCount: number
  addToast: (input: AddToastInput) => void
}

const AdminShellContext = React.createContext<AdminShellContextValue | null>(null)

export function useAdminShell() {
  const context = React.useContext(AdminShellContext)
  if (!context) {
    throw new Error("useAdminShell must be used within an AdminShell component")
  }
  return context
}

// Roles that require AAL2 before dashboard access
const MFA_REQUIRED_ROLES: AdminRole[] = ["admin", "owner"]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, role: adminRole, loading, currentLevel, nextLevel, enrollMfa, confirmEnrollMfa, verifyMfa, refreshSession } = useAdminAuth()
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const pathname = usePathname()
  const router = useRouter()

  // MFA challenge state (for already-enrolled users who need AAL2 step-up)
  const [pendingFactorId, setPendingFactorId] = React.useState<string | null>(null)
  const [pendingChallengeId, setPendingChallengeId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (loading) return
    if (!user && pathname !== "/login") router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    if (user && pathname === "/login") router.replace("/dashboard")
  }, [loading, pathname, router, user])

  const addToast = React.useCallback(({ title, description, type = "info" }: AddToastInput) => {
    const id = Math.random().toString(36).substring(2, 9)
    const variant: ToastVariant = type === "error" ? "error" : type === "success" ? "success" : "info"
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const handleDismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const role = adminRole as AdminRole
  const contextValue = React.useMemo(() => ({ role, userName: user?.name || "Staff", alertCount: 3, addToast }), [role, user, addToast])

  const issueFreshChallenge = React.useCallback(async () => {
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const needsMfaStepUp = false
  const needsMfaEnrollment = false

  React.useEffect(() => {
    if (needsMfaStepUp && !pendingFactorId) {
      issueFreshChallenge().catch(console.error)
    }
  }, [needsMfaStepUp, pendingFactorId, issueFreshChallenge])

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return <BrandedLoader />
  }

  if (!user) {
    if (pathname === "/login") return <>{children}</>
    return <BrandedLoader label="Redirecting to secure sign in…" />
  }

  if (!adminRole) {
    return <BrandedLoader label="Verifying portal permissions..." />
  }

  if (pathname === "/login") {
    return <BrandedLoader label="Opening the operations portal…" />
  }

  // ── MFA Enrollment Gate ───────────────────────────────────────────────────────
  // Admin/owner with no TOTP factor enrolled yet
  if (needsMfaEnrollment) {
    return (
      <>
        <TotpEnrollView onEnroll={enrollMfa} onConfirm={confirmEnrollMfa} />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </>
    )
  }

  // ── MFA Challenge Gate ────────────────────────────────────────────────────────
  // Admin/owner enrolled but session is only AAL1 — needs step-up
  if (needsMfaStepUp) {
    if (!pendingFactorId || !pendingChallengeId) {
      return <BrandedLoader label="Preparing two-factor verification…" />
    }
    return (
      <>
        <TotpChallengeView
          factorId={pendingFactorId}
          challengeId={pendingChallengeId}
          onVerify={async (fId, cId, code) => {
            await verifyMfa(fId, cId, code)
            await refreshSession()
          }}
          onNewChallenge={issueFreshChallenge}
        />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </>
    )
  }

  // ── Normal Dashboard ──────────────────────────────────────────────────────────
  return (
    <AdminShellContext.Provider value={contextValue}>
      <div className="flex min-h-screen bg-[var(--canvas)] text-[var(--ink-900)] font-sans antialiased">
        <AdminNav />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </AdminShellContext.Provider>
  )
}
