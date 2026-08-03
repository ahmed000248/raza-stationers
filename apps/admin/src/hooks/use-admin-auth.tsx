"use client"

import * as React from "react"
import { User, AUTH_PROVIDER_NOT_CONFIGURED } from "@raza-stationers/types"
import { createAPIClient } from "@raza-stationers/api"
import { getApiBaseUrl } from "@/lib/public-config"

export type AdminRole = "owner" | "admin" | "packing" | "delivery"

interface AdminAuthContextValue {
  user: User | null
  role: AdminRole | null
  loading: boolean
  currentLevel: string
  nextLevel: string
  login: (identifier: string, password: string) => Promise<{ requiresMfa: boolean; factorId?: string; challengeId?: string }>
  verifyMfa: (factorId: string, challengeId: string, code: string) => Promise<void>
  enrollMfa: () => Promise<{ factorId: string; qrCode: string; secret: string }>
  confirmEnrollMfa: (factorId: string, code: string) => Promise<void>
  unenrollMfa: (factorId: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  api: ReturnType<typeof createAPIClient>
}

const AdminAuthContext = React.createContext<AdminAuthContextValue | null>(null)

const API_BASE = getApiBaseUrl()

function getClient() {
  return createAPIClient({ baseUrl: API_BASE })
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [role, setRole] = React.useState<AdminRole | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [currentLevel] = React.useState<string>("aal1")
  const [nextLevel] = React.useState<string>("aal1")

  const api = React.useMemo(() => getClient(), [])

  const logout = React.useCallback(async () => {
    setUser(null)
    setRole(null)
  }, [])

  const refreshSession = React.useCallback(async () => {
    setUser(null)
    setRole(null)
  }, [])

  const login = React.useCallback(async () => {
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const verifyMfa = React.useCallback(async () => {
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const enrollMfa = React.useCallback(async () => {
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const confirmEnrollMfa = React.useCallback(async () => {
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const unenrollMfa = React.useCallback(async () => {
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        role,
        loading,
        currentLevel,
        nextLevel,
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
