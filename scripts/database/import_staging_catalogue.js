require('dotenv').config();
const { CatalogueImporter } = require('../../packages/db/dist/importer/importer.js');
const path = require('path');

async function main() {
  const sourcePath = path.resolve('data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx');
  console.log('Generating plan for:', sourcePath);
  
  try {
    const { result } = await CatalogueImporter.generatePlan(sourcePath);
    console.log('Generated plan. Checksum:', result.sha256);
    
    console.log('Committing workbook to staging database...');
    const commitResult = await CatalogueImporter.commitWorkbook(sourcePath, 'user_admin123', result.planChecksum);
    console.log('Import successful!');
    console.log('Created counts:', commitResult.createdCounts);
  } catch (err) {
    console.error('Import failed:', err);
  }
}

main();
