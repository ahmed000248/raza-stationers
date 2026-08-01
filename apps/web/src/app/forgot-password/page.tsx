"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }
    setError("")
    setLoading(true)
    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-12 px-6 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/signin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Sign In</span>
        </Link>

        <div className="p-8 rounded-3xl border border-border bg-card shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[var(--color-evergreen-600)] text-white shadow-xs mb-2">
              <Mail className="size-7" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-[var(--color-ink-900)]">
              Forgot Password
            </h1>
            <p className="text-xs text-muted-foreground">
              Recover your customer portal access
            </p>
          </div>

          {success ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
              <CheckCircle2 className="size-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-emerald-800">Reset Email Sent</p>
              <p className="text-xs text-muted-foreground">
                We sent a password reset link to <strong className="text-foreground">{email}</strong>. Please check your email to update your password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@alkarampaper.com"
                  className={error ? "border-destructive" : ""}
                />
              </div>

              {error && <p className="text-xs text-destructive font-medium">{error}</p>}

              <Button type="submit" size="lg" className="w-full rounded-full gap-2 font-semibold shadow-md" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
                <Bilingual en={loading ? "Sending..." : "Send Password Reset Link"} ur="پاس ورڈ دوبارہ ترتیب دینے کا لنک بھیجیں" layout="inline" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
