import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

async function verifyC08MobileIsolation() {
  console.log("=== RUNNING C-08 MOBILE PROTOTYPE ISOLATION & CONTRACT VERIFICATION ===");

  const apiFilePath = path.resolve(process.cwd(), "apps/mobile/src/lib/api.ts");
  const apiContent = fs.readFileSync(apiFilePath, "utf8");

  // 1. Verify VITE_API_URL is used in Vite mobile code
  assert.ok(apiContent.includes("import.meta.env.VITE_API_URL"), "Mobile api.ts must use import.meta.env.VITE_API_URL.");
  assert.ok(!apiContent.includes("process.env.EXPO_PUBLIC_API_URL"), "Mobile api.ts must not use EXPO_PUBLIC_API_URL in browser code.");
  assert.ok(!apiContent.includes("process.env.NEXT_PUBLIC_API_URL"), "Mobile api.ts must not use NEXT_PUBLIC_API_URL in browser code.");
  console.log("✔ Test 1 Passed: Mobile Vite client environment variable resolution corrected.");

  console.log("=== ALL C-08 MOBILE ISOLATION CHECKS PASSED SUCCESSFULLY ===");
}

verifyC08MobileIsolation().catch((err) => {
  console.error("C-08 verification failed:", err);
  process.exit(1);
});
