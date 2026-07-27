"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { PendingVerificationNotice } from "@/components/auth/PendingVerificationNotice"
import { isCityInDeliveryZone, SUPPORTED_DELIVERY_CITIES } from "@raza-stationers/validation"
import { Building2, ArrowLeft, Check, ArrowRight, FileText, Loader2 } from "lucide-react"

export default function WholesaleRegistrationPage() {
  const router = useRouter()
  const { accountStatus, register, clientBusiness } = useAuth()

  const [name, setName] = React.useState("Karamat Ali")
  const [mobileNumber, setMobileNumber] = React.useState("03009876543")
  const [password, setPassword] = React.useState("test123")
  const [businessName, setBusinessName] = React.useState("Al-Karam Paper Mart")
  const [ownerName, setOwnerName] = React.useState("Karamat Ali")
  const [email, setEmail] = React.useState("contact@alkarampaper.com")
  const [city, setCity] = React.useState("Karachi")
  const [address, setAddress] = React.useState("Shop #14, Paper Market, Light House, Karachi")
  const [businessType, setBusinessType] = React.useState("stationery_shop")
  const [ntnCnic, setNtnCnic] = React.useState("42201-1234567-1")
  const [documentAttached, setDocumentAttached] = React.useState(false)

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitted, setSubmitted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [submitError, setSubmitError] = React.useState("")

  const isCityValid = isCityInDeliveryZone(city)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name || name.trim().length < 2) newErrors.name = "Your name is required"
    if (!mobileNumber || mobileNumber.trim().length < 10) newErrors.mobileNumber = "Valid mobile number required"
    if (!password || password.length < 4) newErrors.password = "Password must be at least 4 characters"
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
        mobileNumber,
        password,
        businessName,
        businessType,
        contactPerson: ownerName,
        address,
        city,
      })
      setSubmitted(true)
    } catch (err: any) {
      setSubmitError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
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
            FR-AUTH-01 / FR-AUTH-02 Wholesale Business Portal
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)]">
            Wholesale Account Registration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Register your stationery shop or book depot to unlock wholesale discount pricing and 30-day business credit terms.
          </p>
        </div>

        {(submitted || accountStatus === "pending") ? (
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
                  <span>Browse Catalogue with Retail Pricing</span>
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
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Karamat Ali" className={errors.name ? "border-destructive" : ""} />
                  {errors.name && <span className="text-[11px] text-destructive font-medium">{errors.name}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Mobile Number *</label>
                  <Input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="03009876543" className={errors.mobileNumber ? "border-destructive" : ""} />
                  {errors.mobileNumber && <span className="text-[11px] text-destructive font-medium">{errors.mobileNumber}</span>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Password *</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 4 characters" className={errors.password ? "border-destructive" : ""} />
                {errors.password && <span className="text-[11px] text-destructive font-medium">{errors.password}</span>}
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
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Al-Karam Paper Mart" className={errors.businessName ? "border-destructive" : ""} />
                  {errors.businessName && <span className="text-[11px] text-destructive font-medium">{errors.businessName}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Owner / Contact Name *</label>
                  <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Karamat Ali" className={errors.ownerName ? "border-destructive" : ""} />
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
