const PRODUCTION_PROJECT_REF = "pqlmgqzpjjllhgalyhwz";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

for (const name of ["DATABASE_URL", "DIRECT_URL", "TEST_DATABASE_URL", "TEST_DIRECT_URL"]) {
  if (process.env[name]?.includes(PRODUCTION_PROJECT_REF)) {
    throw new Error(`Integration tests refuse ${name} because it references the production project.`);
  }
}

function requireLocalUrl(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required and must be created by the disposable test runner.`);
  const url = new URL(value);
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !LOCAL_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error(`${name} must target an exact localhost PostgreSQL hostname.`);
  }
  if (!url.pathname.slice(1).startsWith("raza_test_db_")) {
    throw new Error(`${name} must target a uniquely named raza_test_db_ database.`);
  }
  return value;
}

export const TEST_DATABASE_URL = requireLocalUrl("TEST_DATABASE_URL");
export const TEST_DIRECT_URL = requireLocalUrl("TEST_DIRECT_URL");
export const TEST_JWT_SECRET = process.env.TEST_JWT_SECRET || "raza-stationers-local-test-secret-32-bytes";

const apiValue = process.env.TEST_API_URL?.trim();
if (!apiValue) throw new Error("TEST_API_URL is required and must be created by the disposable test runner.");
const apiUrl = new URL(apiValue);
if (apiUrl.protocol !== "http:" || !LOCAL_HOSTS.has(apiUrl.hostname.toLowerCase())) {
  throw new Error("TEST_API_URL must target an exact localhost HTTP origin.");
}
export const TEST_API_URL = apiUrl.origin;
