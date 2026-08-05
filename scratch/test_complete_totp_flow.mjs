import "dotenv/config";
import pg from "pg";

async function testCookies() {
  const apiBase = "https://raza-stationers-api-staging.onrender.com";

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
  console.log("All Set-Cookie headers:", allCookies);

  const cookieHeader = allCookies.map(c => c.split(";")[0]).join("; ");
  console.log("Formatted Cookie Header for next request:", cookieHeader);
}

testCookies().catch(console.error);
