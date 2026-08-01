"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { LogIn, ArrowLeft, Sparkles, ShieldCheck, Clock, UserX } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo")
  const { accountStatus, login, logout, loginWithGoogle } = useAuth()
  const [email, setEmail] = React.useState("contact@alkarampaper.com")
  const [password, setPassword] = React.useState("test123")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters")
      return
    }
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      router.push(returnTo || "/catalogue")
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)
    try {
      await loginWithGoogle()
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed")
      setLoading(false)
    }
  }

  return (
    <div className="py-12 px-6 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Home</span>
        </Link>

        <div className="p-8 rounded-3xl border border-border bg-card shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[var(--color-evergreen-600)] text-white shadow-xs mb-2">
              <LogIn className="size-7" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-[var(--color-ink-900)]">
              Customer Sign In
            </h1>
            <p className="text-xs text-muted-foreground">
              FR-AUTH-01 Customer Authentication
            </p>
          </div>

          {process.env.NODE_ENV !== "production" && (
            <div className="p-3.5 rounded-2xl bg-muted/60 border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5 text-[var(--color-ink-900)]">
                  <Sparkles className="size-3.5 text-[var(--color-evergreen-600)]" />
                  <span>Dev Quick Switch</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button type="button" onClick={() => { logout(); router.push("/catalogue"); }}
                  className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${accountStatus === "guest" ? "bg-[var(--color-ink-900)] text-white border-[var(--color-ink-900)]" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                  <UserX className="size-3.5" /><span>Guest</span>
                </button>
                <button type="button" onClick={() => { setEmail("contact@alkarampaper.com"); setPassword("test123"); }}
                  className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${accountStatus === "pending" ? "bg-amber-600 text-white border-amber-600" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                  <Clock className="size-3.5" /><span>Pending</span>
                </button>
                <button type="button" onClick={() => { setEmail("contact@alkarampaper.com"); setPassword("test123"); }}
                  className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${accountStatus === "approved" ? "bg-[var(--color-evergreen-600)] text-white border-[var(--color-evergreen-600)]" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                  <ShieldCheck className="size-3.5" /><span>Approved</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address *</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@alkarampaper.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Password *</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-destructive font-medium">{error}</p>}

            <Button type="submit" size="lg" className="w-full rounded-full gap-2 font-semibold" disabled={loading}>
              <LogIn className="size-4" />
              <Bilingual en={loading ? "Signing In..." : "Sign In to Account"} ur="اکاؤنٹ میں سائن ان کریں" layout="inline" />
            </Button>
          </form>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <span className="relative bg-card px-3 text-[10px] text-muted-foreground uppercase">Or continue with</span>
          </div>

          <Button type="button" variant="outline" size="lg" onClick={handleGoogleSignIn} className="w-full rounded-full gap-2 font-semibold" disabled={loading}>
            <svg className="size-4 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.29c1.92,-1.78 3.02,-4.4 3.02,-7.4C21.65,11.77 21.54,11.41 21.35,11.1z" fill="#4285F4" />
                <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.29,-2.6c-0.91,0.61 -2.08,0.98 -3.67,0.98 -2.33,0 -4.3,-1.57 -5.01,-3.68H2.58v2.7C4.07,18.77 7.78,20.6 12,20.6z" fill="#34A853" />
                <path d="M6.99,13.1c-0.18,-0.55 -0.29,-1.13 -0.29,-1.73s0.11,-1.18 0.29,-1.73V6.94H2.58C1.94,8.22 1.57,9.67 1.57,11.2s0.37,2.98 1.01,4.26L6.99,13.1z" fill="#FBBC05" />
                <path d="M12,5.82c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,3.15 14.42,2.3 12,2.3c-4.22,0 -7.93,1.83 -9.42,4.64l4.41,3.42C7.7,8.25 9.67,5.82 12,5.82z" fill="#EA4335" />
              </g>
            </svg>
            <span>Sign in with Google</span>
          </Button>

          <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground space-y-1">
            <p>New wholesale shop owner?</p>
            <Link href={returnTo ? `/register?returnTo=${encodeURIComponent(returnTo)}` : "/register"} className="font-bold text-[var(--color-evergreen-600)] hover:underline block">
              Register Wholesale Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
