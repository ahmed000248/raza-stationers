import "dotenv/config";

async function testAdminApiCallsWithOrigin() {
  const apiBase = "https://raza-stationers-api-staging.onrender.com";

  console.log("1. Signing in as owner with Origin header...");
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

  console.log("Sign-in status:", signInRes.status);
  const setCookie = signInRes.headers.get("set-cookie");
  console.log("Set-Cookie header:", setCookie ? "PRESENT" : "MISSING");
  if (setCookie) console.log("Set-Cookie raw:", setCookie);

  if (signInRes.ok) {
    const signInBody = await signInRes.json();
    console.log("Sign-in body:", signInBody);
  } else {
    console.log("Sign-in error body:", await signInRes.text());
    return;
  }

  const cookieHeader = setCookie?.split(";")[0] || "";

  console.log("\n2. Testing GET /clients with cookie & origin...");
  const clientsRes = await fetch(`${apiBase}/clients`, {
    headers: {
      "Cookie": cookieHeader,
      "Origin": "https://raza-stationers-admin-seven.vercel.app"
    }
  });
  console.log("GET /clients status:", clientsRes.status);
  if (clientsRes.ok) {
    const clientsData = await clientsRes.json();
    console.log("Clients response:", clientsData);
  } else {
    console.log("GET /clients error:", await clientsRes.text());
  }

  console.log("\n3. Testing GET /admin/products with cookie & origin...");
  const productsRes = await fetch(`${apiBase}/admin/products?limit=200`, {
    headers: {
      "Cookie": cookieHeader,
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

testAdminApiCallsWithOrigin().catch(console.error);
