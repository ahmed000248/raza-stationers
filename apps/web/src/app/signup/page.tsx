"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { normalizePakistaniMobile } from "@raza-stationers/validation"
import { User, ArrowLeft, Loader2, KeyRound, RotateCcw } from "lucide-react"

export default function CustomerSignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/catalogue"
  const { accountStatus, registerCustomer, verifyOtp, resendOtp } = useAuth()

  const [name, setName] = React.useState("")
  const [mobileNumber, setMobileNumber] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [otpPending, setOtpPending] = React.useState(false)
  const [otpCode, setOtpCode] = React.useState("")
  const [otpLoading, setOtpLoading] = React.useState(false)
  const [otpError, setOtpError] = React.useState("")
  const [cooldown, setCooldown] = React.useState(0)

  const [loading, setLoading] = React.useState(false)
  const [submitError, setSubmitError] = React.useState("")

  React.useEffect(() => {
    if (accountStatus === "approved" || accountStatus === "pending") {
      router.replace(returnTo)
    }
  }, [accountStatus, returnTo, router])

  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name || name.trim().length < 2) newErrors.name = "Your full name is required"
    if (!normalizePakistaniMobile(mobileNumber)) newErrors.mobileNumber = "Use Pakistani mobile format 03XXXXXXXXX"
    if (!email || !email.includes("@")) newErrors.email = "Valid email address required"
    if (!password || password.length < 6) newErrors.password = "Password must be at least 6 characters"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setSubmitError("")
    try {
      await registerCustomer({
        name,
        mobileNumber: normalizePakistaniMobile(mobileNumber)!,
        email: email.trim().toLowerCase(),
        password,
      })
      router.replace(returnTo)
    } catch (err: any) {
      if (err.message === "CONFIRMATION_PENDING") {
        setOtpPending(true)
        setCooldown(60)
      } else {
        setSubmitError(err.message || "Customer account creation failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.trim().length < 6) {
      return setOtpError("Please enter the complete 6-digit verification code")
    }
    setOtpLoading(true)
    setOtpError("")
    try {
      await verifyOtp(email.trim().toLowerCase(), otpCode.trim())
      await registerCustomer({
        name,
        mobileNumber: normalizePakistaniMobile(mobileNumber)!,
        email: email.trim().toLowerCase(),
        password,
      })
      router.replace(returnTo)
    } catch (err: any) {
      setOtpError(err.message || "Invalid OTP code or expired verification token. Please try again.")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setOtpError("")
    try {
      await resendOtp(email.trim().toLowerCase())
      setCooldown(60)
    } catch (err: any) {
      setOtpError(err.message || "Failed to resend OTP. Please try again later.")
    }
  }

  return (
    <div className="py-12 px-6 min-h-screen">
      <div className="mx-auto max-w-xl space-y-8">
        <Link
          href="/signin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Sign In</span>
        </Link>

        <div className="space-y-2 border-b border-border pb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">
            Customer Account Signup
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)]">
            {otpPending ? "Verify Your Email" : "Create Your Customer Account"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {otpPending
              ? `We sent a 6-digit code to ${email}. Enter the code below to complete registration.`
              : "Sign up for individual retail purchases and quick order tracking."}
          </p>
        </div>

        {otpPending ? (
          <form onSubmit={handleVerifyOtp} className="p-8 rounded-3xl border border-border bg-card shadow-xs space-y-6">
            <div className="space-y-4 text-center">
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[var(--color-mist-100)] text-[var(--color-evergreen-600)] mx-auto">
                <KeyRound className="size-7" />
              </div>
              <div className="space-y-1">
                <label htmlFor="otp-input" className="text-xs font-semibold text-foreground">
                  6-Digit Verification Code
                </label>
                <Input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="text-center font-mono text-2xl tracking-[0.5em] h-14"
                  autoFocus
                />
              </div>
            </div>

            {otpError && <p className="text-xs text-destructive font-medium text-center">{otpError}</p>}

            <Button type="submit" size="lg" className="w-full rounded-full gap-2 text-sm font-semibold shadow-md py-6" disabled={otpLoading}>
              {otpLoading ? <Loader2 className="size-4 animate-spin" /> : <User className="size-4" />}
              <span>{otpLoading ? "Verifying..." : "Verify Code & Complete Registration"}</span>
            </Button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0}
                className="inline-flex items-center gap-1.5 font-semibold text-[var(--color-evergreen-600)] hover:underline disabled:opacity-50"
              >
                <RotateCcw className="size-3.5" />
                <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend OTP Code"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtpPending(false)
                  setOtpCode("")
                  setOtpError("")
                }}
                className="font-medium text-muted-foreground hover:text-foreground"
              >
                Change Email / Back
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 rounded-3xl border border-border bg-card shadow-xs space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Full Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoComplete="name" className={errors.name ? "border-destructive" : ""} />
                {errors.name && <span className="text-[11px] text-destructive font-medium">{errors.name}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Mobile Number *</label>
                <Input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} inputMode="tel" autoComplete="tel-national" maxLength={11} placeholder="03XXXXXXXXX" className={errors.mobileNumber ? "border-destructive" : ""} />
                {errors.mobileNumber && <span className="text-[11px] text-destructive font-medium">{errors.mobileNumber}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address *</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className={errors.email ? "border-destructive" : ""} />
                {errors.email && <span className="text-[11px] text-destructive font-medium">{errors.email}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Password *</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" className={errors.password ? "border-destructive" : ""} />
                {errors.password && <span className="text-[11px] text-destructive font-medium">{errors.password}</span>}
              </div>
            </div>

            {submitError && <p className="text-xs text-destructive font-medium text-center">{submitError}</p>}

            <Button type="submit" size="lg" className="w-full rounded-full gap-2 text-sm font-semibold shadow-md py-6" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <User className="size-4" />}
              <span>{loading ? "Creating Account..." : "Create Customer Account"}</span>
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Own a stationery shop, school, or office?{" "}
                <Link href={`/register?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-[var(--color-evergreen-600)] hover:underline">
                  Register for a Wholesale Business Account
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
