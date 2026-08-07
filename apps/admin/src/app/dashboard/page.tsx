"use client"

import * as React from "react"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { KpiTile } from "@/components/dashboard/KpiTile"
import { SalesLineChart } from "@/components/dashboard/SalesLineChart"
import { CategoryBars } from "@/components/dashboard/CategoryBars"
import { LowStockList } from "@/components/dashboard/LowStockList"
import { RecentOrdersList } from "@/components/dashboard/RecentOrdersList"

export default function DashboardPage() {
  const { role } = useAdminShell()
  const userIsOwner = isOwner(role)
  const [stats] = React.useState<any>({ pendingOrders: 0, pendingClients: 0, totalProducts: 2167, totalOrders: 0 })

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">Dashboard</h1>
          <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">Overview of current operations</div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 font-medium">Backend rebuild in progress</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiTile label="Pending Orders" urdu="زیر التوا آرڈرز" targetValue={stats?.pendingOrders || 0} subText="All clear" toneColor="var(--evergreen-600)" />
        <KpiTile label="Pending Approvals" urdu="منظوری کے منتظر" targetValue={stats?.pendingClients || 0} subText="New client registrations" toneColor="var(--amber-ink)" />
        <KpiTile label="Catalogue Products" urdu="مصنوعات" targetValue={stats?.totalProducts || 2167} subText="Certified catalogue" toneColor="var(--evergreen-600)" />
        <KpiTile label="All Orders" urdu="تمام آرڈرز" targetValue={stats?.totalOrders || 0} subText="Total processed" toneColor="var(--evergreen-600)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersList />
        <LowStockList />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesLineChart />
        <CategoryBars />
      </div>
    </div>
  )
}
