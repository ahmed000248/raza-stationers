"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Loader2, LockKeyhole, Mail } from "lucide-react"
import { BrandLogo } from "@/components/site/BrandLogo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"

function safeReturnTo(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/catalogue"
}

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = safeReturnTo(searchParams.get("returnTo"))
  const { accountStatus, login, loginWithGoogle } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState<"password" | "google" | null>(null)

  React.useEffect(() => {
    if (accountStatus !== "guest" && accountStatus !== "unregistered") router.replace(returnTo)
  }, [accountStatus, returnTo, router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !email.includes("@")) return setError("Enter a valid email address.")
    if (!password) return setError("Enter your password.")
    setError("")
    setLoading("password")
    try {
      await login(email.trim(), password)
      router.replace(returnTo)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const handleGoogle = async () => {
    setError("")
    setLoading("google")
    try {
      await loginWithGoogle(returnTo)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in failed.")
      setLoading(null)
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl grid-cols-1 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:py-10">
      <section className="relative hidden overflow-hidden rounded-[2rem] bg-[var(--color-ink-900)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-[var(--color-evergreen-600)]/45 blur-3xl" />
        <BrandLogo inverse />
        <div className="relative max-w-md space-y-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-sage-400)]">Business stationery, simplified</p>
          <h1 className="font-heading text-4xl font-bold leading-tight">Your catalogue, orders and wholesale account in one secure place.</h1>
          <ul className="space-y-3 text-sm text-white/75">
            {["Browse verified packaging and prices", "Resume checkout after signing in", "Track every submitted order"].map((item) => (
              <li key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[var(--color-sage-400)]" />{item}</li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/55">Protected by Supabase authentication and secure server-side session cookies.</p>
      </section>

      <section className="flex items-center justify-center py-6 sm:py-10">
        <div className="w-full max-w-md space-y-7">
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"><ArrowLeft className="size-4" />Back to storefront</Link>
          <div className="lg:hidden"><BrandLogo /></div>
          <header className="space-y-2">
            <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[var(--color-mist-100)] text-[var(--color-evergreen-600)]"><LockKeyhole className="size-5" /></div>
            <h2 className="font-heading text-3xl font-bold text-[var(--color-ink-900)]">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in with the email used for your Raza Stationers account.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="signin-email" className="text-xs font-semibold">Email address</label>
              <Input id="signin-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@business.com" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between"><label htmlFor="signin-password" className="text-xs font-semibold">Password</label><Link href="/forgot-password" className="text-xs font-semibold text-[var(--color-evergreen-600)] hover:underline">Forgot password?</Link></div>
              <Input id="signin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="w-full rounded-xl" disabled={loading !== null}>
              {loading === "password" ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
              {loading === "password" ? "Signing in…" : "Sign in with email"}
            </Button>
          </form>

          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <Button type="button" variant="outline" size="lg" className="w-full rounded-xl" onClick={handleGoogle} disabled={loading !== null}>
            {loading === "google" ? <Loader2 className="size-4 animate-spin" /> : <span aria-hidden className="text-base font-bold text-[#4285F4]">G</span>}
            {loading === "google" ? "Connecting…" : "Continue with Google"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">New business customer? <Link href={`/register?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-[var(--color-evergreen-600)] hover:underline">Create an account</Link></p>
        </div>
      </section>
    </div>
  )
}
