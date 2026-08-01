"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { ShieldCheck, Lock, Loader2, CheckCircle2 } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { updatePassword } = useAuth()
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setError("")
    setLoading(true)
    try {
      await updatePassword(password)
      setSuccess(true)
      setTimeout(() => {
        router.push("/signin")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Link may be expired.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-12 px-6 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="p-8 rounded-3xl border border-border bg-card shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[var(--color-evergreen-600)] text-white shadow-xs mb-2">
              <Lock className="size-7" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-[var(--color-ink-900)]">
              Reset Your Password
            </h1>
            <p className="text-xs text-muted-foreground">
              Enter your new secure account password
            </p>
          </div>

          {success ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
              <CheckCircle2 className="size-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-emerald-800">Password Reset Successful</p>
              <p className="text-xs text-muted-foreground">
                Your password has been updated successfully. Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">New Password *</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={error ? "border-destructive" : ""}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Confirm New Password *</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={error ? "border-destructive" : ""}
                />
              </div>

              {error && <p className="text-xs text-destructive font-medium">{error}</p>}

              <Button type="submit" size="lg" className="w-full rounded-full gap-2 font-semibold shadow-md" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                <Bilingual en={loading ? "Updating..." : "Update Password"} ur="پاس ورڈ اپ ڈیٹ کریں" layout="inline" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
