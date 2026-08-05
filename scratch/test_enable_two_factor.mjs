import "dotenv/config";

async function testEnableTwoFactorLocal() {
  const origin = "http://localhost:3001";
  const signInUrl = "http://localhost:4000/auth/api/sign-in/email";

  // 1. Sign in
  const signInRes = await fetch(signInUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": origin
    },
    body: JSON.stringify({
      email: "ahmedraa0007@gmail.com",
      password: "@hmed.raza6246667"
    })
  });

  const cookies = signInRes.headers.getSetCookie ? signInRes.headers.getSetCookie() : [signInRes.headers.get("set-cookie")];
  const cookieHeader = cookies.map(c => c.split(";")[0]).join("; ");
  console.log("Signed in locally. Cookie:", cookieHeader);

  // 2. Call enable two-factor with password
  const enableUrl = "http://localhost:4000/auth/api/two-factor/enable";
  console.log("Calling enable two-factor locally at:", enableUrl);

  const enableRes = await fetch(enableUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": origin,
      "Cookie": cookieHeader
    },
    body: JSON.stringify({
      password: "@hmed.raza6246667"
    })
  });

  console.log("Enable status:", enableRes.status);
  const enableText = await enableRes.text();
  console.log("Enable response body:", enableText);
}

testEnableTwoFactorLocal().catch(console.error);
