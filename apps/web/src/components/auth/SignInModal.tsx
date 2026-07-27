"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { LogIn } from "lucide-react"

interface SignInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const router = useRouter()
  const { login } = useAuth()
  const [mobileNumber, setMobileNumber] = React.useState("03001234567")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mobileNumber || mobileNumber.length < 10) {
      setError("Please enter a valid mobile number")
      return
    }
    setLoading(true)
    setError("")
    try {
      await login(mobileNumber, password)
      onOpenChange(false)
      router.push("/catalogue")
    } catch (err: any) {
      setError(err.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="text-center space-y-1">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[var(--color-evergreen-600)] text-white shadow-xs mb-2">
            <LogIn className="size-6" />
          </div>
          <h2 className="font-heading font-bold text-xl text-[var(--color-ink-900)]">
            Customer Sign In
          </h2>
          <p className="text-xs text-muted-foreground">
            FR-AUTH-01 Customer Authentication
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Mobile Number *</label>
            <Input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="03001234567" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Password *</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {error && <p className="text-xs text-destructive font-medium">{error}</p>}

          <Button type="submit" size="lg" className="w-full rounded-full gap-2 font-semibold" disabled={loading}>
            <LogIn className="size-4" />
            <Bilingual en={loading ? "Signing In..." : "Sign In to Account"} ur="اکاؤنٹ میں سائن ان کریں" layout="inline" />
          </Button>
        </form>

        <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground space-y-1">
          <p>Don&apos;t have a wholesale business account yet?</p>
          <Link href="/register" onClick={() => onOpenChange(false)} className="font-bold text-[var(--color-evergreen-600)] hover:underline block">
            Register Wholesale Shop / Business Account →
          </Link>
        </div>
      </div>
    </Dialog>
  )
}
