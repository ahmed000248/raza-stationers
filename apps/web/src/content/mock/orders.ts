import { Order, OrderItem } from "@raza-stationers/types"

export const mockOrders: Order[] = [
  {
    id: "RS-8842",
    orderNumber: "RS-8842",
    clientBusinessId: "cb-101",
    placedByUserId: "user-1",
    status: "pending_review",
    paymentMethod: "CASH_ON_DELIVERY",
    subtotal: 4250,
    deliveryCharge: 0,
    total: 4250,
    deliveryAddress: "Shop #42, Main Stationery Market, Urdu Bazar, Karachi",
    createdAt: "2026-07-25T02:30:00Z",
    items: [
      {
        id: "item-8842-1",
        orderId: "RS-8842",
        productId: "prod-1",
        productName: "Evergreen A4 Copy Paper (80gsm, 500 Sheets)",
        unit: "Rim (500 Sheets)",
        quantity: 3,
        unitPriceAtOrder: 1250,
        lineTotal: 3750,
      },
      {
        id: "item-8842-2",
        orderId: "RS-8842",
        productId: "prod-2",
        productName: "Hardcover Register Notebook (400 Pages)",
        unit: "Piece",
        quantity: 1,
        unitPriceAtOrder: 480,
        lineTotal: 480,
      },
    ],
  },
  {
    id: "RS-7419",
    orderNumber: "RS-7419",
    clientBusinessId: "cb-101",
    placedByUserId: "user-1",
    status: "confirmed",
    paymentMethod: "ONLINE_BANK_TRANSFER",
    subtotal: 8900,
    deliveryCharge: 0,
    total: 8900,
    deliveryAddress: "Office #12, Commercial Area, Gulberg III, Lahore",
    createdAt: "2026-07-20T10:15:00Z",
    confirmedAt: "2026-07-20T11:00:00Z",
    items: [
      {
        id: "item-7419-1",
        orderId: "RS-7419",
        productId: "prod-3",
        productName: "Blue Gel Pen Box (10 Pieces)",
        unit: "Box (100 Pens)",
        quantity: 2,
        unitPriceAtOrder: 3500,
        lineTotal: 7000,
      },
      {
        id: "item-7419-2",
        orderId: "RS-7419",
        productId: "prod-4",
        productName: "Heavy Duty Lever Arch Box File",
        unit: "Dozen (12 Files)",
        quantity: 1,
        unitPriceAtOrder: 1900,
        lineTotal: 1900,
      },
    ],
  },
]

export function getMockOrderById(id: string): Order {
  const found = mockOrders.find((o) => o.id === id || o.orderNumber === id)
  if (found) return found

  // Generate fallback mock order if custom ID passed
  return {
    id: id,
    orderNumber: id,
    clientBusinessId: "cb-101",
    placedByUserId: "user-1",
    status: "pending_review",
    paymentMethod: "CASH_ON_DELIVERY",
    subtotal: 3500,
    deliveryCharge: 0,
    total: 3500,
    deliveryAddress: "Shop #42, Main Stationery Market, Urdu Bazar, Karachi",
    createdAt: new Date().toISOString(),
    items: [
      {
        id: `item-${id}-1`,
        orderId: id,
        productId: "prod-1",
        productName: "Evergreen A4 Copy Paper (80gsm, 500 Sheets)",
        unit: "Rim (500 Sheets)",
        quantity: 2,
        unitPriceAtOrder: 1250,
        lineTotal: 2500,
      },
      {
        id: `item-${id}-2`,
        orderId: id,
        productId: "prod-3",
        productName: "Blue Gel Pen Box (10 Pieces)",
        unit: "Pack (10 Pens)",
        quantity: 2,
        unitPriceAtOrder: 500,
        lineTotal: 1000,
      },
    ],
  }
}
