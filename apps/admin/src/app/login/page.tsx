"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { LogIn, Shield, KeyRound } from "lucide-react"
import Image from "next/image"

type Step = "credentials" | "mfa-challenge"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, verifyMfa } = useAdminAuth()

  const [step, setStep] = React.useState<Step>("credentials")
  const [identifier, setIdentifier] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [mfaCode, setMfaCode] = React.useState("")
  const [factorId, setFactorId] = React.useState("")
  const [challengeId, setChallengeId] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const destination = React.useCallback(() => {
    const candidate = new URLSearchParams(window.location.search).get("next")
    return candidate?.startsWith("/") && !candidate.startsWith("//") ? candidate : "/dashboard"
  }, [])

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = identifier.trim()
    if (!trimmed) {
      setError("Please enter your email or mobile number")
      return
    }
    if (!password) {
      setError("Please enter your password")
      return
    }
    setLoading(true)
    setError("")
    try {
      const result = await login(trimmed, password)
      if (result.requiresMfa && result.factorId && result.challengeId) {
        setFactorId(result.factorId)
        setChallengeId(result.challengeId)
        setStep("mfa-challenge")
      } else {
        router.push(destination())
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = mfaCode.replace(/\s/g, "")
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your authenticator app")
      return
    }
    setLoading(true)
    setError("")
    try {
      await verifyMfa(factorId, challengeId, code)
      router.push(destination())
    } catch (err: any) {
      setError(err.message || "Invalid code — try again")
      setMfaCode("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)]">
      <div className="w-full max-w-sm p-8 space-y-6">
        <div className="text-center space-y-1">
          <Image src="/brand-mark.svg" alt="Raza Stationers" width={56} height={56} priority className="mx-auto mb-3 size-14 rounded-2xl" />
          <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground">Raza Stationers Operations Portal</p>
        </div>

        {step === "credentials" && (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Email or mobile number</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="owner@razastationers.com or 03001234567"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-[#051F20] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#0a3a3a] transition-colors"
            >
              <LogIn size={16} />
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        )}

        {step === "mfa-challenge" && (
          <form onSubmit={handleMfa} className="space-y-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="p-3 rounded-full bg-[#051F20]/10">
                <Shield size={24} className="text-[#051F20]" />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Authenticator Code</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full h-12 px-3 rounded-xl border border-border bg-background text-center text-2xl tracking-widest font-mono outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-destructive font-medium text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-[#051F20] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#0a3a3a] transition-colors"
            >
              <KeyRound size={16} />
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("credentials"); setError(""); setMfaCode("") }}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              ← Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
