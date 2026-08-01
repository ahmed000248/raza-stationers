"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { isCityInDeliveryZone, normalizePakistaniMobile, SUPPORTED_DELIVERY_CITIES } from "@raza-stationers/validation"
import { Building2, ArrowRight, UserPlus, Link2, LogOut, Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedReturnTo = searchParams.get("returnTo")
  const returnTo = requestedReturnTo?.startsWith("/") && !requestedReturnTo.startsWith("//") ? requestedReturnTo : "/catalogue"
  
  const { accountStatus, user, logout, register, linkAccount } = useAuth()
  const supabase = React.useMemo(() => createClient(), [])
  
  // Tabs: "create" | "link"
  const [activeTab, setActiveTab] = React.useState<"create" | "link">("create")

  // Create Profile Form States
  const [name, setName] = React.useState("")
  const [mobileNumber, setMobileNumber] = React.useState("")
  const [businessName, setBusinessName] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [city, setCity] = React.useState("Karachi")
  const [businessType, setBusinessType] = React.useState("stationery_shop")
  
  // Link Legacy Account Form States
  const [legacyMobile, setLegacyMobile] = React.useState("")
  const [legacyPassword, setLegacyPassword] = React.useState("")

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [submitError, setSubmitError] = React.useState("")

  // Pre-fill user name from Supabase identity metadata if available
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: sbUser } }: { data: { user: any } }) => {
      if (sbUser?.user_metadata?.full_name && !name) {
        setName(sbUser.user_metadata.full_name)
      }
    })
  }, [supabase, name])

  // Redirect if not in unregistered state
  React.useEffect(() => {
    if (accountStatus && accountStatus !== "unregistered") {
      router.push(returnTo)
    }
  }, [accountStatus, router, returnTo])

  const isCityValid = isCityInDeliveryZone(city)

  const validateCreate = () => {
    const newErrors: Record<string, string> = {}
    if (!name || name.trim().length < 2) newErrors.name = "Your name is required"
    if (!normalizePakistaniMobile(mobileNumber)) newErrors.mobileNumber = "Use Pakistani mobile format 03XXXXXXXXX"
    if (!businessName || businessName.trim().length < 3) newErrors.businessName = "Business name must be at least 3 characters"
    if (!city) newErrors.city = "City is required"
    else if (!isCityValid) newErrors.city = "This city is outside our delivery zones"
    if (!address || address.trim().length < 10) newErrors.address = "Complete shop address required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateLink = () => {
    const newErrors: Record<string, string> = {}
    if (!normalizePakistaniMobile(legacyMobile)) newErrors.legacyMobile = "Use Pakistani mobile format 03XXXXXXXXX"
    if (!legacyPassword || legacyPassword.length < 4) newErrors.legacyPassword = "Password must be at least 4 characters"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCreate()) return
    setLoading(true)
    setSubmitError("")
    try {
      const session = (await supabase.auth.getSession()).data.session
      if (!session) throw new Error("No active session found")
      
      const email = session.user.email || ""
      
      await register({
        name,
        mobileNumber: normalizePakistaniMobile(mobileNumber)!,
        password: "", // Not used in registration since they are logged in via provider
        email,
        businessName,
        businessType,
        contactPerson: name,
        address,
        city,
      })
      router.push(returnTo)
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLink()) return
    setLoading(true)
    setSubmitError("")
    try {
      const session = (await supabase.auth.getSession()).data.session
      if (!session) throw new Error("No active session found")
      
      await linkAccount(session.access_token, normalizePakistaniMobile(legacyMobile)!, legacyPassword)
      router.push(returnTo)
    } catch (err: any) {
      setSubmitError(err.message || "Failed to link legacy account. Check credentials.")
    } finally {
      setLoading(false)
    }
  }

  if (accountStatus !== "unregistered") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="py-12 px-6 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading font-bold text-2xl text-[var(--color-ink-900)]">
            Complete Your Registration
          </h1>
          <Button variant="ghost" size="sm" onClick={() => logout()} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>

        <div className="p-8 rounded-3xl border border-border bg-card shadow-sm space-y-6">
          <div className="flex border-b border-border">
            <button
              onClick={() => { setActiveTab("create"); setSubmitError(""); setErrors({}); }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all ${
                activeTab === "create"
                  ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="size-4" />
                <span>Create New Business Profile</span>
              </span>
            </button>
            <button
              onClick={() => { setActiveTab("link"); setSubmitError(""); setErrors({}); }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all ${
                activeTab === "link"
                  ? "border-[var(--color-evergreen-600)] text-[var(--color-evergreen-600)]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Link2 className="size-4" />
                <span>Link Existing Legacy Account</span>
              </span>
            </button>
          </div>

          {activeTab === "create" ? (
            <form onSubmit={handleCreateProfile} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-2 flex items-center gap-2">
                  <Building2 className="size-4 text-[var(--color-evergreen-600)]" />
                  <span>1. Contact Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Your Name *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Karamat Ali" className={errors.name ? "border-destructive" : ""} />
                    {errors.name && <span className="text-[11px] text-destructive font-medium">{errors.name}</span>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Mobile Number *</label>
                    <Input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} inputMode="tel" autoComplete="tel-national" maxLength={11} placeholder="03XXXXXXXXX" className={errors.mobileNumber ? "border-destructive" : ""} />
                    {errors.mobileNumber && <span className="text-[11px] text-destructive font-medium">{errors.mobileNumber}</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-2 flex items-center gap-2">
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
                <Bilingual en={loading ? "Submitting..." : "Complete Setup"} ur="سیٹ اپ مکمل کریں" layout="inline" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLinkAccount} className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 space-y-1">
                <p className="font-semibold">Security Note:</p>
                <p>To link your legacy profile, enter the mobile number and password of your existing account. This will securely associate your existing orders, credit line, and pricing parameters with your new Supabase identity.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Legacy Mobile Number *</label>
                  <Input value={legacyMobile} onChange={(e) => setLegacyMobile(e.target.value)} inputMode="tel" autoComplete="tel-national" maxLength={11} placeholder="03XXXXXXXXX" className={errors.legacyMobile ? "border-destructive" : ""} />
                  {errors.legacyMobile && <span className="text-[11px] text-destructive font-medium">{errors.legacyMobile}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Legacy Password *</label>
                  <Input type="password" value={legacyPassword} onChange={(e) => setLegacyPassword(e.target.value)} placeholder="••••••••" className={errors.legacyPassword ? "border-destructive" : ""} />
                  {errors.legacyPassword && <span className="text-[11px] text-destructive font-medium">{errors.legacyPassword}</span>}
                </div>
              </div>

              {submitError && <p className="text-xs text-destructive font-medium text-center">{submitError}</p>}

              <Button type="submit" size="lg" className="w-full rounded-full gap-2 text-sm font-semibold shadow-md py-6" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}
                <Bilingual en={loading ? "Linking..." : "Link My Account"} ur="اکاؤنٹ لنک کریں" layout="inline" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
