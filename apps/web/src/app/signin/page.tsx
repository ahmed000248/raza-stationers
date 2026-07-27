"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { LogIn, ArrowLeft, Sparkles, ShieldCheck, Clock, UserX } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const { accountStatus, login, logout } = useAuth()
  const [mobileNumber, setMobileNumber] = React.useState("03001234567")
  const [password, setPassword] = React.useState("test123")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mobileNumber || mobileNumber.length < 10) {
      setError("Please enter a valid mobile number")
      return
    }
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters")
      return
    }
    setError("")
    setLoading(true)
    try {
      await login(mobileNumber, password)
      router.push("/catalogue")
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.")
    } finally {
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
                <button type="button" onClick={() => { setMobileNumber("03001234567"); setPassword("test123"); }}
                  className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${accountStatus === "pending" ? "bg-amber-600 text-white border-amber-600" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                  <Clock className="size-3.5" /><span>Pending</span>
                </button>
                <button type="button" onClick={() => { setMobileNumber("03001234567"); setPassword("test123"); }}
                  className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${accountStatus === "approved" ? "bg-[var(--color-evergreen-600)] text-white border-[var(--color-evergreen-600)]" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                  <ShieldCheck className="size-3.5" /><span>Approved</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Mobile Number *</label>
              <Input
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="03001234567"
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

          <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground space-y-1">
            <p>New wholesale shop owner?</p>
            <Link href="/register" className="font-bold text-[var(--color-evergreen-600)] hover:underline block">
              Register Wholesale Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
