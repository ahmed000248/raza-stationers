import "dotenv/config";
import path from "node:path";
import { CatalogueImporter } from "./importer.js";

async function main() {
  const args = process.argv.slice(2);
  let sourcePath = "";
  let dryRun = false;
  let commit = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--source" && args[i + 1]) {
      sourcePath = args[i + 1];
      i++;
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--commit") {
      commit = true;
    }
  }

  // Default to catalogue-products.csv or RS-Database.xlsx if present and not specified
  if (!sourcePath) {
    sourcePath = path.join(process.cwd(), ".codex-phase7-tmp", "catalogue-products.csv");
  }

  if (!dryRun && !commit) {
    dryRun = true; // Default to dry-run safety
  }

  console.log(`====================================================`);
  console.log(`Raza Stationers — Catalogue Import Pipeline`);
  console.log(`Mode: ${commit ? "COMMIT MODE (DATABASE WRITES)" : "DRY RUN (READ-ONLY / NO WRITES)"}`);
  console.log(`Source: ${sourcePath}`);
  console.log(`====================================================\n`);

  let result;
  if (commit) {
    console.error("Commit mode is no longer supported via CLI. Use the protected Admin API endpoint instead.");
    process.exit(1);
  } else {
    const { result: planResult } = await CatalogueImporter.generatePlan(sourcePath);
    result = planResult;
  }

  console.log(`Import Execution Complete.`);
  console.log(`File SHA-256: ${result.sha256}`);
  console.log(`Already Committed: ${result.alreadyCommitted ? "YES" : "NO"}`);
  console.log(`\nSource Quality Summary:`);
  console.log(`- Total Source Rows: ${result.profile.totalSourceRows}`);
  console.log(`- Valid Rows: ${result.profile.validRows}`);
  console.log(`- Warning Rows: ${result.profile.warningRows}`);
  console.log(`- Invalid Rows: ${result.profile.invalidRows}`);
  console.log(`- Unique Product Names: ${result.profile.uniqueProductNames}`);
  console.log(`- Unique Categories: ${result.profile.uniqueCategories}`);
  console.log(`- Valid Wholesale Prices: ${result.profile.validWholesalePrices}`);
  console.log(`- Zero Prices: ${result.profile.zeroPrices}`);
  console.log(`- Ambiguous Packaging Rows: ${result.profile.ambiguousPackagingRows}`);

  console.log(`\nRecords Created / Proposed:`);
  console.log(`- Categories: ${result.createdCounts.categories}`);
  console.log(`- Products: ${result.createdCounts.products}`);
  console.log(`- Packaging Structures: ${result.createdCounts.packaging}`);
  console.log(`- Product Prices: ${result.createdCounts.prices}`);
  console.log(`- Source Mappings: ${result.createdCounts.sourceMappings}`);
  console.log(`- Import Issues Recorded: ${result.createdCounts.issues}`);
  console.log(`====================================================\n`);
}

main().catch((err) => {
  console.error("Import execution failed:", err);
  process.exit(1);
});
