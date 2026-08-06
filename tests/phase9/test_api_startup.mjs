import { spawn } from "child_process";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(__dirname, "../../apps/api");

async function checkHealth(url, maxAttempts = 50, delayMs = 200) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get(url, (response) => {
          let data = "";
          response.on("data", (chunk) => (data += chunk));
          response.on("end", () => resolve({ statusCode: response.statusCode, data }));
        });
        req.on("error", reject);
        req.setTimeout(500, () => {
          req.destroy();
          reject(new Error("Timeout"));
        });
      });
      if (res.statusCode === 200) {
        return JSON.parse(res.data);
      }
    } catch {
      // Retry
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(`API health check failed at ${url} after ${maxAttempts} attempts.`);
}

async function runStartupSmokeTest() {
  console.log("=== RUNNING C-01 API STARTUP SMOKE TEST ===");

  // Test 1: Normal startup with valid JWT_SECRET
  console.log("Test 1: Starting compiled API with valid configuration...");
  const port = 4095;
  const env1 = {
    ...process.env,
    PORT: String(port),
    JWT_SECRET: "test-jwt-secret-for-smoke-test-12345",
    NODE_ENV: "development",
  };

  const child1 = spawn("node", ["dist/main.js"], {
    cwd: apiDir,
    env: env1,
    stdio: ["pipe", "pipe", "pipe"],
  });

  let child1Output = "";
  child1.stdout.on("data", (data) => (child1Output += data.toString()));
  child1.stderr.on("data", (data) => (child1Output += data.toString()));

  let child1ExitedEarly = false;
  child1.on("exit", (code) => {
    if (code !== null && code !== 0) {
      child1ExitedEarly = true;
    }
  });

  try {
    const health = await checkHealth(`http://127.0.0.1:${port}/`, 40, 250);
    if (health.status !== "ok") {
      throw new Error(`Health status was not 'ok': ${JSON.stringify(health)}`);
    }
    console.log("✔ Test 1 Passed: API started and health endpoint returned 200 OK.");
  } finally {
    child1.kill("SIGKILL");
  }

  // Test 2: Production startup with missing JWT_SECRET should fail clearly
  console.log("Test 2: Verifying startup failure when JWT_SECRET is missing in production...");
  const env2 = {
    ...process.env,
    NODE_ENV: "production",
    BETTER_AUTH_URL: "https://raza-stationers-api-staging.onrender.com",
    BETTER_AUTH_SECRET: "test-better-auth-secret-1234567890",
    JWT_SECRET: "",
  };

  const child2 = spawn("node", ["dist/main.js"], {
    cwd: apiDir,
    env: env2,
    stdio: ["pipe", "pipe", "pipe"],
  });

  let child2Output = "";
  child2.stdout.on("data", (data) => (child2Output += data.toString()));
  child2.stderr.on("data", (data) => (child2Output += data.toString()));

  const exitCode2 = await new Promise((resolve) => {
    child2.on("exit", (code) => resolve(code));
  });

  if (exitCode2 !== 0 && child2Output.includes("JWT_SECRET")) {
    console.log("✔ Test 2 Passed: Missing JWT_SECRET in production produced a clear startup error.");
  } else {
    console.error("Child 2 output:", child2Output);
    throw new Error(`Test 2 Failed: Expected startup failure with missing JWT_SECRET, got exit code ${exitCode2}`);
  }

  console.log("=== ALL API STARTUP SMOKE TESTS PASSED SUCCESSFULLY ===");
}

runStartupSmokeTest().catch((err) => {
  console.error("API Startup Smoke Test Failed:", err);
  process.exit(1);
});
