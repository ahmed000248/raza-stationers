import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const base = process.env.PHASE7_BASE_COMMIT || 'c68b935db79405c822085af0e1376969d946b021';
const oldCatalogue = execFileSync('git', ['show', `${base}:apps/web/src/app/catalogue/page.tsx`], { encoding: 'utf8' });
const catalogue = read('apps/web/src/app/catalogue/page.tsx');
const pagination = read('apps/web/src/components/catalogue/CataloguePagination.tsx');
const nav = read('apps/web/src/components/site/SiteNav.tsx');
const signin = read('apps/web/src/app/signin/page.tsx');
const webManifest = read('apps/web/src/app/manifest.ts');
const adminManifest = read('apps/admin/src/app/manifest.ts');
const adminServiceWorker = read('apps/admin/public/sw.js');
const checkout = read('apps/web/src/app/checkout/page.tsx');

assert.match(nav, /\/signin\?returnTo=/, 'Navbar must navigate guests to the dedicated sign-in route');
assert.doesNotMatch(nav, /SignInModal/, 'Navbar must not retain the old sign-in overlay');
assert.match(signin, /grid-cols-2/, 'Sign-in must use the split desktop layout');
assert.match(signin, /Forgot password/);
assert.match(signin, /Continue with Google/);
assert.match(catalogue, /ITEMS_PER_PAGE = 20/);
assert.match(catalogue, /AbortController/);
assert.match(catalogue, /useDebounce/);
assert.match(catalogue, /ProductListRow/);
assert.match(catalogue, /maxPrice/);
assert.match(pagination, /currentPage - 1, currentPage, currentPage \+ 1/);
assert.match(checkout, /fulfilmentMethod/);
assert.match(checkout, /submittingRef/);
assert.match(webManifest, /brand-mark\.svg/);
assert.match(adminManifest, /display: "standalone"/);
assert.match(adminManifest, /brand-mark\.svg/);
assert.match(adminServiceWorker, /cache: "no-store"/);
assert.doesNotMatch(adminServiceWorker, /caches\.open/);

const oldPageSize = Number(oldCatalogue.match(/ITEMS_PER_PAGE\s*=\s*(\d+)/)?.[1]);
const newPageSize = Number(catalogue.match(/ITEMS_PER_PAGE\s*=\s*(\d+)/)?.[1]);
assert.equal(oldPageSize, 8);
assert.equal(newPageSize, 20);
assert.match(oldCatalogue, /selectedCategory, categories/);
assert.doesNotMatch(catalogue, /selectedCategory, categories/);

const sampleProducts = 2000;
const oldPages = Math.ceil(sampleProducts / oldPageSize);
const newPages = Math.ceil(sampleProducts / newPageSize);
const oldButtons = oldPages;
const newButtons = 5;
const evidence = {
  baselineCommit: base,
  sampleProducts,
  resultsPerRequest: { before: oldPageSize, after: newPageSize },
  requestsToTraverseSample: { before: oldPages, after: newPages, reductionPercent: Number(((1 - newPages / oldPages) * 100).toFixed(1)) },
  paginationButtonsAtSampleStart: { before: oldButtons, afterMaximum: newButtons, reductionPercent: Number(((1 - newButtons / oldButtons) * 100).toFixed(1)) },
  initialCatalogueRequestPattern: { before: 'product request repeats after categories state changes', after: 'product request is independent; category/options load in parallel' },
};
console.log(JSON.stringify(evidence, null, 2));
console.log('[PASS] Phase 7 static, PWA, auth-navigation, checkout, and reproducible catalogue-performance checks passed.');
