"use client"

import * as React from "react"
import { User } from "@raza-stationers/types"
import { createAPIClient } from "@raza-stationers/api"
import { createClient } from "@/lib/supabase/client"

export type AdminRole = "owner" | "admin" | "packing" | "delivery"

interface AdminAuthContextValue {
  user: User | null
  role: AdminRole | null
  loading: boolean
  currentLevel: string
  nextLevel: string
  login: (email: string, password: string) => Promise<{ requiresMfa: boolean; factorId?: string; challengeId?: string }>
  verifyMfa: (factorId: string, challengeId: string, code: string) => Promise<void>
  enrollMfa: () => Promise<{ factorId: string; qrCode: string; secret: string }>
  confirmEnrollMfa: (factorId: string, code: string) => Promise<void>
  unenrollMfa: (factorId: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  api: ReturnType<typeof createAPIClient>
}

const AdminAuthContext = React.createContext<AdminAuthContextValue | null>(null)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

function getClient() {
  return createAPIClient({ baseUrl: API_BASE })
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [role, setRole] = React.useState<AdminRole | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [currentLevel, setCurrentLevel] = React.useState<string>("aal1")
  const [nextLevel, setNextLevel] = React.useState<string>("aal1")

  const supabase = React.useMemo(() => createClient(), [])
  const api = React.useMemo(() => getClient(), [])

  const logout = React.useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    setCurrentLevel("aal1")
    setNextLevel("aal1")
  }, [supabase])

  const fetchProfile = React.useCallback(async (token: string) => {
    api.setAuthToken(token)
    try {
      const profile: any = await api.getProfile()
      const staffRole: AdminRole = (profile.staffProfile?.staffRole || profile.role) as AdminRole
      if (!["owner", "admin", "packing", "delivery"].includes(staffRole)) {
        await supabase.auth.signOut()
        throw new Error("This account is not authorized for the Admin application")
      }
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
      
      const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (mfaData) {
        setCurrentLevel(mfaData.currentLevel || "aal1")
        setNextLevel(mfaData.nextLevel || "aal1")
      }
      return true
    } catch (err) {
      console.warn("Failed to load admin profile", err)
      setUser(null)
      setRole(null)
      return false
    }
  }, [api, supabase])

  const refreshSession = React.useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await fetchProfile(session.access_token)
    }
  }, [supabase, fetchProfile])

  React.useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (session) {
        fetchProfile(session.access_token).finally(() => {
          if (active) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return
      if (session) {
        await fetchProfile(session.access_token)
      } else {
        setUser(null)
        setRole(null)
        setCurrentLevel("aal1")
        setNextLevel("aal1")
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const login = React.useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    if (!data.session) throw new Error("No session created")

    const token = data.session.access_token
    api.setAuthToken(token)

    const profile: any = await api.getProfile()
    const trustedRole = profile.staffProfile?.staffRole || profile.role
    if (!["owner", "admin", "packing", "delivery"].includes(trustedRole)) {
      await supabase.auth.signOut()
      throw new Error("This account is not authorized for the Admin application")
    }

    // Check MFA level
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (mfaData && mfaData.nextLevel === "aal2" && mfaData.currentLevel === "aal1") {
      // User is enrolled but needs AAL2 verification
      const factors = await supabase.auth.mfa.listFactors()
      const totpFactor = factors.data?.totp?.[0]
      if (totpFactor) {
        const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id })
        if (challenge.error) throw new Error(challenge.error.message)
        setCurrentLevel("aal1")
        setNextLevel("aal2")
        return {
          requiresMfa: true,
          factorId: totpFactor.id,
          challengeId: challenge.data.id,
        }
      }
    }

    const authorized = await fetchProfile(token)
    if (!authorized) throw new Error("This account is not authorized for the Admin application")
    return { requiresMfa: false }
  }, [supabase, api, fetchProfile])

  const verifyMfa = React.useCallback(async (factorId: string, challengeId: string, code: string) => {
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    })
    if (error) throw new Error(error.message)

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await fetchProfile(session.access_token)
    }
  }, [supabase, fetchProfile])

  const enrollMfa = React.useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "Raza Stationers Admin",
    })
    if (error) throw new Error(error.message)
    if (!data || !data.totp) throw new Error("Failed to enroll factor")

    return {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    }
  }, [supabase])

  const confirmEnrollMfa = React.useCallback(async (factorId: string, code: string) => {
    // Challenge the newly enrolled factor
    const challenge = await supabase.auth.mfa.challenge({ factorId })
    if (challenge.error) throw new Error(challenge.error.message)

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    })
    if (verify.error) throw new Error(verify.error.message)

    // Reload session/profile to update level
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await fetchProfile(session.access_token)
    }
  }, [supabase, fetchProfile])

  const unenrollMfa = React.useCallback(async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId })
    if (error) throw new Error(error.message)

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await fetchProfile(session.access_token)
    }
  }, [supabase, fetchProfile])

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
