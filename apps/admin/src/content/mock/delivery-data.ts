export type DeliveryStatus = "packed" | "dispatched" | "delivered" | "failed"

export interface DeliveryItem {
  id: string
  client: string
  city: string
  total: number
  paymentMethod: string
  status: DeliveryStatus
  driver: string
  cashCollected?: number
  failedReason?: string
  dispatchedAt?: string
  deliveredAt?: string
}

export const DELIVERY_DRIVERS = ["Imran Sheikh", "Bilal Hussain", "Tariq Aziz"]

export const MOCK_DELIVERY_ORDERS: DeliveryItem[] = [
  {
    id: "ORD-9398",
    client: "Urdu Bazar Book Depot",
    city: "Karachi",
    total: 32500,
    paymentMethod: "Cash on Delivery",
    status: "packed",
    driver: "Imran Sheikh",
  },
  {
    id: "ORD-9380",
    client: "Tariq Stationery Mart",
    city: "Rawalpindi",
    total: 78000,
    paymentMethod: "Pay Later Credit",
    status: "dispatched",
    driver: "Imran Sheikh",
    dispatchedAt: "2026-07-25T08:00:00Z",
  },
  {
    id: "ORD-9375",
    client: "City Paper Mart",
    city: "Faisalabad",
    total: 15500,
    paymentMethod: "Bank Transfer",
    status: "delivered",
    driver: "Bilal Hussain",
    dispatchedAt: "2026-07-24T09:00:00Z",
    deliveredAt: "2026-07-24T14:30:00Z",
    cashCollected: 0,
  },
  {
    id: "ORD-9360",
    client: "Crown Traders",
    city: "Karachi",
    total: 24000,
    paymentMethod: "Cash on Delivery",
    status: "failed",
    driver: "Imran Sheikh",
    dispatchedAt: "2026-07-23T10:00:00Z",
    failedReason: "Shop premises closed upon arrival",
  },
]
