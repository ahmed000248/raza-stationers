import "dotenv/config";

async function testSignIn() {
  const apiUrl = "https://raza-stationers-api-staging.onrender.com/auth/api/sign-in/email";
  console.log("Testing sign-in against:", apiUrl);

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "http://localhost:3001"
    },
    body: JSON.stringify({
      email: "ahmedraa0007@gmail.com",
      password: "@hmed.raza6246667",
    }),
  });

  console.log("Status:", res.status);
  const data = await res.json().catch(() => null);
  console.log("Response data:", JSON.stringify(data, null, 2));

  const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie")];
  console.log("Set-Cookie headers:", cookies);

  if (res.ok) {
    console.log("SUCCESS! Account ahmedraa0007@gmail.com signed in successfully!");
  } else {
    console.error("FAIL! Sign in failed.");
  }
}

testSignIn().catch(console.error);
