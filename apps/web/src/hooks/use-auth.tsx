"use client"

import * as React from "react"
import { User, ClientBusiness, BusinessUserRole } from "@raza-stationers/types"
import { UserPricingContext } from "@/lib/pricing"
import { createAPIClient } from "@raza-stationers/api"

export type AccountStatus = "guest" | "pending" | "approved"

interface AuthContextValue {
  accountStatus: AccountStatus
  user: User | null
  clientBusiness: ClientBusiness | null
  businessRole: BusinessUserRole | null
  pricingContext: UserPricingContext
  login: (mobileNumber: string, password: string) => Promise<void>
  register: (data: {
    name: string
    mobileNumber: string
    password: string
    businessName: string
    businessType: string
    contactPerson: string
    address: string
    city: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const TOKEN_KEY = "raza_stationers_jwt_v1"
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

function getClient() {
  if (typeof window === "undefined") return createAPIClient({ baseUrl: API_BASE })
  const token = localStorage.getItem(TOKEN_KEY)
  return createAPIClient({ baseUrl: API_BASE, authToken: token || undefined })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accountStatus, setAccountStatus] = React.useState<AccountStatus>("guest")
  const [user, setUser] = React.useState<User | null>(null)
  const [clientBusiness, setClientBusiness] = React.useState<ClientBusiness | null>(null)
  const [businessRole, setBusinessRole] = React.useState<BusinessUserRole | null>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)

  const api = getClient()

  React.useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsLoaded(true)
      return
    }

    api.setAuthToken(token)
    api.getProfile()
      .then((profile: any) => {
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
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => setIsLoaded(true))
  }, [])

  const login = React.useCallback(async (mobileNumber: string, password: string) => {
    const api = getClient()
    const res: any = await api.login(mobileNumber, password)
    localStorage.setItem(TOKEN_KEY, res.accessToken)
    api.setAuthToken(res.accessToken)

    const u: User = {
      id: res.user.id,
      name: res.user.name,
      mobileNumber: res.user.mobileNumber,
      passwordHash: "",
      role: res.user.role,
      isActive: true,
      createdAt: "",
    }
    setUser(u)

    try {
      const profile: any = await api.getProfile()
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
    } catch {
      setAccountStatus("approved")
    }
  }, [])

  const register = React.useCallback(async (data: {
    name: string
    mobileNumber: string
    password: string
    businessName: string
    businessType: string
    contactPerson: string
    address: string
    city: string
  }) => {
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

    const u: User = {
      id: regRes.user.id,
      name: regRes.user.name,
      mobileNumber: regRes.user.mobileNumber,
      passwordHash: "",
      role: regRes.user.role,
      isActive: true,
      createdAt: "",
    }
    setUser(u)
    setAccountStatus("pending")
    setClientBusiness({
      id: "",
      businessName: data.businessName,
      ownerName: data.contactPerson,
      contactPerson: data.contactPerson,
      phone: data.mobileNumber,
      address: data.address,
      city: data.city,
      businessType: data.businessType as any,
      discountPercent: 0,
      creditLimit: 0,
      outstandingBalance: 0,
      creditStatus: "active",
      accountStatus: "pending",
      createdAt: new Date().toISOString(),
    })
    setBusinessRole("owner")
  }, [])

  const logout = React.useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setClientBusiness(null)
    setBusinessRole(null)
    setAccountStatus("guest")
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
