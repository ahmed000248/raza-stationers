"use client"

import * as React from "react"
import { User, ClientBusiness, BusinessUserRole } from "@raza-stationers/types"

export type AccountStatus =
  | "loading"
  | "guest"
  | "authenticated_unregistered"
  | "pending"
  | "approved"
  | "suspended"
  | "rejected"
  | "unconfigured"
  | "auth_error"

export interface UserPricingContext {
  isApprovedBusiness: boolean
  businessDiscountPercent?: number
}

interface AuthContextValue {
  accountStatus: AccountStatus
  user: User | null
  clientBusiness: ClientBusiness | null
  businessRole: BusinessUserRole | null
  pricingContext: UserPricingContext
  authError: string | null
  retryBootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<any>
  register: (data: any) => Promise<void>
  registerCustomer: (data: any) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<any>
  resendOtp: (email: string) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: (returnTo?: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  linkAccount: (...args: any[]) => Promise<void>
  getAccessToken: () => Promise<string | null>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accountStatus] = React.useState<AccountStatus>("guest")
  const [user] = React.useState<User | null>(null)
  const [clientBusiness] = React.useState<ClientBusiness | null>(null)
  const [businessRole] = React.useState<BusinessUserRole | null>(null)
  const [authError] = React.useState<string | null>(null)

  const retryBootstrap = React.useCallback(async () => {}, [])
  const login = React.useCallback(async () => {
    throw new Error("Backend rebuild in progress. Authentication is currently disabled.")
  }, [])
  const register = React.useCallback(async () => {
    throw new Error("Backend rebuild in progress. Registration is currently disabled.")
  }, [])
  const registerCustomer = React.useCallback(async () => {
    throw new Error("Backend rebuild in progress. Registration is currently disabled.")
  }, [])
  const verifyOtp = React.useCallback(async () => null, [])
  const resendOtp = React.useCallback(async () => {}, [])
  const logout = React.useCallback(async () => {}, [])
  const loginWithGoogle = React.useCallback(async () => {
    throw new Error("Backend rebuild in progress. Google sign-in is currently disabled.")
  }, [])
  const resetPassword = React.useCallback(async () => {}, [])
  const updatePassword = React.useCallback(async () => {}, [])
  const linkAccount = React.useCallback(async () => {}, [])
  const getAccessToken = React.useCallback(async () => null, [])

  const pricingContext: UserPricingContext = React.useMemo(() => ({
    isApprovedBusiness: false,
  }), [])

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
