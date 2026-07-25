export type AdminOrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "dispatched"
  | "delivered"
  | "rejected"

export interface OrderItemDetail {
  id: string
  name: string
  qty: number
  price: number
}

export interface OrderHistoryItem {
  status: string
  at: string
  note?: string
}

export interface AdminOrder {
  id: string
  client: string
  city: string
  tier: string
  status: AdminOrderStatus
  placedAt: string
  paymentMethod: string
  items: OrderItemDetail[]
  total: number
  history: OrderHistoryItem[]
}

export const DELIVERY_STAFF = ["Bilal Hussain", "Imran Sheikh", "Tariq Aziz"]

export const MOCK_ORDERS: AdminOrder[] = [
  {
    id: "ORD-9402",
    client: "Crown Traders",
    city: "Karachi",
    tier: "Tier A (15% off)",
    status: "pending",
    placedAt: "2026-07-25T14:30:00Z",
    paymentMethod: "Pay Later Credit",
    total: 48500,
    items: [
      { id: "i1", name: "Dollar Ballpoint Pen Blue (Pack of 10)", qty: 50, price: 180 },
      { id: "i2", name: "A4 Photocopy Paper 70gsm (Ream)", qty: 40, price: 920 },
      { id: "i3", name: "Pelikan Eraser AL20 White (Box)", qty: 6, price: 450 },
    ],
    history: [
      { status: "Placed by client", at: "2026-07-25T14:30:00Z" },
    ],
  },
  {
    id: "ORD-9401",
    client: "Al-Madina Stationers",
    city: "Lahore",
    tier: "Tier B (10% off)",
    status: "confirmed",
    placedAt: "2026-07-25T11:15:00Z",
    paymentMethod: "Bank Transfer",
    total: 124000,
    items: [
      { id: "i4", name: "Register Ledger 200 Pages", qty: 100, price: 450 },
      { id: "i5", name: "Piano Fountain Ink 60ml Blue", qty: 200, price: 395 },
    ],
    history: [
      { status: "Placed by client", at: "2026-07-25T11:15:00Z" },
      { status: "Confirmed", at: "2026-07-25T12:00:00Z" },
    ],
  },
  {
    id: "ORD-9398",
    client: "Urdu Bazar Book Depot",
    city: "Karachi",
    tier: "Tier C (5% off)",
    status: "packed",
    placedAt: "2026-07-24T16:45:00Z",
    paymentMethod: "Cash on Delivery",
    total: 32500,
    items: [
      { id: "i6", name: "Dux Pencil Sharpener Metal (Box)", qty: 25, price: 500 },
      { id: "i7", name: "Dollar Ballpoint Pen Red (Pack of 10)", qty: 100, price: 200 },
    ],
    history: [
      { status: "Placed by client", at: "2026-07-24T16:45:00Z" },
      { status: "Confirmed", at: "2026-07-24T17:10:00Z" },
      { status: "Packed", at: "2026-07-25T09:30:00Z", note: "Ready for dispatch" },
    ],
  },
  {
    id: "ORD-9380",
    client: "Tariq Stationery Mart",
    city: "Rawalpindi",
    tier: "Tier A (15% off)",
    status: "dispatched",
    placedAt: "2026-07-24T10:00:00Z",
    paymentMethod: "Pay Later Credit",
    total: 78000,
    items: [
      { id: "i8", name: "A4 Photocopy Paper 70gsm (Ream)", qty: 80, price: 920 },
      { id: "i9", name: "Piano Fountain Ink 60ml Blue", qty: 100, price: 395 },
    ],
    history: [
      { status: "Placed by client", at: "2026-07-24T10:00:00Z" },
      { status: "Confirmed", at: "2026-07-24T10:30:00Z" },
      { status: "Packed", at: "2026-07-24T14:00:00Z" },
      { status: "Dispatched", at: "2026-07-25T08:00:00Z", note: "Driver: Bilal Hussain" },
    ],
  },
  {
    id: "ORD-9375",
    client: "City Paper Mart",
    city: "Faisalabad",
    tier: "Standard (0% off)",
    status: "delivered",
    placedAt: "2026-07-23T09:00:00Z",
    paymentMethod: "Bank Transfer",
    total: 15500,
    items: [
      { id: "i10", name: "Pelikan Eraser AL20 White (Box)", qty: 30, price: 450 },
      { id: "i11", name: "Register Ledger 200 Pages", qty: 4, price: 500 },
    ],
    history: [
      { status: "Placed by client", at: "2026-07-23T09:00:00Z" },
      { status: "Confirmed", at: "2026-07-23T09:45:00Z" },
      { status: "Packed", at: "2026-07-23T11:00:00Z" },
      { status: "Dispatched", at: "2026-07-23T13:00:00Z" },
      { status: "Delivered", at: "2026-07-24T11:30:00Z", note: "Received by Faisal Bilal" },
    ],
  },
]
