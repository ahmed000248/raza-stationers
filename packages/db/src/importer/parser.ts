import fs from "node:fs/promises";
import { RawCatalogueRow } from "./types.js";

/**
 * Robust RFC-4180 compliant CSV line parser.
 */
export function parseCsvText(csvContent: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentCell);
        currentCell = "";
      } else if (char === "\r" && nextChar === "\n") {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = "";
        i++; // skip \n
      } else if (char === "\n" || char === "\r") {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

export async function parseCatalogueCsv(filePath: string): Promise<RawCatalogueRow[]> {
  const content = await fs.readFile(filePath, "utf8");
  const rawRows = parseCsvText(content);

  if (rawRows.length === 0) {
    return [];
  }

  // Find header row based on SKU or Product Name
  let headerIndex = -1;
  for (let i = 0; i < Math.min(5, rawRows.length); i++) {
    const rowStr = rawRows[i].map((c) => c.toLowerCase().trim()).join(",");
    if (rowStr.includes("sku") && (rowStr.includes("item name") || rowStr.includes("product name"))) {
      headerIndex = i;
      break;
    }
  }

  const dataStart = headerIndex >= 0 ? headerIndex + 1 : 0;
  const catalogueRows: RawCatalogueRow[] = [];

  for (let i = dataStart; i < rawRows.length; i++) {
    const cells = rawRows[i];
    if (cells.length === 0 || cells.every((c) => c.trim() === "")) {
      continue;
    }

    const sku = cells[0] ? cells[0].trim() : "";
    const name = cells[1] ? cells[1].trim() : "";
    const category = cells[2] ? cells[2].trim() : "";
    const salesType = cells[3] ? cells[3].trim() : "";
    const unitOfMeasure = cells[4] ? cells[4].trim() : "";
    const packQuantityRaw = cells[5] ? cells[5].trim() : "";
    const currency = cells[6] ? cells[6].trim() : "";
    const wholesalePriceRaw = cells[7] ? cells[7].trim() : "";
    const buyingPriceRaw = cells[8] ? cells[8].trim() : "";
    const profitRaw = cells[9] ? cells[9].trim() : "";
    const profitMarginRaw = cells[10] ? cells[10].trim() : "";
    const markupRaw = cells[11] ? cells[11].trim() : "";
    const activeRaw = cells[12] ? cells[12].trim() : "";
    const sourceKey = cells[13] ? cells[13].trim() : "";

    catalogueRows.push({
      sourceRowNumber: i + 1,
      sourceSheet: "Products",
      sku,
      name,
      category,
      salesType,
      unitOfMeasure,
      packQuantityRaw,
      currency,
      wholesalePriceRaw,
      buyingPriceRaw,
      profitRaw,
      profitMarginRaw,
      markupRaw,
      activeRaw,
      sourceKey,
    });
  }

  return catalogueRows;
}
