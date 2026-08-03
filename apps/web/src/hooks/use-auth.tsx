"use client"
/* eslint-disable react-hooks/refs */

import * as React from "react"
import { User, ClientBusiness, BusinessUserRole } from "@raza-stationers/types"
import { UserPricingContext } from "@/lib/pricing"
import { createAPIClient } from "@raza-stationers/api"
import { createClient } from "@/lib/supabase/client"
import { BrandedLoader } from "@/components/site/BrandedLoader"
import { getApiBaseUrl } from "@/lib/public-config"

export type AccountStatus = "guest" | "pending" | "approved" | "unregistered"

interface AuthContextValue {
  accountStatus: AccountStatus
  user: User | null
  clientBusiness: ClientBusiness | null
  businessRole: BusinessUserRole | null
  pricingContext: UserPricingContext
  login: (email: string, password: string) => Promise<any>
  register: (data: {
    name: string
    mobileNumber: string
    password: string
    email: string
    businessName: string
    businessType: string
    contactPerson: string
    address: string
    city: string
  }) => Promise<void>
  registerCustomer: (data: {
    name: string
    mobileNumber: string
    password: string
    email: string
  }) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<any>
  resendOtp: (email: string) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: (returnTo?: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  linkAccount: (supabaseToken: string, mobileNumber: string, password: string) => Promise<void>
  getAccessToken: () => Promise<string | null>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const API_BASE = getApiBaseUrl()

function getClient(onUnauthorized?: () => void) {
  return createAPIClient({ baseUrl: API_BASE, onUnauthorized })
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
      const res: any = await api.getBootstrapStatus()
      if (res.authenticated && res.registered && res.profile) {
        const profile = res.profile
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
      } else if (res.authenticated && !res.registered) {
        setUser(null)
        setClientBusiness(null)
        setBusinessRole(null)
        setAccountStatus("unregistered")
      } else {
        setUser(null)
        setAccountStatus("unregistered")
      }
    } catch (err) {
      console.warn("Failed to load profile for token", err)
      setUser(null)
      setAccountStatus("unregistered")
    }
  }, [api])

  // Setup Supabase and legacy session loading
  React.useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (session) {
        fetchProfile(session.access_token).finally(() => {
          if (active) setIsLoaded(true)
        })
      } else {
        setIsLoaded(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return
      if (session) {
        await fetchProfile(session.access_token)
      } else {
        setUser(null)
        setClientBusiness(null)
        setBusinessRole(null)
        setAccountStatus("guest")
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  React.useEffect(() => {
    if (isLoaded && accountStatus === "unregistered") {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/onboarding") && !window.location.pathname.startsWith("/auth")) {
        window.location.href = `/onboarding?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`
      }
    }
  }, [isLoaded, accountStatus])

  const login = React.useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new Error(error.message)
    if (data.session) {
      await fetchProfile(data.session.access_token)
    }
  }, [supabase, fetchProfile])

  const register = React.useCallback(async (data: {
    name: string
    mobileNumber: string
    password: string
    email: string
    businessName: string
    businessType: string
    contactPerson: string
    address: string
    city: string
  }) => {
    const currentSession = (await supabase.auth.getSession()).data.session
    let token = currentSession?.user.email?.toLowerCase() === data.email.toLowerCase() ? currentSession.access_token : null
    if (!token) {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name, phone: data.mobileNumber } },
      })
      if (error) throw new Error(error.message)
      token = signUpData.session?.access_token || null
    }

    if (!token) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (!signInError && signInData.session) {
        token = signInData.session.access_token
      }
    }

    if (!token) {
      throw new Error("Account created successfully, but automatic sign-in failed. Please sign in with your email and password.")
    }

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
  }, [supabase, fetchProfile, api])

  const registerCustomer = React.useCallback(async (data: {
    name: string
    mobileNumber: string
    password: string
    email: string
  }) => {
    const currentSession = (await supabase.auth.getSession()).data.session
    let token = currentSession?.user.email?.toLowerCase() === data.email.toLowerCase() ? currentSession.access_token : null
    if (!token) {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name, phone: data.mobileNumber } },
      })
      if (error) throw new Error(error.message)
      token = signUpData.session?.access_token || null
    }

    if (!token) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (!signInError && signInData.session) {
        token = signInData.session.access_token
      }
    }

    if (!token) {
      throw new Error("Account created successfully, but automatic sign-in failed. Please sign in with your email and password.")
    }

    api.setAuthToken(token)

    // Register user on NestJS side
    await api.post("/auth/register-supabase", {
      name: data.name,
      mobileNumber: data.mobileNumber,
    })

    await fetchProfile(token)
  }, [supabase, fetchProfile, api])

  const verifyOtp = React.useCallback(async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })
    if (error) throw new Error(error.message)
    return data.session
  }, [supabase])

  const resendOtp = React.useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    })
    if (error) throw new Error(error.message)
  }, [supabase])

  const loginWithGoogle = React.useCallback(async (returnTo = "/catalogue") => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      throw new Error("Google authentication requires a configured Supabase project (NEXT_PUBLIC_SUPABASE_URL).")
    }
    const safeTarget = returnTo?.startsWith("/") && !returnTo.startsWith("//") && !returnTo.startsWith("/signin") && !returnTo.startsWith("/signup") && !returnTo.startsWith("/register") && !returnTo.startsWith("/auth") ? returnTo : "/catalogue"
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeTarget)}`,
      },
    })
    if (error) throw new Error(error.message)
  }, [supabase])

  const resetPassword = React.useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw new Error(error.message)
  }, [supabase])

  const getAccessToken = React.useCallback(async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error || !data.session) return null
    if (data.session.expires_at && data.session.expires_at <= Math.floor(Date.now() / 1000) + 30) {
      const refreshed = await supabase.auth.refreshSession()
      return refreshed.data.session?.access_token || null
    }
    return data.session.access_token
  }, [supabase])

  const updatePassword = React.useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(error.message)
  }, [supabase])

  const linkAccount = React.useCallback(async (supabaseToken: string, mobileNumber: string, password: string) => {
    const legacyApi = getClient()
    const res: any = await legacyApi.login(mobileNumber, password)
    legacyApi.setAuthToken(res.accessToken)
    await legacyApi.post("/auth/link", { supabaseToken })
    await fetchProfile(supabaseToken)
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
    return <BrandedLoader fullScreen label="Restoring your secure session…" />
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
        registerCustomer,
        verifyOtp,
        resendOtp,
        logout,
        loginWithGoogle,
        resetPassword,
        updatePassword,
        linkAccount,
        getAccessToken,
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
