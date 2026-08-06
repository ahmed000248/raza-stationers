import { ProductPurchaseType } from "@raza-stationers/types"

export interface AdminCatalogueProduct {
  id: string
  sku: string
  name: string
  category: string
  price: number
  stock: number
  threshold: number
  unit: string
  purchaseType: ProductPurchaseType
  status?: string
  shopName?: string
}

export const MOCK_CATEGORIES = [
  "Stationery",
  "Paper Products",
  "Writing Instruments",
  "Office Supplies",
]

export const MOCK_CATALOGUE_PRODUCTS: AdminCatalogueProduct[] = [
  {
    id: "p1",
    sku: "RS-PEN-01",
    name: "Dollar Ballpoint Pen Blue (Pack of 10)",
    category: "Writing Instruments",
    price: 180,
    stock: 8,
    threshold: 20,
    unit: "pack",
    purchaseType: "both",
  },
  {
    id: "p2",
    sku: "RS-INK-02",
    name: "Piano Fountain Ink 60ml Blue",
    category: "Writing Instruments",
    price: 395,
    stock: 12,
    threshold: 15,
    unit: "bottle",
    purchaseType: "both",
  },
  {
    id: "p3",
    sku: "RS-PAP-03",
    name: "A4 Photocopy Paper 70gsm (Ream 500 Sheets)",
    category: "Paper Products",
    price: 920,
    stock: 45,
    threshold: 50,
    unit: "ream",
    purchaseType: "both",
  },
  {
    id: "p4",
    sku: "RS-ERA-04",
    name: "Pelikan Eraser AL20 White (Box of 20)",
    category: "Stationery",
    price: 450,
    stock: 120,
    threshold: 30,
    unit: "box",
    purchaseType: "both",
  },
  {
    id: "p5",
    sku: "RS-SHR-05",
    name: "Dux Pencil Sharpener Metal (Box of 24)",
    category: "Stationery",
    price: 500,
    stock: 65,
    threshold: 25,
    unit: "box",
    purchaseType: "both",
  },
  {
    id: "p6",
    sku: "RS-REG-06",
    name: "Register Ledger 200 Pages Hardbound",
    category: "Paper Products",
    price: 450,
    stock: 18,
    threshold: 20,
    unit: "pc",
    purchaseType: "individual",
  },
  {
    id: "p7",
    sku: "RS-OFF-07",
    name: "Heavy Duty Stapler 24/6-24/8",
    category: "Office Supplies",
    price: 1250,
    stock: 35,
    threshold: 10,
    unit: "pc",
    purchaseType: "both",
  },
  {
    id: "p8",
    sku: "RS-OFF-08",
    name: "Binder Clips 25mm (Box of 12)",
    category: "Office Supplies",
    price: 220,
    stock: 90,
    threshold: 20,
    unit: "box",
    purchaseType: "both",
  },
]
