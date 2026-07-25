"use client"

import * as React from "react"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"
import { MOCK_DASHBOARD_TARGETS } from "@/content/mock/dashboard-data"
import { KpiTile } from "@/components/dashboard/KpiTile"
import { SalesLineChart } from "@/components/dashboard/SalesLineChart"
import { CategoryBars } from "@/components/dashboard/CategoryBars"
import { LowStockList } from "@/components/dashboard/LowStockList"
import { RecentOrdersList } from "@/components/dashboard/RecentOrdersList"

export default function DashboardPage() {
  const { role } = useAdminShell()
  const userIsOwner = isOwner(role)

  const pending = MOCK_DASHBOARD_TARGETS.pending
  const lowStock = MOCK_DASHBOARD_TARGETS.lowStock
  const approvals = MOCK_DASHBOARD_TARGETS.approvals
  const overdue = MOCK_DASHBOARD_TARGETS.overdue
  const packing = MOCK_DASHBOARD_TARGETS.packing
  const deliveries = MOCK_DASHBOARD_TARGETS.deliveries

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">
            Dashboard
          </h1>
          <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">
            Friday, 25 July 2026 · overview of today's operations
          </div>
        </div>
      </div>

      {/* 6 KPI Metric Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiTile
          label="Pending Orders"
          urdu="زیر التوا آرڈرز"
          targetValue={pending}
          subText={pending > 0 ? "Needs review" : "All clear"}
          toneColor={pending > 0 ? "var(--amber-ink)" : "var(--evergreen-600)"}
        />
        <KpiTile
          label="Low-Stock Alerts"
          urdu="کم اسٹاک"
          targetValue={lowStock}
          subText={`${lowStock} items below threshold`}
          toneColor="var(--red-ink)"
        />
        <KpiTile
          label="Wholesale Approvals"
          urdu="رعایتی منظوری"
          targetValue={approvals}
          subText="Awaiting owner decision"
          toneColor="var(--blue-ink)"
          locked={!userIsOwner}
        />
        <KpiTile
          label="Overdue Payments"
          urdu="زیر التوا ادائیگی"
          targetValue={overdue}
          subText="Clients over limit"
          toneColor="var(--red-ink)"
          locked={!userIsOwner}
        />
        <KpiTile
          label="Packing Queue"
          urdu="پیکنگ قطار"
          targetValue={packing}
          subText="Confirmed, not packed"
          toneColor="var(--forest-700)"
        />
        <KpiTile
          label="Today's Deliveries"
          urdu="آج کی ترسیل"
          targetValue={deliveries}
          subText="Currently dispatched"
          toneColor="var(--forest-700)"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
        <SalesLineChart />
        <CategoryBars />
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LowStockList />
        <RecentOrdersList />
      </div>
    </div>
  )
}
