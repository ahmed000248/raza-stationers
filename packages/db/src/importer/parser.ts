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

/**
 * Reads and parses raw catalogue CSV rows.
 */
export async function parseCatalogueCsv(filePath: string): Promise<RawCatalogueRow[]> {
  const content = await fs.readFile(filePath, "utf8");
  const rawRows = parseCsvText(content);

  if (rawRows.length === 0) {
    return [];
  }

  // Find header row or assume standard: Item Name, Category, Sales Type, Wholesale Price
  let headerIndex = -1;
  for (let i = 0; i < Math.min(5, rawRows.length); i++) {
    const rowStr = rawRows[i].map((c) => c.toLowerCase().trim()).join(",");
    if (rowStr.includes("item name") || rowStr.includes("product name")) {
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

    const name = cells[0] ? cells[0].trim() : "";
    const category = cells[1] ? cells[1].trim() : "";
    const salesType = cells[2] ? cells[2].trim() : "";
    const priceStr = cells[3] ? cells[3].trim() : "";

    catalogueRows.push({
      sourceRowNumber: i + 1,
      sourceSheet: "Products",
      name,
      category,
      salesType,
      priceRaw: priceStr,
    });
  }

  return catalogueRows;
}
