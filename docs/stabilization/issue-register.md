# Issue Register — Phase 0 Stabilization Inventory

**Phase**: Phase 0 Baseline  
**Status**: All Findings Logged for Future Resolution (Inspection Only — No Code Modifications Applied)  

---

## 1. Defect & Risk Classification Ledger

| Issue ID | Severity | Area | Description | Evidence | Affected File / Route / Endpoint | Security / Data / Financial Impact | Recommended Phase | Status | Verification Needed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ISSUE-01** | **P0** | Importer | Current CLI importer is incompatible with approved master catalogue spreadsheet structure | `packages/db/src/importer/cli.ts` expects legacy CSV `catalogue-products.csv`, whereas approved catalogue is multi-sheet `Raza-Stationers-Final-Supabase-Catalogue.xlsx` | `packages/db/src/importer/cli.ts` | Data Integrity Risk: Running current importer against new catalogue will fail or corrupt SKU mapping | Phase 3 | Open | Dry-run validation script against `Raza-Stationers-Final-Supabase-Catalogue.xlsx` |
| **ISSUE-02** | **P0** | Security | Fallback JWT secret string embedded in authentication code | `apps/api/src/auth/auth.module.ts:12` & `jwt.strategy.ts:18` use `"raza-stationers-jwt-secret-dev"` if `JWT_SECRET` is unset | `apps/api/src/auth/*` | Security Risk: Token forgery vulnerability if production env variable `JWT_SECRET` is missing | Phase 1 | Open | Mandate `JWT_SECRET` presence and throw startup error if missing in prod |
| **ISSUE-03** | **P1** | Security / Auth | Auth tokens stored in browser `localStorage` | `apps/admin/src/hooks/use-admin-auth.tsx` & `apps/web/src/hooks/use-auth.tsx` read/write token to `localStorage` | `apps/admin`, `apps/web` | Security Risk: Vulnerable to XSS token theft compared to httpOnly cookies | Phase 1 | Open | Refactor auth flow to use httpOnly secure session cookies |
| **ISSUE-04** | **P1** | Admin UI | ESLint failures in admin panel build | `npm run lint` reported 74 problems (49 errors, 25 warnings) in `@raza-stationers/admin` | `apps/admin/src/*` | Quality & Maintainability: Linting fails in CI/CD pipeline | Phase 1 | Open | Clean up un-used variables, missing dependencies, and type safety |
| **ISSUE-05** | **P1** | Web UI | ESLint failures in storefront build | `npm run lint` reported 3,232 problems (145 errors, 3087 warnings) in `@raza-stationers/web` | `apps/web/src/*` | Quality & Maintainability: Linting fails in CI/CD pipeline | Phase 1 | Open | Fix React hook dependencies and type casting |
| **ISSUE-06** | **P2** | Testing | Lack of unit test script in workspace `package.json` | `package.json` files in monorepo lack standard `npm test` script targets | Root & Package `package.json` | Maintainability Risk: Automated regression testing cannot be invoked via `npm test` | Phase 1 | OPEN / DEFERRED | Add test scripts pointing to Jest/Vitest runner |
| **ISSUE-07** | **P2** | Admin UI | Admin product edit modal falls back to mock categories if API fails | `apps/admin/src/components/catalogue/BulkImportModal.tsx` imports `MOCK_CATEGORIES` | `apps/admin/src/components/catalogue/*` | User Experience: Inconsistent fallback data displayed if network drops | Phase 2 | Open | Display explicit API error state instead of silent mock fallback |
| **ISSUE-08** | **P2** | Web UI | Cart state persisted only in browser `localStorage` | `apps/web/src/app/cart/page.tsx` uses local state without database sync for logged-in users | `apps/web/src/app/cart/*` | Feature Limitation: B2B customers cannot preserve cart across multiple devices | Phase 2 | Open | Implement backend cart sync endpoint for authenticated users |
| **ISSUE-09** | **P3** | Web UI | Product image placeholders rely on fallback UI avatars | `apps/web/src/components/catalogue/ProductCard.tsx` uses placeholder svg if image missing | `apps/web/src/components/catalogue/*` | Cosmetic: Standard stationery fallback illustration needed | Phase 2 | Open | Provide branded product category placeholder icons |
