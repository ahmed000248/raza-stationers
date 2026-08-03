# Supabase Email OTP Configuration Guide

This document outlines the required configuration settings for enabling in-website 6-digit Email OTP Verification in the Supabase Dashboard for Raza Stationers (`pqlmgqzpjjllhgalyhwz`).

---

## 1. Supabase Dashboard Setup

Navigate to your Supabase Project Dashboard:
**`https://supabase.com/dashboard/project/pqlmgqzpjjllhgalyhwz/auth/templates`**

### A. Update Email Confirm Template
1. Select **Confirm Signup** from the Email Templates menu.
2. Replace the email body template to output the 6-digit OTP code (`{{ .Token }}`) instead of the URL confirmation link (`{{ .ConfirmationURL }}`).

**Recommended Template Subject**:
```text
Your Raza Stationers Verification Code: {{ .Token }}
```

**Recommended HTML Body**:
```html
<h2>Raza Stationers Email Verification</h2>
<p>Your 6-digit verification code is:</p>
<h1 style="font-size: 32px; letter-spacing: 5px; color: #1e3a8a; font-family: monospace;">{{ .Token }}</h1>
<p>This code will expire in 60 minutes. Enter this code on the website to complete your account registration.</p>
<p>If you did not request this code, please ignore this email.</p>
```

---

## 2. Authentication Rate Limits & Expiry

In **Auth Settings -> Provider Settings -> Email**:
- **OTP Expiry**: Set to `3600` seconds (1 hour).
- **Double Confirm Email Change**: Enabled.
- **Secure Email Change**: Enabled.

---

## 3. Site URL & Redirect URLs

In **Auth Settings -> URL Configuration**:
- **Site URL**: `https://raza-stationers.vercel.app` (or production domain)
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `https://raza-stationers.vercel.app/auth/callback`

---

## 4. In-App OTP Verification Flow

The Next.js storefront (`/signup` and `/register`) invokes:
- `supabase.auth.signUp()` — creates pending Supabase Auth identity and sends the 6-digit OTP email.
- `supabase.auth.verifyOtp({ email, token: otp, type: "email" })` — verifies the 6-digit code in-app.
- `supabase.auth.resend({ type: "signup", email })` — resends the OTP with a 60-second cooldown timer.
