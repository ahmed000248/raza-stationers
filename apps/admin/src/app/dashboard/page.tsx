"use client"

import * as React from "react"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { KpiTile } from "@/components/dashboard/KpiTile"
import { SalesLineChart } from "@/components/dashboard/SalesLineChart"
import { CategoryBars } from "@/components/dashboard/CategoryBars"
import { LowStockList } from "@/components/dashboard/LowStockList"
import { RecentOrdersList } from "@/components/dashboard/RecentOrdersList"
import { createAPIClient } from "@raza-stationers/api"
import { Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function DashboardPage() {
  const { role } = useAdminShell()
  const userIsOwner = isOwner(role)
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const api = createAPIClient({ baseUrl: API_BASE })
    api.getDashboardStats().then(setStats).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">Dashboard</h1>
          <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">Overview of current operations</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiTile label="Pending Orders" urdu="زیر التوا آرڈرز" targetValue={stats?.pendingOrders || 0} subText={stats?.pendingOrders > 0 ? "Needs review" : "All clear"} toneColor={stats?.pendingOrders > 0 ? "var(--amber-ink)" : "var(--evergreen-600)"} />
        <KpiTile label="Pending Approvals" urdu="منظوری کے منتظر" targetValue={stats?.pendingClients || 0} subText="New client registrations" toneColor="var(--amber-ink)" />
        <KpiTile label="Active Products" urdu="فعال مصنوعات" targetValue={stats?.totalProducts || 0} subText="In catalogue" toneColor="var(--evergreen-600)" />
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
