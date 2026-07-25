"use client"

import * as React from "react"
import { AdminNav } from "@/components/admin/AdminNav"
import { StaffManagementTable } from "@/components/admin/StaffManagementTable"
import { StockManagementPanel } from "@/components/admin/StockManagementPanel"
import { OrderOperationsTable } from "@/components/admin/OrderOperationsTable"
import { DiscountRulesManager } from "@/components/admin/DiscountRulesManager"
import { ShieldCheck, ShoppingBag, Package, Users, Percent, AlertCircle } from "lucide-react"

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "orders" | "stock" | "staff" | "discounts">(
    "overview"
  )

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      <AdminNav />

      <div className="mx-auto max-w-7xl px-6 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">
              Operations Control Center
            </span>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-ink-900)] mt-1">
              Owner & Admin Operations Dashboard
            </h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)] bg-card font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>Overview KPIs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)] bg-card font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="size-4" />
            <span>Order State Machine (FR-ORD)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stock")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "stock"
                ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)] bg-card font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="size-4" />
            <span>Stock & Restock (FR-STK-07)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "staff"
                ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)] bg-card font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="size-4" />
            <span>Staff Roles (FR-STF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("discounts")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "discounts"
                ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)] bg-card font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Percent className="size-4" />
            <span>Discount Rules & Log (FR-PRC-05)</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
                  Active Orders
                </span>
                <span className="font-heading font-bold text-3xl text-[var(--color-ink-900)]">14</span>
                <span className="text-[11px] text-[var(--color-evergreen-600)] font-medium block">
                  2 Pending Review
                </span>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
                  Dispatched Today
                </span>
                <span className="font-heading font-bold text-3xl text-[var(--color-evergreen-600)]">8</span>
                <span className="text-[11px] text-muted-foreground block">Zone deliveries active</span>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
                  Pending Business Approvals
                </span>
                <span className="font-heading font-bold text-3xl text-amber-600">3</span>
                <span className="text-[11px] text-amber-700 block">NTN/CNIC verification needed</span>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
                  Low Stock Items
                </span>
                <span className="font-heading font-bold text-3xl text-destructive">2</span>
                <span className="text-[11px] text-muted-foreground block">Requires restock PO</span>
              </div>
            </div>

            <OrderOperationsTable />
          </div>
        )}

        {activeTab === "orders" && <OrderOperationsTable />}

        {activeTab === "stock" && <StockManagementPanel />}

        {activeTab === "staff" && <StaffManagementTable />}

        {activeTab === "discounts" && <DiscountRulesManager />}
      </div>
    </div>
  )
}
