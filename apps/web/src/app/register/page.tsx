"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { PendingVerificationNotice } from "@/components/auth/PendingVerificationNotice"
import { isCityInDeliveryZone, SUPPORTED_DELIVERY_CITIES } from "@raza-stationers/validation"
import { Building2, ArrowLeft, Upload, Check, ShieldCheck, ArrowRight, FileText } from "lucide-react"

export default function WholesaleRegistrationPage() {
  const { accountStatus, loginAs, clientBusiness } = useAuth()

  // Form State
  const [shopName, setShopName] = React.useState("Al-Karam Paper Mart")
  const [ownerName, setOwnerName] = React.useState("Karamat Ali")
  const [mobile, setMobile] = React.useState("03009876543")
  const [email, setEmail] = React.useState("contact@alkarampaper.com")
  const [city, setCity] = React.useState("Karachi")
  const [address, setAddress] = React.useState("Shop #14, Paper Market, Light House, Karachi")
  const [ntnCnic, setNtnCnic] = React.useState("42201-1234567-1")
  const [documentAttached, setDocumentAttached] = React.useState(false)

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitted, setSubmitted] = React.useState(false)

  const isCityValid = isCityInDeliveryZone(city)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!shopName || shopName.trim().length < 3) newErrors.shopName = "Business name must be at least 3 characters"
    if (!ownerName || ownerName.trim().length < 2) newErrors.ownerName = "Owner name is required"
    if (!mobile || mobile.trim().length < 10) newErrors.mobile = "Valid mobile number required"
    if (!email || !email.includes("@")) newErrors.email = "Valid email address required"
    if (!city) newErrors.city = "City is required"
    else if (!isCityValid) newErrors.city = "This city is outside our delivery zones"
    if (!address || address.trim().length < 10) newErrors.address = "Complete shop address required"
    if (!ntnCnic || ntnCnic.trim().length < 5) newErrors.ntnCnic = "NTN number or 13-digit CNIC is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    loginAs("pending")
    setSubmitted(true)
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

        {/* If Submitted or Account is Pending: Show Pending Verification State (FR-AUTH-02) */}
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
                Thank you for registering <strong className="text-foreground">{shopName || clientBusiness?.businessName}</strong>! Your NTN/CNIC details have been routed to our admin team for verification.
              </p>
            </div>

            <PendingVerificationNotice businessName={shopName || clientBusiness?.businessName} />

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
          /* Registration Form */
          <form onSubmit={handleSubmit} className="p-8 rounded-3xl border border-border bg-card shadow-xs space-y-6">
            <div className="space-y-4">
              <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <Building2 className="size-4 text-[var(--color-evergreen-600)]" />
                <span>1. Business & Owner Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Shop / Business Name *</label>
                  <Input
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Al-Karam Paper Mart"
                    className={errors.shopName ? "border-destructive" : ""}
                  />
                  {errors.shopName && <span className="text-[11px] text-destructive font-medium">{errors.shopName}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Owner / Contact Name *</label>
                  <Input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Karamat Ali"
                    className={errors.ownerName ? "border-destructive" : ""}
                  />
                  {errors.ownerName && <span className="text-[11px] text-destructive font-medium">{errors.ownerName}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Mobile Phone Number *</label>
                  <Input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="03009876543"
                    className={errors.mobile ? "border-destructive" : ""}
                  />
                  {errors.mobile && <span className="text-[11px] text-destructive font-medium">{errors.mobile}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Business Email Address *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@alkarampaper.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <span className="text-[11px] text-destructive font-medium">{errors.email}</span>}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <FileText className="size-4 text-[var(--color-evergreen-600)]" />
                <span>2. Tax Verification & Location (OF-04)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">City *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`w-full h-10 px-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-ring ${
                      errors.city ? "border-destructive" : "border-border"
                    }`}
                  >
                    {SUPPORTED_DELIVERY_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Other">Other City</option>
                  </select>
                  {errors.city && <span className="text-[11px] text-destructive font-medium block">{errors.city}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">NTN Number or CNIC *</label>
                  <Input
                    value={ntnCnic}
                    onChange={(e) => setNtnCnic(e.target.value)}
                    placeholder="1234567-8 or 42201-1234567-1"
                    className={errors.ntnCnic ? "border-destructive" : ""}
                  />
                  {errors.ntnCnic && <span className="text-[11px] text-destructive font-medium">{errors.ntnCnic}</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Shop / Office Street Address *</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop #, Market area, Street address"
                  className={`w-full p-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none ${
                    errors.address ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.address && <span className="text-[11px] text-destructive font-medium">{errors.address}</span>}
              </div>

              {/* Tax Document Attachment Simulator */}
              <div className="p-4 rounded-2xl border border-dashed border-border bg-muted/30 space-y-2">
                <span className="text-xs font-semibold text-foreground block">
                  Tax Registration Certificate or CNIC Copy (Optional)
                </span>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    size="sm"
                    variant={documentAttached ? "secondary" : "outline"}
                    onClick={() => setDocumentAttached((prev) => !prev)}
                    className="rounded-lg gap-2"
                  >
                    {documentAttached ? (
                      <>
                        <Check className="size-4 text-[var(--color-evergreen-600)]" />
                        <span>Document Attached</span>
                      </>
                    ) : (
                      <>
                        <Upload className="size-4" />
                        <span>Simulate Document Upload</span>
                      </>
                    )}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {documentAttached ? "ntn_certificate_v1.pdf" : "PDF, JPG, or PNG (Max 5MB)"}
                  </span>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full rounded-full gap-2 text-sm font-semibold shadow-md py-6">
              <Bilingual en="Submit Wholesale Business Registration" ur="ہول سیل رجسٹریشن جمع کریں" layout="inline" />
              <ArrowRight className="size-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
