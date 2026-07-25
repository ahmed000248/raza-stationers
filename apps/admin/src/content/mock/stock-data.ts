export interface StockProductItem {
  id: string
  name: string
  sku: string
  stock: number
  threshold: number
  unit: string
}

export interface StockEntryItem {
  id: string
  date: string
  product: string
  qty: number
  supplier?: string
  price?: number
  total?: number
  reason?: string
  type: "restock" | "correction"
}

export const MOCK_STOCK_PRODUCTS: StockProductItem[] = [
  {
    id: "prod-1",
    name: "Dollar Ballpoint Pen Blue (Pack of 10)",
    sku: "SKU-PEN-01",
    stock: 8,
    threshold: 20,
    unit: "packs",
  },
  {
    id: "prod-2",
    name: "Piano Fountain Ink 60ml Blue",
    sku: "SKU-INK-02",
    stock: 12,
    threshold: 15,
    unit: "bottles",
  },
  {
    id: "prod-3",
    name: "A4 Photocopy Paper 70gsm (Ream 500 Sheets)",
    sku: "SKU-PAP-03",
    stock: 45,
    threshold: 50,
    unit: "reams",
  },
  {
    id: "prod-4",
    name: "Pelikan Eraser AL20 White (Box of 20)",
    sku: "SKU-ERA-04",
    stock: 120,
    threshold: 30,
    unit: "boxes",
  },
  {
    id: "prod-5",
    name: "Dux Pencil Sharpener Metal (Box of 24)",
    sku: "SKU-SHR-05",
    stock: 65,
    threshold: 25,
    unit: "boxes",
  },
  {
    id: "prod-6",
    name: "Register Ledger 200 Pages Hardbound",
    sku: "SKU-REG-06",
    stock: 18,
    threshold: 20,
    unit: "pcs",
  },
]

export const MOCK_STOCK_ENTRIES: StockEntryItem[] = [
  {
    id: "ent-101",
    date: "2026-07-24",
    product: "Dollar Ballpoint Pen Blue (Pack of 10)",
    qty: 50,
    supplier: "Dollar Industries Ltd",
    price: 180,
    total: 9000,
    type: "restock",
  },
  {
    id: "ent-102",
    date: "2026-07-23",
    product: "Piano Fountain Ink 60ml Blue",
    qty: -5,
    supplier: "",
    reason: "Damaged in warehouse leak",
    price: 0,
    total: 0,
    type: "correction",
  },
  {
    id: "ent-103",
    date: "2026-07-21",
    product: "A4 Photocopy Paper 70gsm (Ream 500 Sheets)",
    qty: 100,
    supplier: "Paper One Distributors",
    price: 920,
    total: 92000,
    type: "restock",
  },
  {
    id: "ent-104",
    date: "2026-07-18",
    product: "Pelikan Eraser AL20 White (Box of 20)",
    qty: 30,
    supplier: "Pelikan Pakistan",
    price: 450,
    total: 13500,
    type: "restock",
  },
]

export const MOCK_SUPPLIERS = [
  "Dollar Industries Ltd",
  "Piano Stationery Wholesalers",
  "Paper One Distributors",
  "Pelikan Pakistan",
  "Local Wholesale Market",
]
