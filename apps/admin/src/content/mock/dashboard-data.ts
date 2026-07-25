import { Product, Order, ClientBusiness } from "@raza-stationers/types"

export interface DashboardTargets {
  pending: number
  lowStock: number
  approvals: number
  overdue: number
  packing: number
  deliveries: number
}

export interface CategoryBarItem {
  label: string
  value: number // percentage 0-100
  emphasis?: boolean
}

export interface LowStockItem {
  id: string
  name: string
  stock: number
  threshold: number
}

export interface RecentOrderItem {
  id: string
  client: string
  totalFmt: string
  status: string
}

export const MOCK_DASHBOARD_TARGETS: DashboardTargets = {
  pending: 3,
  lowStock: 4,
  approvals: 2,
  overdue: 1,
  packing: 5,
  deliveries: 4,
}

export const MOCK_CATEGORY_BARS: CategoryBarItem[] = [
  { label: "Paper", value: 85, emphasis: true },
  { label: "Pens", value: 62 },
  { label: "Office", value: 45 },
  { label: "Art", value: 30 },
]

export const MOCK_LOW_STOCK: LowStockItem[] = [
  { id: "P-101", name: "Officer A4 Paper Ream 80gsm", stock: 12, threshold: 20 },
  { id: "P-[102]", name: "Signature Gel Pen Blue 0.7mm", stock: 8, threshold: 50 },
  { id: "P-103", name: "Heavy Duty Stapler 24/6", stock: 3, threshold: 10 },
  { id: "P-104", name: "Sticky Notes 3x3 Yellow", stock: 15, threshold: 30 },
]

export const MOCK_RECENT_ORDERS: RecentOrderItem[] = [
  { id: "ORD-9402", client: "Crown Traders", totalFmt: "Rs 48,500", status: "pending" },
  { id: "ORD-9401", client: "Al-Madina Stationers", totalFmt: "Rs 124,000", status: "confirmed" },
  { id: "ORD-9400", client: "Walk-in Customer", totalFmt: "Rs 3,250", status: "delivered" },
  { id: "ORD-9399", client: "Urdu Bazar Book Depot", totalFmt: "Rs 87,900", status: "dispatched" },
]

export const MOCK_SALES_POINTS = "10,95 40,80 70,85 100,55 130,60 160,40 190,45 220,20 250,30 280,15"
