"use client"

import * as React from "react"
import { Shield, RefreshCw } from "lucide-react"

interface TotpChallengeViewProps {
  factorId: string
  challengeId: string
  onVerify: (factorId: string, challengeId: string, code: string) => Promise<void>
  onNewChallenge: () => Promise<{ factorId: string; challengeId: string }>
}

/**
 * Shown to an admin/owner who is already enrolled in Better Auth TOTP but
 * needs to step up from AAL1 → AAL2 to access the dashboard.
 */
export function TotpChallengeView({ factorId, challengeId: initialChallengeId, onVerify, onNewChallenge }: TotpChallengeViewProps) {
  const [code, setCode] = React.useState("")
  const [challengeId, setChallengeId] = React.useState(initialChallengeId)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = code.replace(/\s/g, "")
    if (!/^\d{6}$/.test(clean)) {
      setError("Enter the 6-digit code from your authenticator app")
      return
    }
    setLoading(true)
    setError("")
    try {
      await onVerify(factorId, challengeId, clean)
    } catch (err: any) {
      setError(err.message || "Invalid code — try again")
      setCode("")
    } finally {
      setLoading(false)
    }
  }

  const handleNewChallenge = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await onNewChallenge()
      setChallengeId(result.challengeId)
      setCode("")
    } catch (err: any) {
      setError(err.message || "Failed to refresh challenge")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)]">
      <div className="w-full max-w-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-[#051F20]/10">
              <Shield size={32} className="text-[#051F20]" />
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">Two-Factor Required</h1>
          <p className="text-sm text-muted-foreground">
            Open your authenticator app and enter the 6-digit code to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Verifying..." : "Verify & Enter Dashboard"}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={handleNewChallenge}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={12} />
            Refresh code challenge
          </button>
        </div>
      </div>
    </div>
  )
}
