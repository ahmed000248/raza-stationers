"use client"

import * as React from "react"
import { Button, Dialog, DialogHeader, DialogTitle, Badge } from "@raza-stationers/ui"
import { AdminCatalogueProduct, MOCK_CATEGORIES } from "@/content/mock/catalogue-data"
import { useAdminShell } from "@/components/shell/AdminShell"
import { Upload, AlertTriangle, CheckCircle2 } from "lucide-react"

interface BulkImportModalProps {
  open: boolean
  onClose: () => void
  onImportValidProducts: (products: AdminCatalogueProduct[]) => void
}

interface ParsedImportRow {
  rowNum: number
  sku: string
  name: string
  category: string
  price: number
  stock: number
  unit: string
  isValid: boolean
  error?: string
}

const MOCK_CSV_PREVIEW_ROWS: ParsedImportRow[] = [
  {
    rowNum: 1,
    sku: "RS-IMP-101",
    name: "Permanent Marker Black (Box of 12)",
    category: "Writing Instruments",
    price: 360,
    stock: 50,
    unit: "box",
    isValid: true,
  },
  {
    rowNum: 2,
    sku: "RS-IMP-102",
    name: "Correction Tape 5mm x 8m",
    category: "Stationery",
    price: 150,
    stock: 100,
    unit: "pc",
    isValid: true,
  },
  {
    rowNum: 3,
    sku: "RS-IMP-103",
    name: "Unbranded Calculator 12-Digit",
    category: "Unknown Category",
    price: 850,
    stock: 20,
    unit: "pc",
    isValid: false,
    error: "Invalid category 'Unknown Category'",
  },
  {
    rowNum: 4,
    sku: "RS-IMP-104",
    name: "Spiral Notebook A5 100 Sheets",
    category: "Paper Products",
    price: 0,
    stock: 30,
    unit: "pc",
    isValid: false,
    error: "Price must be greater than 0",
  },
  {
    rowNum: 5,
    sku: "RS-IMP-105",
    name: "Sticky Notes 3x3 Yellow (Pad of 100)",
    category: "Office Supplies",
    price: 120,
    stock: 80,
    unit: "pad",
    isValid: true,
  },
]

export function BulkImportModal({
  open,
  onClose,
  onImportValidProducts,
}: BulkImportModalProps) {
  const { addToast } = useAdminShell()
  const [fileSelected, setFileSelected] = React.useState<boolean>(false)
  const [rows, setRows] = React.useState<ParsedImportRow[]>([])

  const handleSimulateFileSelect = () => {
    setFileSelected(true)
    setRows(MOCK_CSV_PREVIEW_ROWS)
  }

  const validRows = rows.filter((r) => r.isValid)
  const invalidRows = rows.filter((r) => !r.isValid)

  const handleConfirmImport = () => {
    if (validRows.length === 0) return

    const newProducts: AdminCatalogueProduct[] = validRows.map((r) => ({
      id: `p-imp-${r.rowNum}-${Date.now()}`,
      sku: r.sku,
      name: r.name,
      category: MOCK_CATEGORIES.includes(r.category)
        ? r.category
        : MOCK_CATEGORIES[0],
      price: r.price,
      stock: r.stock,
      threshold: 15,
      unit: r.unit,
      purchaseType: "both",
    }))

    onImportValidProducts(newProducts)

    addToast({
      title: `Imported ${validRows.length} products`,
      description: `${invalidRows.length} invalid rows were skipped per FR-MIG-02.`,
      type: "success",
    })

    setFileSelected(false)
    setRows([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div className="max-w-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="font-heading text-lg font-semibold text-[var(--ink-900)]">
            Bulk Product Import (CSV / Excel)
          </DialogTitle>
          <div className="text-xs text-[var(--text-muted)] font-sans">
            Upload CSV/Excel file. Invalid rows are flagged for correction while valid rows can proceed.
          </div>
        </DialogHeader>

        {!fileSelected ? (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center font-sans">
            <Upload className="w-10 h-10 text-[var(--sage-400)] mx-auto mb-3" />
            <div className="text-xs font-semibold text-[var(--ink-900)] mb-1">
              Click to select CSV file or drag and drop
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mb-4">
              Supported columns: SKU, Name, Category, Price, InitialStock, Unit
            </div>
            <Button
              variant="default"
              onClick={handleSimulateFileSelect}
              className="h-10 text-xs px-5"
            >
              Select & Validate File
            </Button>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {/* Summary Bar */}
            <div className="flex items-center justify-between bg-[var(--canvas)] p-3 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-[var(--evergreen-600)] font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{validRows.length} Valid rows ready</span>
              </div>
              {invalidRows.length > 0 && (
                <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{invalidRows.length} Invalid rows skipped (FR-MIG-02)</span>
                </div>
              )}
            </div>

            {/* Validation Table */}
            <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[var(--canvas)] text-[var(--sage-400)] text-[11px] uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {rows.map((r) => (
                    <tr
                      key={r.rowNum}
                      className={r.isValid ? "bg-white" : "bg-amber-50/50"}
                    >
                      <td className="px-3 py-2.5 font-mono text-[11px]">
                        #{r.rowNum}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-[var(--ink-900)]">
                        {r.name}
                      </td>
                      <td className="px-3 py-2.5 text-[var(--text-muted)]">
                        {r.category}
                      </td>
                      <td className="px-3 py-2.5 font-semibold">
                        Rs {r.price}
                      </td>
                      <td className="px-3 py-2.5">
                        {r.isValid ? (
                          <Badge className="bg-[var(--mist-100)] text-[var(--evergreen-600)] text-[10px] px-2 py-0.5">
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5">
                            {r.error}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setFileSelected(false)}
                className="h-10 text-xs px-4"
              >
                Re-upload File
              </Button>
              <Button
                variant="default"
                onClick={handleConfirmImport}
                disabled={validRows.length === 0}
                className="h-10 text-xs px-5"
              >
                Import {validRows.length} Valid Rows
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  )
}
