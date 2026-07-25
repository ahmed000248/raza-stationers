"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { LogIn, ShieldCheck, Clock, UserX, Sparkles } from "lucide-react"

interface SignInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const { accountStatus, loginAs } = useAuth()
  const [identifier, setIdentifier] = React.useState("ahmed@alrazabookdepot.com")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier || identifier.length < 3) {
      setError("Please enter a valid mobile number or email")
      return
    }
    setError("")
    loginAs("approved")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="w-full max-w-md space-y-6 p-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[var(--color-evergreen-600)] text-white shadow-xs mb-2">
            <LogIn className="size-6" />
          </div>
          <h2 className="font-heading font-bold text-xl text-[var(--color-ink-900)]">
            Customer Sign In
          </h2>
          <p className="text-xs text-muted-foreground">
            FR-AUTH-01 Customer Authentication & Role Pricing
          </p>
        </div>

        {/* Quick Role Switcher (CD-04 Test Driver) - Development Only */}
        {process.env.NODE_ENV !== "production" && (
          <div className="p-3.5 rounded-2xl bg-muted/60 border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5 text-[var(--color-ink-900)]">
                <Sparkles className="size-3.5 text-[var(--color-evergreen-600)]" />
                <span>CD-04 Role Switcher</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">Dev Helper</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => loginAs("guest")}
                className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${
                  accountStatus === "guest"
                    ? "bg-[var(--color-ink-900)] text-white border-[var(--color-ink-900)] shadow-xs"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserX className="size-3.5" />
                <span>Guest</span>
              </button>

              <button
                type="button"
                onClick={() => loginAs("pending")}
                className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${
                  accountStatus === "pending"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="size-3.5" />
                <span>Pending</span>
              </button>

              <button
                type="button"
                onClick={() => loginAs("approved")}
                className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${
                  accountStatus === "approved"
                    ? "bg-[var(--color-evergreen-600)] text-white border-[var(--color-evergreen-600)] shadow-xs"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldCheck className="size-3.5" />
                <span>Approved</span>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Mobile Number or Email *</label>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="03001234567 or email@shop.com"
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

          <Button type="submit" size="lg" className="w-full rounded-full gap-2 font-semibold">
            <LogIn className="size-4" />
            <Bilingual en="Sign In to Account" ur="اکاؤنٹ میں سائن ان کریں" layout="inline" />
          </Button>
        </form>

        {/* Footer Registration Link */}
        <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground space-y-1">
          <p>Don&apos;t have a wholesale business account yet?</p>
          <Link
            href="/register"
            onClick={() => onOpenChange(false)}
            className="font-bold text-[var(--color-evergreen-600)] hover:underline block"
          >
            Register Wholesale Shop / Business Account →
          </Link>
        </div>
      </div>
    </Dialog>
  )
}
