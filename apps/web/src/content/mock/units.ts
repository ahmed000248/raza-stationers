import { ProductUnit } from "@raza-stationers/types"

export const mockProductUnits: Record<string, ProductUnit[]> = {
  "prod-1": [
    { id: "u-1-1", productId: "prod-1", unitName: "Rim (500 Sheets)", conversionToBase: 1 },
    { id: "u-1-2", productId: "prod-1", unitName: "Box (5 Rims)", conversionToBase: 5 },
    { id: "u-1-3", productId: "prod-1", unitName: "Carton (20 Rims)", conversionToBase: 20 },
  ],
  "prod-2": [
    { id: "u-2-1", productId: "prod-2", unitName: "Piece", conversionToBase: 1 },
    { id: "u-2-2", productId: "prod-2", unitName: "Pack (6 Registers)", conversionToBase: 6 },
    { id: "u-2-3", productId: "prod-2", unitName: "Carton (24 Registers)", conversionToBase: 24 },
  ],
  "prod-3": [
    { id: "u-3-1", productId: "prod-3", unitName: "Pack (10 Pens)", conversionToBase: 1 },
    { id: "u-3-2", productId: "prod-3", unitName: "Box (100 Pens)", conversionToBase: 10 },
    { id: "u-3-3", productId: "prod-3", unitName: "Carton (500 Pens)", conversionToBase: 50 },
  ],
  "prod-4": [
    { id: "u-4-1", productId: "prod-4", unitName: "Piece", conversionToBase: 1 },
    { id: "u-4-2", productId: "prod-4", unitName: "Dozen (12 Files)", conversionToBase: 12 },
  ],
  "prod-5": [
    { id: "u-5-1", productId: "prod-5", unitName: "Piece", conversionToBase: 1 },
    { id: "u-5-2", productId: "prod-5", unitName: "Box (10 Staplers)", conversionToBase: 10 },
  ],
  "prod-6": [
    { id: "u-6-1", productId: "prod-6", unitName: "Piece", conversionToBase: 1 },
    { id: "u-6-2", productId: "prod-6", unitName: "Pack (12 Cutters)", conversionToBase: 12 },
  ],
}
