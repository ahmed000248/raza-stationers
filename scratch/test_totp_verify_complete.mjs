import "dotenv/config";
import pg from "pg";
import { symmetricDecrypt } from "better-auth/crypto";
import { createOTP } from "@better-auth/utils/otp";

async function runCompleteFlow() {
  const apiBase = "http://localhost:4000";

  console.log("1. Signing in as owner...");
  const signInRes = await fetch(`${apiBase}/auth/api/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "https://raza-stationers-admin-seven.vercel.app"
    },
    body: JSON.stringify({
      email: "ahmedraa0007@gmail.com",
      password: "@hmed.raza6246667"
    })
  });

  const allCookies = signInRes.headers.getSetCookie();
  const cookieHeader = allCookies.map(c => c.split(";")[0]).join("; ");
  console.log("2FA Cookie Header:", cookieHeader);

  // Decrypt two_factor secret from DB
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const dbRes = await client.query("SELECT secret FROM public.two_factor WHERE user_id = '0060b8cd-14dc-4140-862d-6eac1f86f609'");
  const encryptedSecret = dbRes.rows[0].secret;
  await client.end();

  const secretKey = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET;
  const decryptedSecret = await symmetricDecrypt({
    key: secretKey,
    data: encryptedSecret
  });

  console.log("Decrypted TOTP Secret:", decryptedSecret);

  // Generate 6-digit TOTP
  const otp = createOTP(decryptedSecret, { period: 30, digits: 6 });
  const code = await otp.totp();
  console.log("Generated live TOTP code:", code);

  console.log("\n2. Calling /two-factor/verify-totp...");
  const verifyRes = await fetch(`${apiBase}/auth/api/two-factor/verify-totp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "https://raza-stationers-admin-seven.vercel.app",
      "Cookie": cookieHeader
    },
    body: JSON.stringify({ code })
  });

  console.log("Verify Status:", verifyRes.status);
  const verifyCookies = verifyRes.headers.getSetCookie();
  console.log("Verify Set-Cookie:", verifyCookies);

  const sessionCookieHeader = verifyCookies.map(c => c.split(";")[0]).join("; ");

  console.log("\n3. Testing GET /clients with real session cookie...");
  const clientsRes = await fetch(`${apiBase}/clients`, {
    headers: {
      "Cookie": sessionCookieHeader,
      "Origin": "https://raza-stationers-admin-seven.vercel.app"
    }
  });
  console.log("GET /clients status:", clientsRes.status);
  if (clientsRes.ok) {
    const clientsData = await clientsRes.json();
    console.log("Clients response count:", clientsData.items?.length ?? clientsData.length);
  } else {
    console.log("GET /clients error:", await clientsRes.text());
  }

  console.log("\n4. Testing GET /admin/products with real session cookie...");
  const productsRes = await fetch(`${apiBase}/admin/products?limit=200`, {
    headers: {
      "Cookie": sessionCookieHeader,
      "Origin": "https://raza-stationers-admin-seven.vercel.app"
    }
  });
  console.log("GET /admin/products status:", productsRes.status);
  if (productsRes.ok) {
    const productsData = await productsRes.json();
    console.log("Products response count:", productsData.items?.length ?? productsData.length);
  } else {
    console.log("GET /admin/products error:", await productsRes.text());
  }
}

runCompleteFlow().catch(console.error);
