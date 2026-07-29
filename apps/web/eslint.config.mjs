import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Critical correctness rules (Enforced as errors)
      "react-hooks/rules-of-hooks": "error",
      "react/no-unescaped-entities": "error",

      // Code quality & performance rules (Categorized as warnings for Phase 1 baseline)
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  globalIgnores([
    // Exclude build outputs & third-party vendored library output
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/lib/gsap/**",
  ]),
]);

export default eslintConfig;
