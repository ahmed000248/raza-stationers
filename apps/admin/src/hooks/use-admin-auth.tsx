"use client"

import * as React from "react"
import { User } from "@raza-stationers/types"

export type AdminRole = "owner" | "admin" | "packing" | "delivery"

interface AdminAuthContextValue {
  user: User | null
  role: AdminRole | null
  loading: boolean
  currentLevel: string
  nextLevel: string
  login: (identifier: string, password: string) => Promise<{ requiresMfa: boolean; factorId?: string; challengeId?: string }>
  verifyMfa: (factorId: string, challengeId: string, code: string) => Promise<void>
  enrollMfa: (password: string) => Promise<{ factorId: string; qrCode: string; secret: string }>
  confirmEnrollMfa: (factorId: string, code: string) => Promise<void>
  unenrollMfa: (password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  api: any
}

const AdminAuthContext = React.createContext<AdminAuthContextValue | null>(null)

const MOCK_ADMIN_USER: User = {
  id: "admin-preview-user",
  name: "Stationery Admin (Preview)",
  mobileNumber: "03000000000",
  passwordHash: "",
  role: "owner" as any,
  isActive: true,
  createdAt: new Date().toISOString(),
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = React.useState<User | null>(MOCK_ADMIN_USER)
  const [role] = React.useState<AdminRole | null>("owner")
  const [loading] = React.useState(false)

  const refreshSession = React.useCallback(async () => {}, [])
  const logout = React.useCallback(async () => {}, [])

  const login = React.useCallback(async () => {
    return { requiresMfa: false }
  }, [])

  const verifyMfa = React.useCallback(async () => {}, [])
  const enrollMfa = React.useCallback(async () => ({ factorId: "none", qrCode: "", secret: "" }), [])
  const confirmEnrollMfa = React.useCallback(async () => {}, [])
  const unenrollMfa = React.useCallback(async () => {}, [])

  const api = React.useMemo(() => ({
    get: async () => [],
    post: async () => ({}),
    put: async () => ({}),
    delete: async () => ({}),
  }), [])

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        role,
        loading,
        currentLevel: "aal1",
        nextLevel: "aal1",
        login,
        verifyMfa,
        enrollMfa,
        confirmEnrollMfa,
        unenrollMfa,
        logout,
        refreshSession,
        api,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = React.useContext(AdminAuthContext)
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider")
  return context
}
