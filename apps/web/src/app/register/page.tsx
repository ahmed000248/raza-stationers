"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { PendingVerificationNotice } from "@/components/auth/PendingVerificationNotice"
import { isCityInDeliveryZone, normalizePakistaniMobile, SUPPORTED_DELIVERY_CITIES } from "@raza-stationers/validation"
import { Building2, ArrowLeft, ArrowRight, FileText, Loader2, KeyRound, RotateCcw } from "lucide-react"

export default function WholesaleRegistrationPage() {
  const { accountStatus, register, verifyOtp, resendOtp } = useAuth()

  const [name, setName] = React.useState("")
  const [mobileNumber, setMobileNumber] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [businessName, setBusinessName] = React.useState("")
  const [ownerName, setOwnerName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [city, setCity] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [businessType, setBusinessType] = React.useState("stationery_shop")

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitted, setSubmitted] = React.useState(false)
  const [otpPending, setOtpPending] = React.useState(false)
  const [otpCode, setOtpCode] = React.useState("")
  const [otpLoading, setOtpLoading] = React.useState(false)
  const [otpError, setOtpError] = React.useState("")
  const [cooldown, setCooldown] = React.useState(0)

  const [loading, setLoading] = React.useState(false)
  const [submitError, setSubmitError] = React.useState("")

  const isCityValid = isCityInDeliveryZone(city)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name || name.trim().length < 2) newErrors.name = "Your name is required"
    if (!normalizePakistaniMobile(mobileNumber)) newErrors.mobileNumber = "Use Pakistani mobile format 03XXXXXXXXX"
    if (!password || password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (!email || !email.includes("@")) newErrors.email = "Valid email address required"
    if (!businessName || businessName.trim().length < 3) newErrors.businessName = "Business name must be at least 3 characters"
    if (!ownerName || ownerName.trim().length < 2) newErrors.ownerName = "Owner name is required"
    if (!city) newErrors.city = "City is required"
    else if (!isCityValid) newErrors.city = "This city is outside our delivery zones"
    if (!address || address.trim().length < 10) newErrors.address = "Complete shop address required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setSubmitError("")
    try {
      await register({
        name,
        mobileNumber: normalizePakistaniMobile(mobileNumber)!,
        password,
        email: email.trim().toLowerCase(),
        businessName,
        businessType,
        contactPerson: ownerName,
        address,
        city,
      })
      setSubmitted(true)
    } catch (err: any) {
      if (err.message === "CONFIRMATION_PENDING") {
        setOtpPending(true)
        setCooldown(60)
      } else {
        setSubmitError(err.message || "Registration failed. Please try again.")
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
      await register({
        name,
        mobileNumber: normalizePakistaniMobile(mobileNumber)!,
        password,
        email: email.trim().toLowerCase(),
        businessName,
        businessType,
        contactPerson: ownerName,
        address,
        city,
      })
      setSubmitted(true)
      setOtpPending(false)
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
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Catalogue</span>
        </Link>

        <div className="space-y-2 border-b border-border pb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">
            Business account registration
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)]">
            {otpPending ? "Verify Email for Wholesale Account" : "Wholesale Account Registration"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {otpPending
              ? `We sent a 6-digit verification code to ${email}. Enter the code below.`
              : "Submit your business details for owner review. Approved accounts can use their eligible catalogue pricing."}
          </p>
        </div>

        {otpPending ? (
          <form onSubmit={handleVerifyOtp} className="p-8 rounded-3xl border border-border bg-card shadow-xs space-y-6 max-w-xl mx-auto">
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
              {otpLoading ? <Loader2 className="size-4 animate-spin" /> : <Building2 className="size-4" />}
              <span>{otpLoading ? "Verifying..." : "Verify Code & Register Business"}</span>
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
        ) : (submitted || accountStatus === "pending") ? (
          <div className="p-8 rounded-3xl border border-amber-500/30 bg-amber-500/10 space-y-6 text-center">
            <div className="inline-flex size-16 items-center justify-center rounded-full bg-amber-600 text-white shadow-md mx-auto">
              <Building2 className="size-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading font-bold text-2xl text-[var(--color-ink-900)]">
                Registration Submitted for Verification
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Thank you for registering <strong className="text-foreground">{businessName}</strong>! Your details have been routed to our admin team for verification.
              </p>
            </div>
            <PendingVerificationNotice businessName={businessName} />
            <div className="flex justify-center pt-2">
              <Link href="/catalogue">
                <Button size="lg" className="rounded-full gap-2 font-semibold">
                  <span>Browse Catalogue</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 rounded-3xl border border-border bg-card shadow-xs space-y-6">
            <div className="space-y-4">
              <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <Building2 className="size-4 text-[var(--color-evergreen-600)]" />
                <span>1. Your Account</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Your Name *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoComplete="name" className={errors.name ? "border-destructive" : ""} />
                  {errors.name && <span className="text-[11px] text-destructive font-medium">{errors.name}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Mobile Number *</label>
                  <Input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} inputMode="tel" autoComplete="tel-national" maxLength={11} placeholder="03XXXXXXXXX" className={errors.mobileNumber ? "border-destructive" : ""} />
                  {errors.mobileNumber && <span className="text-[11px] text-destructive font-medium">{errors.mobileNumber}</span>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Password *</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" className={errors.password ? "border-destructive" : ""} />
                  {errors.password && <span className="text-[11px] text-destructive font-medium">{errors.password}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Email Address *</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" autoComplete="email" className={errors.email ? "border-destructive" : ""} />
                  {errors.email && <span className="text-[11px] text-destructive font-medium">{errors.email}</span>}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <Building2 className="size-4 text-[var(--color-evergreen-600)]" />
                <span>2. Business Information</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Shop / Business Name *</label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your business name" autoComplete="organization" className={errors.businessName ? "border-destructive" : ""} />
                  {errors.businessName && <span className="text-[11px] text-destructive font-medium">{errors.businessName}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Owner / Contact Name *</label>
                  <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Owner or contact name" className={errors.ownerName ? "border-destructive" : ""} />
                  {errors.ownerName && <span className="text-[11px] text-destructive font-medium">{errors.ownerName}</span>}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <FileText className="size-4 text-[var(--color-evergreen-600)]" />
                <span>3. Location (OF-04)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">City *</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)}
                    className={`w-full h-10 px-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-ring ${errors.city ? "border-destructive" : "border-border"}`}>
                    <option value="">Select city</option>
                    {SUPPORTED_DELIVERY_CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                    <option value="Other">Other City</option>
                  </select>
                  {errors.city && <span className="text-[11px] text-destructive font-medium block">{errors.city}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Business Type *</label>
                  <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring">
                    <option value="stationery_shop">Stationery Shop</option>
                    <option value="bookstore">Bookstore</option>
                    <option value="school">School</option>
                    <option value="office">Office</option>
                    <option value="distributor">Distributor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Shop / Office Street Address *</label>
                <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)}
                  className={`w-full p-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none ${errors.address ? "border-destructive" : "border-border"}`} />
                {errors.address && <span className="text-[11px] text-destructive font-medium">{errors.address}</span>}
              </div>
            </div>

            {submitError && <p className="text-xs text-destructive font-medium text-center">{submitError}</p>}

            <Button type="submit" size="lg" className="w-full rounded-full gap-2 text-sm font-semibold shadow-md py-6" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              <Bilingual en={loading ? "Submitting..." : "Submit Wholesale Business Registration"} ur="ہول سیل رجسٹریشن جمع کریں" layout="inline" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
