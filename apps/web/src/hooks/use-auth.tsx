"use client"
/* eslint-disable react-hooks/refs */

import * as React from "react"
import { User, ClientBusiness, BusinessUserRole } from "@raza-stationers/types"
import { UserPricingContext } from "@/lib/pricing"
import { createAPIClient } from "@raza-stationers/api"
import { createClient } from "@/lib/supabase/client"

export type AccountStatus = "guest" | "pending" | "approved"

interface AuthContextValue {
  accountStatus: AccountStatus
  user: User | null
  clientBusiness: ClientBusiness | null
  businessRole: BusinessUserRole | null
  pricingContext: UserPricingContext
  login: (emailOrMobile: string, password: string) => Promise<any>
  register: (data: {
    name: string
    mobileNumber: string
    password: string
    email?: string
    businessName: string
    businessType: string
    contactPerson: string
    address: string
    city: string
  }) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  sendPhoneOtp: (phone: string) => Promise<void>
  verifyPhoneOtp: (phone: string, token: string, name?: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  linkAccount: (supabaseToken: string) => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const TOKEN_KEY = "raza_stationers_jwt_v1"
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

function getClient(onUnauthorized?: () => void) {
  if (typeof window === "undefined") return createAPIClient({ baseUrl: API_BASE })
  const token = localStorage.getItem(TOKEN_KEY)
  return createAPIClient({ baseUrl: API_BASE, authToken: token || undefined, onUnauthorized })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accountStatus, setAccountStatus] = React.useState<AccountStatus>("guest")
  const [user, setUser] = React.useState<User | null>(null)
  const [clientBusiness, setClientBusiness] = React.useState<ClientBusiness | null>(null)
  const [businessRole, setBusinessRole] = React.useState<BusinessUserRole | null>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)

  const supabase = React.useMemo(() => createClient(), [])

  const logout = React.useCallback(async () => {
    await supabase.auth.signOut()
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setClientBusiness(null)
    setBusinessRole(null)
    setAccountStatus("guest")
  }, [supabase])

  const onUnauthorizedRef = React.useRef<(() => void) | null>(null)

  React.useEffect(() => {
    onUnauthorizedRef.current = () => {
      logout()
      if (typeof window !== "undefined") {
        window.location.href = `/signin?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`
      }
    }
  }, [logout])

  const api = React.useMemo(() => {
    return getClient(() => {
      if (onUnauthorizedRef.current) onUnauthorizedRef.current()
    })
  }, [])

  const fetchProfile = React.useCallback(async (token: string) => {
    api.setAuthToken(token)
    try {
      const profile: any = await api.getProfile()
      const u: User = {
        id: profile.id,
        name: profile.name,
        mobileNumber: profile.mobileNumber,
        passwordHash: "",
        role: profile.role,
        isActive: true,
        createdAt: profile.createdAt,
      }
      setUser(u)

      if (profile.businessUserLinks?.length > 0) {
        const link = profile.businessUserLinks[0]
        const biz = link.clientBusiness
        setBusinessRole(link.role)
        setClientBusiness({
          id: biz.id,
          businessName: biz.businessName,
          ownerName: biz.contactPerson,
          contactPerson: biz.contactPerson,
          phone: biz.mobileNumber,
          email: biz.email || "",
          address: biz.address,
          city: biz.city,
          businessType: biz.businessType,
          discountPercent: 0,
          creditLimit: 0,
          outstandingBalance: 0,
          creditStatus: "active",
          accountStatus: biz.accountStatus,
          createdAt: biz.createdAt,
        })
        setAccountStatus(biz.accountStatus === "active" ? "approved" : "pending")
      } else {
        setAccountStatus("approved")
      }
    } catch (err) {
      // Token exists but API call fails (e.g., user not registered/linked in app DB)
      console.warn("Failed to load profile for token", err)
      setUser(null)
    }
  }, [api])

  // Setup Supabase and legacy session loading
  React.useEffect(() => {
    let active = true

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (session) {
        localStorage.setItem(TOKEN_KEY, session.access_token)
        fetchProfile(session.access_token).finally(() => {
          if (active) setIsLoaded(true)
        })
      } else {
        const legacyToken = localStorage.getItem(TOKEN_KEY)
        if (legacyToken) {
          fetchProfile(legacyToken).finally(() => {
            if (active) setIsLoaded(true)
          })
        } else {
          setIsLoaded(true)
        }
      }
    })

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return
      if (session) {
        localStorage.setItem(TOKEN_KEY, session.access_token)
        await fetchProfile(session.access_token)
      } else {
        // Only clear if no legacy session exists
        const legacyToken = localStorage.getItem(TOKEN_KEY)
        if (!legacyToken) {
          setUser(null)
          setClientBusiness(null)
          setBusinessRole(null)
          setAccountStatus("guest")
        }
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const login = React.useCallback(async (emailOrMobile: string, password: string) => {
    const isEmail = emailOrMobile.includes("@")
    if (isEmail) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrMobile,
        password,
      })
      if (error) throw new Error(error.message)
      if (data.session) {
        localStorage.setItem(TOKEN_KEY, data.session.access_token)
        await fetchProfile(data.session.access_token)
      }
    } else {
      // Legacy mobile/password login
      const api = getClient()
      const res: any = await api.login(emailOrMobile, password)
      if (res.requiresTotp) {
        return res
      }
      localStorage.setItem(TOKEN_KEY, res.accessToken)
      api.setAuthToken(res.accessToken)
      await fetchProfile(res.accessToken)
    }
  }, [supabase, fetchProfile])

  const register = React.useCallback(async (data: {
    name: string
    mobileNumber: string
    password: string
    email?: string
    businessName: string
    businessType: string
    contactPerson: string
    address: string
    city: string
  }) => {
    if (data.email) {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.mobileNumber,
          }
        }
      })
      if (error) throw new Error(error.message)
      if (!signUpData.session) {
        throw new Error("Registration submitted. Please verify your email first.")
      }

      const token = signUpData.session.access_token
      localStorage.setItem(TOKEN_KEY, token)

      const api = getClient()
      api.setAuthToken(token)

      // Register user on NestJS side
      await api.post("/auth/register-supabase", {
        name: data.name,
        mobileNumber: data.mobileNumber,
      })

      // Register client business details
      await api.registerClient({
        businessName: data.businessName,
        businessType: data.businessType,
        contactPerson: data.contactPerson,
        mobileNumber: data.mobileNumber,
        address: data.address,
        city: data.city,
      })

      await fetchProfile(token)
    } else {
      // Legacy flow
      const api = getClient()
      const regRes: any = await api.register({
        name: data.name,
        mobileNumber: data.mobileNumber,
        password: data.password,
      })
      localStorage.setItem(TOKEN_KEY, regRes.accessToken)
      api.setAuthToken(regRes.accessToken)

      await api.registerClient({
        businessName: data.businessName,
        businessType: data.businessType,
        contactPerson: data.contactPerson,
        mobileNumber: data.mobileNumber,
        address: data.address,
        city: data.city,
      })

      await fetchProfile(regRes.accessToken)
    }
  }, [supabase, fetchProfile])

  const loginWithGoogle = React.useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw new Error(error.message)
  }, [supabase])

  const sendPhoneOtp = React.useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    })
    if (error) throw new Error(error.message)
  }, [supabase])

  const verifyPhoneOtp = React.useCallback(async (phone: string, token: string, name?: string) => {
    const { data: { session }, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    })
    if (error) throw new Error(error.message)
    if (!session) throw new Error("No session returned")

    localStorage.setItem(TOKEN_KEY, session.access_token)
    const api = getClient()
    api.setAuthToken(session.access_token)

    try {
      await api.getProfile()
    } catch {
      // Bootstrapping new phone OTP user in application DB
      await api.post("/auth/register-supabase", {
        name: name || "OTP User",
        mobileNumber: phone,
      })
    }

    await fetchProfile(session.access_token)
  }, [supabase, fetchProfile])

  const resetPassword = React.useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw new Error(error.message)
  }, [supabase])

  const updatePassword = React.useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(error.message)
  }, [supabase])

  const linkAccount = React.useCallback(async (supabaseToken: string) => {
    const api = getClient()
    await api.post("/auth/link", { supabaseToken })
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) await fetchProfile(token)
  }, [fetchProfile])

  const pricingContext: UserPricingContext = React.useMemo(() => {
    if (accountStatus === "approved" && clientBusiness?.accountStatus === "active") {
      return {
        isApprovedBusiness: true,
        businessDiscountPercent: clientBusiness.discountPercent || 0,
      }
    }
    return { isApprovedBusiness: false }
  }, [accountStatus, clientBusiness])

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-muted-foreground">Loading...</p></div>
  }

  return (
    <AuthContext.Provider
      value={{
        accountStatus,
        user,
        clientBusiness,
        businessRole,
        pricingContext,
        login,
        register,
        logout,
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        resetPassword,
        updatePassword,
        linkAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
