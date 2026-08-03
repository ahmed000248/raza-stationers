"use client"

import * as React from "react"
import { Smartphone, Copy, CheckCircle } from "lucide-react"

interface TotpEnrollViewProps {
  onEnroll: () => Promise<{ factorId: string; qrCode: string; secret: string }>
  onConfirm: (factorId: string, code: string) => Promise<void>
}

type Step = "intro" | "scan" | "verify"

/**
 * Shown to an admin/owner who has NO TOTP factor yet.
 * Guides them through enrolling in Better Auth TOTP MFA.
 */
export function TotpEnrollView({ onEnroll, onConfirm }: TotpEnrollViewProps) {
  const [step, setStep] = React.useState<Step>("intro")
  const [factorId, setFactorId] = React.useState("")
  const [qrCode, setQrCode] = React.useState("")
  const [secret, setSecret] = React.useState("")
  const [code, setCode] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleStart = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await onEnroll()
      setFactorId(result.factorId)
      setQrCode(result.qrCode)
      setSecret(result.secret)
      setStep("scan")
    } catch (err: any) {
      setError(err.message || "Failed to start enrollment")
    } finally {
      setLoading(false)
    }
  }

  const handleCopySecret = async () => {
    await navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = code.replace(/\s/g, "")
    if (!/^\d{6}$/.test(clean)) {
      setError("Enter the 6-digit code from your authenticator app")
      return
    }
    setLoading(true)
    setError("")
    try {
      await onConfirm(factorId, clean)
      // onConfirm refreshes the session — AdminShell will re-render at AAL2
    } catch (err: any) {
      setError(err.message || "Invalid code — try again")
      setCode("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)]">
      <div className="w-full max-w-sm p-8 space-y-6">

        {step === "intro" && (
          <>
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-[#051F20]/10">
                  <Smartphone size={32} className="text-[#051F20]" />
                </div>
              </div>
              <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">Set Up Two-Factor Auth</h1>
              <p className="text-sm text-muted-foreground">
                Admin accounts require a one-time password (TOTP) authenticator. You only need to set this up once.
              </p>
            </div>
            {error && <p className="text-xs text-destructive font-medium text-center">{error}</p>}
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full h-10 rounded-xl bg-[#051F20] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#0a3a3a] disabled:opacity-50 transition-colors"
            >
              {loading ? "Preparing..." : "Set Up Authenticator"}
            </button>
          </>
        )}

        {step === "scan" && (
          <>
            <div className="text-center space-y-1">
              <h1 className="font-heading text-xl font-bold text-[var(--ink-900)]">Scan QR Code</h1>
              <p className="text-sm text-muted-foreground">
                Open Google Authenticator, Authy, or any TOTP app and scan the QR code below.
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              {/* qrCode is a data URL from Supabase */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="TOTP QR code" className="w-48 h-48 rounded-xl border border-border" />
            </div>

            {/* Manual entry fallback */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground text-center">Can&apos;t scan? Enter this code manually:</p>
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <code className="flex-1 text-xs font-mono break-all">{secret}</code>
                <button type="button" onClick={handleCopySecret} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                  {copied ? <CheckCircle size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <button
              onClick={() => { setStep("verify"); setError("") }}
              className="w-full h-10 rounded-xl bg-[#051F20] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#0a3a3a] transition-colors"
            >
              I&apos;ve scanned it →
            </button>
          </>
        )}

        {step === "verify" && (
          <>
            <div className="text-center space-y-1">
              <h1 className="font-heading text-xl font-bold text-[var(--ink-900)]">Confirm Setup</h1>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app to confirm.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Authenticator Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full h-14 px-3 rounded-xl border border-border bg-background text-center text-3xl tracking-widest font-mono outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-destructive font-medium text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full h-10 rounded-xl bg-[#051F20] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#0a3a3a] disabled:opacity-50 transition-colors"
              >
                {loading ? "Confirming..." : "Confirm & Access Dashboard"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => { setStep("scan"); setError(""); setCode("") }}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              ← Back to QR code
            </button>
          </>
        )}

      </div>
    </div>
  )
}
