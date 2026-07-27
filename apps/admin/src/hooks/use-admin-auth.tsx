"use client"

import * as React from "react"
import { User, UserRole } from "@raza-stationers/types"
import { createAPIClient } from "@raza-stationers/api"

export type AdminRole = "owner" | "admin" | "packing" | "delivery"

interface AdminAuthContextValue {
  user: User | null
  role: AdminRole | null
  loading: boolean
  login: (mobileNumber: string, password: string) => Promise<void>
  logout: () => void
}

const AdminAuthContext = React.createContext<AdminAuthContextValue | null>(null)

const TOKEN_KEY = "raza_stationers_admin_jwt_v1"
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

function getClient() {
  if (typeof window === "undefined") return createAPIClient({ baseUrl: API_BASE })
  const token = localStorage.getItem(TOKEN_KEY)
  return createAPIClient({ baseUrl: API_BASE, authToken: token || undefined })
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [role, setRole] = React.useState<AdminRole | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    const api = getClient()
    api.setAuthToken(token)
    api.getProfile()
      .then((profile: any) => {
        const staffRole: AdminRole = (profile.staffProfile?.staffRole || profile.role) as AdminRole
        setUser({
          id: profile.id,
          name: profile.name,
          mobileNumber: profile.mobileNumber,
          passwordHash: "",
          role: profile.role,
          isActive: true,
          createdAt: profile.createdAt,
        })
        setRole(staffRole)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = React.useCallback(async (mobileNumber: string, password: string) => {
    const api = getClient()
    const res: any = await api.login(mobileNumber, password)
    localStorage.setItem(TOKEN_KEY, res.accessToken)
    api.setAuthToken(res.accessToken)

    const profile: any = await api.getProfile()
    const staffRole: AdminRole = (profile.staffProfile?.staffRole || profile.role) as AdminRole
    setUser({
      id: res.user.id,
      name: res.user.name,
      mobileNumber: res.user.mobileNumber,
      passwordHash: "",
      role: res.user.role,
      isActive: true,
      createdAt: res.user.createdAt || "",
    })
    setRole(staffRole)
  }, [])

  const logout = React.useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setRole(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = React.useContext(AdminAuthContext)
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider")
  return context
}
