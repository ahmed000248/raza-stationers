// check_xlsx_categories.mjs
import path from 'path';
import { parseCatalogueXlsx } from '../../packages/db/src/importer/parser.js';

async function check() {
  const xlsxPath = path.resolve('data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx');
  const { rows } = await parseCatalogueXlsx(xlsxPath);
  const categories = new Set();
  for (const r of rows) {
    if (r.normalizedCategory) {
      categories.add(r.normalizedCategory);
    }
  }
  console.log(`Unique normalized categories in XLSX: ${categories.size}`);
}

check().catch(console.error);
