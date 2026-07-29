"use client"

import * as React from "react"
import { AdminRole } from "@/lib/role"
import { AdminNav } from "./AdminNav"
import { TopBar } from "./TopBar"
import { ToastContainer, ToastItem, ToastVariant } from "@raza-stationers/ui"
import { useAdminAuth } from "@/hooks/use-admin-auth"

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

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, role: adminRole, loading } = useAdminAuth()
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const addToast = React.useCallback(({ title, description, type = "info" }: AddToastInput) => {
    const id = Math.random().toString(36).substring(2, 9)
    const variant: ToastVariant = type === "error" ? "error" : type === "success" ? "success" : "info"
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const handleDismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const role: AdminRole = adminRole || (process.env.NODE_ENV !== "production" ? "owner" : "owner")
  const contextValue = React.useMemo(() => ({ role, userName: user?.name || "Staff", alertCount: 3, addToast }), [role, user, addToast])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-muted-foreground">Loading...</p></div>
  }

  return (
    <AdminShellContext.Provider value={contextValue}>
      <div className="flex min-h-screen bg-[var(--canvas)] text-[var(--ink-900)] font-sans antialiased">
        <AdminNav />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </AdminShellContext.Provider>
  )
}
