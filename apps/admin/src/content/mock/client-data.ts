import { ClientBusiness, ClientBusinessAccountStatus } from "@raza-stationers/types"

export interface ClientOrderItem {
  id: string
  ago: string
  totalFmt: string
}

export interface ClientPaymentItem {
  id: string
  date: string
  amountFmt: string
  method: string
}

export interface DetailedClientBusiness extends ClientBusiness {
  discountTier: string
  phone: string
  since: string
  orders: ClientOrderItem[]
  payments: ClientPaymentItem[]
}

export const MOCK_CLIENTS: DetailedClientBusiness[] = [
  {
    id: "CB-101",
    businessName: "Crown Traders",
    ownerName: "Kamran Ahmed",
    contactPerson: "Kamran Ahmed",
    phone: "0300-1122334",
    city: "Karachi",
    address: "Shop 12, Main Stationery Market",
    businessType: "stationery_shop",
    discountTier: "Tier A",
    discountPercent: 15,
    accountStatus: "active",
    creditStatus: "active",
    creditLimit: 150000,
    outstandingBalance: 48500,
    createdAt: "2025-01-15T00:00:00Z",
    since: "15 Jan 2025",
    orders: [
      { id: "ORD-9402", ago: "2 days ago", totalFmt: "Rs 48,500" },
      { id: "ORD-9210", ago: "2 weeks ago", totalFmt: "Rs 62,000" },
    ],
    payments: [
      { id: "PAY-801", date: "10 Jul 2026", amountFmt: "Rs 62,000", method: "Bank Transfer" },
      { id: "PAY-745", date: "24 Jun 2026", amountFmt: "Rs 45,000", method: "Cheque" },
    ],
  },
  {
    id: "CB-102",
    businessName: "Al-Madina Stationers",
    ownerName: "Tariq Mahmood",
    contactPerson: "Tariq Mahmood",
    phone: "0321-4455667",
    city: "Lahore",
    address: "Market 5, Urdu Bazar",
    businessType: "distributor",
    discountTier: "Tier B",
    discountPercent: 10,
    accountStatus: "active",
    creditStatus: "active",
    creditLimit: 200000,
    outstandingBalance: 124000,
    createdAt: "2025-03-02T00:00:00Z",
    since: "02 Mar 2025",
    orders: [
      { id: "ORD-9401", ago: "Yesterday", totalFmt: "Rs 124,000" },
      { id: "ORD-9150", ago: "1 month ago", totalFmt: "Rs 95,000" },
    ],
    payments: [
      { id: "PAY-790", date: "01 Jul 2026", amountFmt: "Rs 95,000", method: "Bank Transfer" },
    ],
  },
  {
    id: "CB-103",
    businessName: "Urdu Bazar Book Depot",
    ownerName: "Zubair Hashmi",
    contactPerson: "Zubair Hashmi",
    phone: "0333-7788990",
    city: "Karachi",
    address: "Block B, Urdu Bazar",
    businessType: "bookstore",
    discountTier: "Tier C",
    discountPercent: 5,
    accountStatus: "pending",
    creditStatus: "active",
    creditLimit: 50000,
    outstandingBalance: 0,
    createdAt: "2026-07-24T00:00:00Z",
    since: "24 Jul 2026",
    orders: [],
    payments: [],
  },
  {
    id: "CB-104",
    businessName: "Tariq Stationery Mart",
    ownerName: "Usman Ghani",
    contactPerson: "Usman Ghani",
    phone: "0301-8899001",
    city: "Rawalpindi",
    address: "Saddar Bazar",
    businessType: "office",
    discountTier: "Tier A",
    discountPercent: 15,
    accountStatus: "active",
    creditStatus: "suspended",
    creditLimit: 100000,
    outstandingBalance: 78000,
    createdAt: "2024-11-10T00:00:00Z",
    since: "10 Nov 2024",
    orders: [
      { id: "ORD-9350", ago: "3 weeks ago", totalFmt: "Rs 78,000" },
    ],
    payments: [
      { id: "PAY-710", date: "15 May 2026", amountFmt: "Rs 50,000", method: "Cash" },
    ],
  },
  {
    id: "CB-105",
    businessName: "City Paper Mart",
    ownerName: "Faisal Bilal",
    contactPerson: "Faisal Bilal",
    phone: "0345-2233445",
    city: "Faisalabad",
    address: "Stationery Plaza",
    businessType: "stationery_shop",
    discountTier: "Standard",
    discountPercent: 0,
    accountStatus: "pending",
    creditStatus: "active",
    creditLimit: 30000,
    outstandingBalance: 0,
    createdAt: "2026-07-25T00:00:00Z",
    since: "25 Jul 2026",
    orders: [],
    payments: [],
  },
]
