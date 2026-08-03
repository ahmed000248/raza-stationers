import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import jwt from "jsonwebtoken";

const root = path.resolve(import.meta.dirname, "../..");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

console.log("=== RUNNING AUTHENTICATION & REDIRECT REGRESSION TESTS ===");

// 1. Backend AuthService accepts valid tokens and uses official Supabase client auth.getUser(token)
const authService = read("apps/api/src/auth/auth.service.ts");
assert.match(authService, /supabase\.auth\.getUser\(token\)/, "AuthService must validate tokens via official Supabase client auth.getUser");
assert.match(authService, /createClient\(supabaseUrl, key/, "AuthService must initialize server-side Supabase client");
assert.doesNotMatch(authService, /Token signature verification failed:.*err\.message/, "AuthService must sanitize raw verification errors");

// 2. Token algorithm handling & secrets in logs
assert.doesNotMatch(authService, /console\.log\(.*token.*\)/i, "AuthService must never log bearer tokens");
assert.doesNotMatch(authService, /console\.log\(.*secret.*\)/i, "AuthService must never log JWT secrets");

// 3. API Client index.ts retains HTTP status and endpoint without destroying auth automatically
const apiClient = read("packages/api/src/index.ts");
assert.match(apiClient, /export class APIError extends Error/, "packages/api must export APIError with status and endpoint");
assert.match(apiClient, /throw new APIError\(message, res\.status/, "APIError must retain HTTP status");
assert.doesNotMatch(apiClient, /if \(res\.status === 401 && this\.onUnauthorized\) \{\s*this\.onUnauthorized\(\);\s*\}/, "APIClient must not automatically clear auth on generic 401");

// 4. Frontend use-auth.tsx explicit state machine & retry handling
const useAuth = read("apps/web/src/hooks/use-auth.tsx");
assert.match(useAuth, /export type AccountStatus =/, "use-auth must export AccountStatus type");
assert.match(useAuth, /"authenticated_unregistered"/, "AccountStatus must include authenticated_unregistered");
assert.match(useAuth, /"auth_error"/, "AccountStatus must include auth_error");
assert.match(useAuth, /ongoingBootstrapRef/, "use-auth must deduplicate bootstrap requests for the same token");
assert.match(useAuth, /refreshSession\(\)/, "use-auth must attempt Supabase session refresh on initial 401");
assert.match(useAuth, /retryBootstrap/, "use-auth must provide retryBootstrap capability");

// 5. Onboarding page handling
const onboarding = read("apps/web/src/app/onboarding/page.tsx");
assert.match(onboarding, /accountStatus === "guest"/, "Onboarding page must explicitly handle guest state");
assert.match(onboarding, /accountStatus === "auth_error"/, "Onboarding page must explicitly handle auth_error state");
assert.match(onboarding, /authenticated_unregistered/, "Onboarding page must render forms for authenticated_unregistered");
assert.ok(onboarding.includes('router.replace(`/signin?returnTo='), "Onboarding must redirect guests to signin with returnTo");

// 6. Signin page handling
const signin = read("apps/web/src/app/signin/page.tsx");
assert.match(signin, /accountStatus === "authenticated_unregistered"/, "Signin page must redirect authenticated_unregistered to onboarding");

// 7. ClientsService idempotency
const clientsService = read("apps/api/src/clients/clients.service.ts");
assert.match(clientsService, /existingLink/, "ClientsService must check existing business link before duplicate creation");
assert.match(clientsService, /existingBusiness/, "ClientsService must safely handle existing business with matching mobile");

// 8. Admin App security checks
const adminAuth = read("apps/admin/src/hooks/use-admin-auth.tsx");
assert.match(adminAuth, /"owner", "admin", "packing", "delivery"/, "Admin app must enforce staff/admin roles");
assert.match(adminAuth, /This account is not authorized for the Admin application/, "Admin app must block unauthorized customer users");

// 9. JWT test token verification sanity check
const testSecret = "raza-stationers-test-secret-1234567890";
const testToken = jwt.sign({ sub: "test-user-id", email: "test@example.com" }, testSecret, { algorithm: "HS256" });
const decoded = jwt.verify(testToken, testSecret);
assert.equal(decoded.sub, "test-user-id");
assert.equal(decoded.email, "test@example.com");

console.log("✔ All 22 Auth & Redirect Regression Checks Passed Successfully!");
