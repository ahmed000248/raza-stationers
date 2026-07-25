import { StaffProfile, StockMovement, DiscountChangeLog, ClientBusiness } from "@raza-stationers/types"

export interface StaffWithUser {
  id: string
  userId: string
  name: string
  phone: string
  staffRole: "admin" | "packing" | "delivery"
  isActive: boolean
  joinDate: string
}

export const mockStaffMembers: StaffWithUser[] = [
  {
    id: "sp-1",
    userId: "u-staff-1",
    name: "Mohammad Usman",
    phone: "03001112233",
    staffRole: "admin",
    isActive: true,
    joinDate: "2024-02-10",
  },
  {
    id: "sp-2",
    userId: "u-staff-2",
    name: "Tariq Khan",
    phone: "03009876543",
    staffRole: "delivery",
    isActive: true,
    joinDate: "2024-06-15",
  },
  {
    id: "sp-3",
    userId: "u-staff-3",
    name: "Bilal Ahmed",
    phone: "03334445566",
    staffRole: "packing",
    isActive: true,
    joinDate: "2025-01-20",
  },
]

export const mockStockMovements: StockMovement[] = [
  {
    id: "sm-101",
    productId: "prod-1",
    quantityChange: 500,
    movementType: "restock",
    supplier: "Century Paper Mills",
    invoiceNumber: "CPM-9842",
    enteredByUserId: "u-staff-1",
    createdAt: "2026-07-20T08:00:00Z",
  },
  {
    id: "sm-102",
    productId: "prod-1",
    quantityChange: -12,
    movementType: "adjustment",
    reason: "Damaged paper reams during warehouse rain leak",
    enteredByUserId: "u-staff-1",
    createdAt: "2026-07-22T14:30:00Z",
  },
  {
    id: "sm-103",
    productId: "prod-3",
    quantityChange: 1000,
    movementType: "restock",
    supplier: "Dollar Industries Pakistan",
    invoiceNumber: "DIP-4410",
    enteredByUserId: "u-staff-1",
    createdAt: "2026-07-24T09:15:00Z",
  },
]

export const mockDiscountChangeLogs: DiscountChangeLog[] = [
  {
    id: "dcl-1",
    clientBusinessId: "cb-101",
    previousValue: "10%",
    newValue: "15%",
    changedByUserId: "u-staff-1",
    reason: "Upgraded business tier based on 1-year bulk purchasing volume milestone",
    createdAt: "2026-07-15T11:00:00Z",
  },
  {
    id: "dcl-2",
    clientBusinessId: "cb-102",
    previousValue: "0%",
    newValue: "10%",
    changedByUserId: "u-staff-1",
    reason: "Verified wholesale shop registration and NTN documentation",
    createdAt: "2026-07-24T16:20:00Z",
  },
]
