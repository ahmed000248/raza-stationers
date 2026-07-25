"use client"

import * as React from "react"
import { User, ClientBusiness, BusinessUserRole } from "@raza-stationers/types"
import { UserPricingContext } from "@/lib/pricing"

export type AccountStatus = "guest" | "pending" | "approved"

interface AuthContextValue {
  accountStatus: AccountStatus
  user: User | null
  clientBusiness: ClientBusiness | null
  businessRole: BusinessUserRole | null
  pricingContext: UserPricingContext
  loginAs: (status: AccountStatus) => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const AUTH_STORAGE_KEY = "raza_stationers_auth_status_v1"

const mockApprovedUser: User = {
  id: "user-101",
  mobileNumber: "03001234567",
  passwordHash: "",
  name: "Ahmed Raza",
  role: "business_user",
  isActive: true,
  createdAt: "2026-01-15T00:00:00Z",
}

const mockApprovedBusiness: ClientBusiness = {
  id: "cb-101",
  businessName: "Al-Raza Book Depot & Stationers",
  ownerName: "Ahmed Raza",
  contactPerson: "Ahmed Raza",
  phone: "03001234567",
  email: "ahmed@alrazabookdepot.com",
  address: "Shop #42, Main Stationery Market, Urdu Bazar, Karachi",
  city: "Karachi",
  businessType: "bookstore",
  accountStatus: "active",
  creditLimit: 50000,
  outstandingBalance: 12500,
  creditStatus: "active",
  discountPercent: 15,
  createdAt: "2026-01-15T00:00:00Z",
}

const mockPendingUser: User = {
  id: "user-102",
  mobileNumber: "03219876543",
  passwordHash: "",
  name: "Tariq Mahmood",
  role: "business_user",
  isActive: true,
  createdAt: "2026-07-24T00:00:00Z",
}

const mockPendingBusiness: ClientBusiness = {
  id: "cb-102",
  businessName: "Punjab Traders & Stationers",
  ownerName: "Tariq Mahmood",
  contactPerson: "Tariq Mahmood",
  phone: "03219876543",
  email: "tariq@punjabstationers.pk",
  address: "Office #12, Commercial Area, Gulberg III, Lahore",
  city: "Lahore",
  businessType: "stationery_shop",
  accountStatus: "pending",
  creditLimit: 0,
  outstandingBalance: 0,
  creditStatus: "suspended",
  discountPercent: 0,
  createdAt: "2026-07-24T00:00:00Z",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accountStatus, setAccountStatus] = React.useState<AccountStatus>("guest")
  const [user, setUser] = React.useState<User | null>(null)
  const [clientBusiness, setClientBusiness] = React.useState<ClientBusiness | null>(null)
  const [businessRole, setBusinessRole] = React.useState<BusinessUserRole | null>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Load stored auth status on client mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY) as AccountStatus | null
      if (stored && ["guest", "pending", "approved"].includes(stored)) {
        loginAs(stored)
      } else {
        loginAs("guest")
      }
    } catch {
      loginAs("guest")
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const loginAs = React.useCallback((status: AccountStatus) => {
    setAccountStatus(status)
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, status)
    } catch {}

    if (status === "approved") {
      setUser(mockApprovedUser)
      setClientBusiness(mockApprovedBusiness)
      setBusinessRole("owner")
    } else if (status === "pending") {
      setUser(mockPendingUser)
      setClientBusiness(mockPendingBusiness)
      setBusinessRole("owner")
    } else {
      setUser(null)
      setClientBusiness(null)
      setBusinessRole(null)
    }
  }, [])

  const logout = React.useCallback(() => {
    loginAs("guest")
  }, [loginAs])

  // Resolve CD-04 Pricing Context
  const pricingContext: UserPricingContext = React.useMemo(() => {
    if (accountStatus === "approved" && clientBusiness?.accountStatus === "active") {
      return {
        isApprovedBusiness: true,
        businessDiscountPercent: clientBusiness.discountPercent || 15,
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
        loginAs,
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
