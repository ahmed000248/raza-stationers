"use client"

import * as React from "react"
import { User, ClientBusiness, BusinessUserRole, AUTH_PROVIDER_NOT_CONFIGURED } from "@raza-stationers/types"
import { UserPricingContext } from "@/lib/pricing"
import { createAPIClient, createBetterAuthClient } from "@raza-stationers/api"
import { getApiBaseUrl } from "@/lib/public-config"

export type AccountStatus =
  | "loading"
  | "guest"
  | "authenticated_unregistered"
  | "pending"
  | "approved"
  | "unconfigured"
  | "auth_error"

interface AuthContextValue {
  accountStatus: AccountStatus
  user: User | null
  clientBusiness: ClientBusiness | null
  businessRole: BusinessUserRole | null
  pricingContext: UserPricingContext
  authError: string | null
  retryBootstrap: () => Promise<void>
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

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { accountStatus } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    if (accountStatus === "authenticated_unregistered" && pathname !== "/onboarding" && !pathname.startsWith("/auth")) {
      router.replace("/onboarding")
    }
  }, [accountStatus, pathname, router])

  return <>{children}</>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accountStatus, setAccountStatus] = React.useState<AccountStatus>("loading")
  const [user, setUser] = React.useState<User | null>(null)
  const [clientBusiness, setClientBusiness] = React.useState<ClientBusiness | null>(null)
  const [businessRole, setBusinessRole] = React.useState<BusinessUserRole | null>(null)
  const [authError, setAuthError] = React.useState<string | null>(null)

  const api = React.useMemo(() => createAPIClient({ baseUrl: API_BASE }), [])
  const authClient = React.useMemo(() => createBetterAuthClient(API_BASE), [])

  const checkSession = React.useCallback(async () => {
    try {
      setAccountStatus("loading")
      const sessionRes = await authClient.getSession()
      if (sessionRes?.data?.user) {
        const u = sessionRes.data.user
        const mappedUser: User = {
          id: u.id,
          name: u.name,
          mobileNumber: (u as any).mobileNumber || "",
          passwordHash: "",
          role: ((u as any).role as any) || "business_user",
          isActive: true,
          createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
        }
        setUser(mappedUser)
        setAccountStatus(mappedUser.mobileNumber ? "approved" : "authenticated_unregistered")
        setAuthError(null)

        api.getMyClient().then((res: any) => {
          if (res?.clientBusiness) {
            setClientBusiness(res.clientBusiness)
            setBusinessRole(res.role || "business_owner")
          }
        }).catch(() => {})
      } else {
        setUser(null)
        setClientBusiness(null)
        setBusinessRole(null)
        setAccountStatus("guest")
      }
    } catch {
      setUser(null)
      setAccountStatus("guest")
    }
  }, [authClient, api])

  React.useEffect(() => {
    checkSession()
  }, [checkSession])

  const logout = React.useCallback(async () => {
    try {
      await authClient.signOut()
    } catch {}
    setUser(null)
    setClientBusiness(null)
    setBusinessRole(null)
    setAuthError(null)
    setAccountStatus("guest")
  }, [authClient])

  const retryBootstrap = React.useCallback(async () => {
    await checkSession()
  }, [checkSession])

  const login = React.useCallback(
    async (email: string, password: string) => {
      setAuthError(null)
      const res = await authClient.signIn.email({ email, password })
      if (res.error) {
        setAuthError(res.error.message || "Failed to sign in")
        throw new Error(res.error.message || "Failed to sign in")
      }
      await checkSession()
      return res.data
    },
    [authClient, checkSession]
  )

  const register = React.useCallback(
    async (data: {
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
      setAuthError(null)
      const res = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        role: "business_user",
        mobileNumber: data.mobileNumber,
      } as any)
      if (res.error) {
        const errObj = res.error as any
        const errMsg = (typeof errObj === "string" ? errObj : errObj?.message) || "Failed to register"
        setAuthError(errMsg)
        throw new Error(errMsg)
      }
      await checkSession()
    },
    [authClient, checkSession]
  )

  const registerCustomer = React.useCallback(
    async (data: { name: string; mobileNumber: string; password: string; email: string }) => {
      setAuthError(null)
      const res = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        role: "business_user",
        mobileNumber: data.mobileNumber,
      } as any)
      if (res.error) {
        const errObj = res.error as any
        const errMsg = (typeof errObj === "string" ? errObj : errObj?.message) || "Failed to register customer"
        setAuthError(errMsg)
        throw new Error(errMsg)
      }
      await checkSession()
    },
    [authClient, checkSession]
  )

  const verifyOtp = React.useCallback(async () => {
    return null
  }, [])

  const resendOtp = React.useCallback(async () => {}, [])

  const loginWithGoogle = React.useCallback(
    async (returnTo?: string) => {
      setAuthError(null)
      await authClient.signIn.social({
        provider: "google",
        callbackURL: typeof window !== "undefined" ? window.location.origin + (returnTo || "/catalogue") : "/catalogue",
      })
    },
    [authClient]
  )

  const resetPassword = React.useCallback(
    async (email: string) => {
      setAuthError(null)
      const res = await (authClient as any).forgetPassword({
        email,
        redirectTo: "/reset-password",
      })
      if (res.error) {
        const errObj = res.error as any
        const errMsg = (typeof errObj === "string" ? errObj : errObj?.message) || "Failed to send reset password link"
        setAuthError(errMsg)
        throw new Error(errMsg)
      }
    },
    [authClient]
  )

  const updatePassword = React.useCallback(
    async (password: string, token?: string) => {
      setAuthError(null)
      const resetToken = token || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") : null)
      if (!resetToken) {
        throw new Error("Reset token is missing or expired. Please request a new password reset link.")
      }
      const res = await (authClient as any).resetPassword({
        newPassword: password,
        token: resetToken,
      })
      if (res.error) {
        const errObj = res.error as any
        const errMsg = (typeof errObj === "string" ? errObj : errObj?.message) || "Failed to reset password. Link may be expired."
        setAuthError(errMsg)
        throw new Error(errMsg)
      }
    },
    [authClient]
  )
  const linkAccount = React.useCallback(async () => {}, [])
  const getAccessToken = React.useCallback(async () => null, [])

  const pricingContext: UserPricingContext = React.useMemo(() => {
    if (accountStatus === "approved" && clientBusiness?.accountStatus === "active") {
      return {
        isApprovedBusiness: true,
        businessDiscountPercent: clientBusiness.discountPercent || 0,
      }
    }
    return { isApprovedBusiness: false }
  }, [accountStatus, clientBusiness])

  return (
    <AuthContext.Provider
      value={{
        accountStatus,
        user,
        clientBusiness,
        businessRole,
        pricingContext,
        authError,
        retryBootstrap,
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
