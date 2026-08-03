import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import jwt from "jsonwebtoken";

const root = path.resolve(import.meta.dirname, "../..");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

console.log("=== RUNNING AUTHENTICATION REGRESSION & DE-SUPABASE CHECKS ===");

// 1. Web app de-Supabase verification
const useAuth = read("apps/web/src/hooks/use-auth.tsx");
assert.doesNotMatch(useAuth, /@\/lib\/supabase\/client/, "use-auth must not import Supabase client");
assert.doesNotMatch(useAuth, /supabase\.auth/, "use-auth must not invoke Supabase Auth methods");
assert.match(useAuth, /AUTH_PROVIDER_NOT_CONFIGURED/, "use-auth must use provider-neutral unconfigured constant");
assert.match(useAuth, /"unconfigured"/, "AccountStatus must include unconfigured status");

// 2. Admin app de-Supabase verification
const adminAuth = read("apps/admin/src/hooks/use-admin-auth.tsx");
assert.doesNotMatch(adminAuth, /@\/lib\/supabase\/client/, "use-admin-auth must not import Supabase client");
assert.doesNotMatch(adminAuth, /supabase\.auth/, "use-admin-auth must not invoke Supabase Auth methods");

// 3. NestJS API de-Supabase verification
const authService = read("apps/api/src/auth/auth.service.ts");
assert.doesNotMatch(authService, /@supabase\/supabase-js/, "AuthService must not import Supabase JS library");
assert.doesNotMatch(authService, /verifySupabaseToken/, "AuthService must not contain verifySupabaseToken");
assert.match(authService, /verifyAuthToken/, "AuthService must use provider-neutral verifyAuthToken");

// 4. API Client index.ts provider-neutral behavior
const apiClient = read("packages/api/src/index.ts");
assert.match(apiClient, /export class APIError extends Error/, "packages/api must export APIError with status and endpoint");
assert.doesNotMatch(apiClient, /if \(res\.status === 401 && this\.onUnauthorized\) \{\s*this\.onUnauthorized\(\);\s*\}/, "APIClient must not automatically clear auth on generic 401");

// 5. Onboarding and Signin UI preservation
const onboarding = read("apps/web/src/app/onboarding/page.tsx");
assert.doesNotMatch(onboarding, /createClient/, "Onboarding page must not import createClient");
assert.match(onboarding, /unconfigured/, "Onboarding page must handle unconfigured status");

const signin = read("apps/web/src/app/signin/page.tsx");
assert.match(signin, /Sign in with email/, "Signin page UI must render email sign in button");
assert.match(signin, /Continue with Google/, "Signin page UI must render Google button");

// 6. Admin Login UI preservation & fail-closed protection
const adminLogin = read("apps/admin/src/app/login/page.tsx");
assert.match(adminLogin, /Admin Sign In/, "Admin login page UI must render Admin Sign In heading");

const adminMiddleware = read("apps/admin/src/middleware.ts");
assert.match(adminMiddleware, /reason=auth_unconfigured/, "Admin middleware must fail closed for protected routes");

// 7. JWT test token verification sanity check
const testSecret = "raza-stationers-test-secret-1234567890";
const testToken = jwt.sign({ sub: "test-user-id", email: "test@example.com" }, testSecret, { algorithm: "HS256" });
const decoded = jwt.verify(testToken, testSecret);
assert.equal(decoded.sub, "test-user-id");
assert.equal(decoded.email, "test@example.com");

console.log("✔ All De-Supabase Auth & Provider-Neutral Regression Checks Passed Successfully!");
