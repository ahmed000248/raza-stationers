"use client"

import * as React from "react"
import { User, ClientBusiness, BusinessUserRole, AUTH_PROVIDER_NOT_CONFIGURED } from "@raza-stationers/types"
import { UserPricingContext } from "@/lib/pricing"
import { createAPIClient } from "@raza-stationers/api"
import { BrandedLoader } from "@/components/site/BrandedLoader"
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

function getClient() {
  return createAPIClient({ baseUrl: API_BASE })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accountStatus, setAccountStatus] = React.useState<AccountStatus>("unconfigured")
  const [user, setUser] = React.useState<User | null>(null)
  const [clientBusiness, setClientBusiness] = React.useState<ClientBusiness | null>(null)
  const [businessRole, setBusinessRole] = React.useState<BusinessUserRole | null>(null)
  const [authError, setAuthError] = React.useState<string | null>(null)

  const api = React.useMemo(() => getClient(), [])

  const logout = React.useCallback(async () => {
    setUser(null)
    setClientBusiness(null)
    setBusinessRole(null)
    setAuthError(null)
    setAccountStatus("unconfigured")
  }, [])

  const retryBootstrap = React.useCallback(async () => {
    setAccountStatus("unconfigured")
    setAuthError(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const login = React.useCallback(async () => {
    setAuthError(AUTH_PROVIDER_NOT_CONFIGURED)
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const register = React.useCallback(async () => {
    setAuthError(AUTH_PROVIDER_NOT_CONFIGURED)
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const registerCustomer = React.useCallback(async () => {
    setAuthError(AUTH_PROVIDER_NOT_CONFIGURED)
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const verifyOtp = React.useCallback(async () => {
    setAuthError(AUTH_PROVIDER_NOT_CONFIGURED)
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const resendOtp = React.useCallback(async () => {
    setAuthError(AUTH_PROVIDER_NOT_CONFIGURED)
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const loginWithGoogle = React.useCallback(async () => {
    setAuthError(AUTH_PROVIDER_NOT_CONFIGURED)
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const resetPassword = React.useCallback(async () => {
    setAuthError(AUTH_PROVIDER_NOT_CONFIGURED)
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const getAccessToken = React.useCallback(async () => {
    return null
  }, [])

  const updatePassword = React.useCallback(async () => {
    setAuthError(AUTH_PROVIDER_NOT_CONFIGURED)
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

  const linkAccount = React.useCallback(async () => {
    setAuthError(AUTH_PROVIDER_NOT_CONFIGURED)
    throw new Error(AUTH_PROVIDER_NOT_CONFIGURED)
  }, [])

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
