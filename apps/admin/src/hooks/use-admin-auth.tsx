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
  enrollMfa: (password: string) => Promise<{ factorId: string; qrCode: string; secret: string }>
  confirmEnrollMfa: (factorId: string, code: string) => Promise<void>
  unenrollMfa: (password: string) => Promise<void>
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

  const clearAdminState = React.useCallback(() => {
    setUser(null)
    setRole(null)
    setCurrentLevel("aal1")
  }, [])

  const api = React.useMemo(() => createAPIClient({
    baseUrl: API_BASE,
    onUnauthorized: () => {
      clearAdminState()
    },
  }), [clearAdminState])
  const authClient = React.useMemo(() => {
    const baseUrl = typeof window !== "undefined" ? `${window.location.origin}/api` : API_BASE
    return createBetterAuthClient(baseUrl)
  }, [])

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
          role: (u as any).role || null,
          isActive: true,
          createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
          twoFactorEnabled: Boolean((u as any).twoFactorEnabled),
        } as any
        const ALLOWED_ADMIN_ROLES: AdminRole[] = ["owner", "admin", "packing", "delivery"]
        const userRole = (u as any).role as AdminRole
        const isAllowedRole = ALLOWED_ADMIN_ROLES.includes(userRole)
        const isActive = (u as any).isActive !== false

        if (isAllowedRole && isActive) {
          setUser(mappedUser)
          setRole(userRole)

          const is2faEnabled = Boolean((u as any).twoFactorEnabled)
          const isSessionVerified = Boolean((res?.data?.session as any)?.twoFactorVerified || (res?.data as any)?.twoFactorVerified)

          if (is2faEnabled) {
            setNextLevel("aal2")
            setCurrentLevel(isSessionVerified ? "aal2" : "aal1")
          } else {
            setCurrentLevel("aal1")
            setNextLevel("aal1")
          }
        } else {
          // Deny access to non-staff roles (business_user) or inactive accounts
          setUser(null)
          setRole(null)
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
    setCurrentLevel("aal1")
  }, [authClient])

  const login = React.useCallback(
    async (identifier: string, password: string) => {
      try {
        const res = await authClient.signIn.email({
          email: identifier,
          password,
        })
        if (!res.error) {
          if ((res.data as any)?.twoFactorRedirect) {
            return { requiresMfa: true }
          }
          await refreshSession()
          return { requiresMfa: false }
        }
      } catch {}

      // Fallback to custom login endpoint for email/mobile accounts
      try {
        await api.login(identifier, password)
        await refreshSession()
        return { requiresMfa: false }
      } catch (err: any) {
        throw new Error(err?.message || "Admin authentication failed")
      }
    },
    [authClient, api, refreshSession]
  )

  const verifyMfa = React.useCallback(
    async (factorId: string, challengeId: string, code: string) => {
      const res = await authClient.twoFactor.verifyTotp({ code })
      if (res.error) {
        throw new Error(res.error.message || "Invalid 2FA code")
      }
      await refreshSession()
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard"
      }
    },
    [authClient, refreshSession]
  )

  const enrollMfa = React.useCallback(
    async (password: string) => {
      if (!password || !password.trim()) {
        throw new Error("Password is required to enable 2FA")
      }
      const res = await authClient.twoFactor.enable({ password })
      if (res.error) {
        throw new Error(res.error.message || "Failed to enable 2FA")
      }
      const totpURI = (res.data as any)?.totpURI || ""
      let secretKey = totpURI
      try {
        if (totpURI.startsWith("otpauth://")) {
          const url = new URL(totpURI)
          secretKey = url.searchParams.get("secret") || totpURI
        }
      } catch {}
      return {
        factorId: "totp",
        qrCode: totpURI,
        secret: secretKey,
      }
    },
    [authClient]
  )

  const confirmEnrollMfa = React.useCallback(
    async (factorId: string, code: string) => {
      const res = await authClient.twoFactor.verifyTotp({ code })
      if (res.error) {
        throw new Error(res.error.message || "Failed to confirm 2FA code")
      }
      await refreshSession()
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard"
      }
    },
    [authClient, refreshSession]
  )

  const unenrollMfa = React.useCallback(
    async (password: string) => {
      if (!password || !password.trim()) {
        throw new Error("Password is required to disable 2FA")
      }
      const res = await authClient.twoFactor.disable({ password })
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
