"use client"

import * as React from "react"
import { AdminRole } from "@/lib/role"
import { AdminNav } from "./AdminNav"
import { TopBar } from "./TopBar"
import { ToastContainer, ToastItem, ToastVariant } from "@raza-stationers/ui"
import { ADMIN_PREVIEW } from "@/lib/admin-preview"

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

  const contextValue = React.useMemo(() => ({
    role: ADMIN_PREVIEW.role as AdminRole,
    userName: ADMIN_PREVIEW.name,
    alertCount: 0,
    addToast,
  }), [addToast])

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
