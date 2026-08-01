"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Percent,
  Package,
  ShoppingBag,
  BookOpen,
  Truck,
  Users,
  FileText,
  ShieldAlert,
  Settings,
  LogOut,
} from "lucide-react"
import { AdminRole, ROLE_OPTIONS, OWNER_ONLY_ROUTES, isOwner } from "@/lib/role"
import { useAdminShell } from "./AdminShell"
import { useAdminAuth } from "@/hooks/use-admin-auth"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  ownerOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Client Businesses", href: "/client-businesses", icon: Building2 },
  { label: "Discount & Credit", href: "/discount-credit", icon: Percent },
  { label: "Stock Management", href: "/stock", icon: Package },
  { label: "Order Queue", href: "/orders", icon: ShoppingBag },
  { label: "Product Catalogue", href: "/catalogue", icon: BookOpen },
  { label: "Delivery Management", href: "/delivery", icon: Truck },
  { label: "Staff Management", href: "/staff", icon: Users, ownerOnly: true },
  { label: "Accounting & Reporting", href: "/accounting", icon: FileText, ownerOnly: true },
  { label: "Audit Log", href: "/audit-log", icon: ShieldAlert, ownerOnly: true },
  { label: "Settings", href: "/settings", icon: Settings, ownerOnly: true },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { role, addToast, userName } = useAdminShell()
  const { logout } = useAdminAuth()

  const currentRoleOption = ROLE_OPTIONS.find((r) => r.key === role) || ROLE_OPTIONS[0]
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.ownerOnly && !isOwner(role)) {
      e.preventDefault()
      addToast({
        title: "Owner only",
        description: `Access to ${item.label} is restricted to the Store Owner role.`,
        type: "warning",
      })
    }
  }

  return (
    <aside className="w-[240px] shrink-0 bg-[#051F20] text-white flex flex-col p-4 sticky top-0 h-screen box-border overflow-hidden select-none">
      {/* Title & Subtitle */}
      <div className="px-2 pb-5 pt-1">
        <Image src="/brand-mark.svg" alt="Raza Stationers" width={40} height={40} className="mb-3 size-10 rounded-xl" />
        <div className="font-heading text-[17px] font-semibold text-white tracking-tight">
          Raza Stationers
        </div>
        <div className="text-[11px] text-[var(--sage-400)] mt-0.5">
          Admin Panel · انتظامی پینل
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto pr-1 -mr-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          const isLocked = item.ownerOnly && !isOwner(role)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13.5px] transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#235347] text-white font-semibold"
                  : isLocked
                  ? "text-white/40 hover:bg-white/5"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white" : isLocked ? "text-white/40" : "text-[var(--sage-400)]"} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.ownerOnly && (
                <span className={`text-[11px] ${isLocked ? "text-[var(--sage-400)]" : "text-white/40"}`}>
                  🔒
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-white/10 pt-3.5 mt-2.5">
        <div className="flex items-center gap-2.5 px-2 pt-1">
          <div className="w-8 h-8 rounded-full bg-[var(--evergreen-600)] text-white text-xs font-semibold flex items-center justify-center border border-white/20">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-[12.5px] font-semibold truncate leading-tight">
              {userName}
            </div>
            <div className="text-[11px] text-[var(--sage-400)] truncate">
              {currentRoleOption.roleLabel}
            </div>
          </div>
          <button onClick={() => { logout(); router.push("/login"); }} className="text-white/60 hover:text-white transition-colors" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
