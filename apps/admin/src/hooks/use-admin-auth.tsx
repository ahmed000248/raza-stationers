"use client"

import * as React from "react"
import { User } from "@raza-stationers/types"
import { createAPIClient, createBetterAuthClient } from "@raza-stationers/api"
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

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [role, setRole] = React.useState<AdminRole | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [currentLevel, setCurrentLevel] = React.useState<string>("aal1")
  const [nextLevel, setNextLevel] = React.useState<string>("aal1")

  const api = React.useMemo(() => createAPIClient({ baseUrl: API_BASE }), [])
  const authClient = React.useMemo(() => createBetterAuthClient(API_BASE), [])

  const refreshSession = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await authClient.getSession()
      if (res?.data?.user) {
        const u = res.data.user
        const mappedUser: User = {
          id: u.id,
          name: u.name,
          mobileNumber: (u as any).mobileNumber || "",
          passwordHash: "",
          role: ((u as any).role as any) || "admin",
          isActive: true,
          createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
        }
        setUser(mappedUser)
        setRole((mappedUser.role as AdminRole) || "admin")
        if ((u as any).twoFactorEnabled) {
          setCurrentLevel("aal2")
          setNextLevel("aal2")
        } else {
          setCurrentLevel("aal1")
          setNextLevel("aal1")
        }
      } else {
        setUser(null)
        setRole(null)
      }
    } catch {
      setUser(null)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }, [authClient])

  React.useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const logout = React.useCallback(async () => {
    try {
      await authClient.signOut()
    } catch {}
    setUser(null)
    setRole(null)
  }, [authClient])

  const login = React.useCallback(
    async (identifier: string, password: string) => {
      const res = await authClient.signIn.email({
        email: identifier,
        password,
      })
      if (res.error) {
        throw new Error(res.error.message || "Admin authentication failed")
      }

      if ((res.data as any)?.twoFactorRedirect) {
        return { requiresMfa: true }
      }

      await refreshSession()
      return { requiresMfa: false }
    },
    [authClient, refreshSession]
  )

  const verifyMfa = React.useCallback(
    async (factorId: string, challengeId: string, code: string) => {
      const res = await authClient.twoFactor.verifyTotp({ code })
      if (res.error) {
        throw new Error(res.error.message || "Invalid 2FA code")
      }
      await refreshSession()
    },
    [authClient, refreshSession]
  )

  const enrollMfa = React.useCallback(async () => {
    const res = await authClient.twoFactor.enable({ password: "" })
    if (res.error) {
      throw new Error(res.error.message || "Failed to enable 2FA")
    }
    return {
      factorId: "totp",
      qrCode: (res.data as any)?.totpURI || "",
      secret: (res.data as any)?.totpURI || "",
    }
  }, [authClient])

  const confirmEnrollMfa = React.useCallback(
    async (factorId: string, code: string) => {
      const res = await authClient.twoFactor.verifyTotp({ code })
      if (res.error) {
        throw new Error(res.error.message || "Failed to confirm 2FA code")
      }
      await refreshSession()
    },
    [authClient, refreshSession]
  )

  const unenrollMfa = React.useCallback(
    async () => {
      const res = await authClient.twoFactor.disable({ password: "" })
      if (res.error) {
        throw new Error(res.error.message || "Failed to disable 2FA")
      }
      await refreshSession()
    },
    [authClient, refreshSession]
  )

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
