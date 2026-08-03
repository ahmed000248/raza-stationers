"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { normalizePakistaniMobile } from "@raza-stationers/validation"
import { User, ArrowLeft, Loader2 } from "lucide-react"

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/catalogue"
  const pathname = value.split("?")[0]
  if (pathname === "/signin" || pathname === "/signup" || pathname === "/register" || pathname.startsWith("/auth")) {
    return "/catalogue"
  }
  return value
}

export default function CustomerSignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = safeReturnTo(searchParams.get("returnTo"))
  const { accountStatus, registerCustomer } = useAuth()

  const [name, setName] = React.useState("")
  const [mobileNumber, setMobileNumber] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [submitError, setSubmitError] = React.useState("")

  React.useEffect(() => {
    if (accountStatus === "approved" || accountStatus === "pending") {
      router.replace(returnTo)
    }
  }, [accountStatus, returnTo, router])

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
      setSubmitError(err.message || "Customer account creation failed. Please try again.")
    } finally {
      setLoading(false)
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
            Create Your Customer Account
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sign up for individual retail purchases and quick order tracking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 rounded-3xl border border-border bg-card shadow-xs space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Full Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <span className="text-[11px] text-destructive font-medium">{errors.name}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Mobile Number *</label>
              <Input
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                inputMode="tel"
                autoComplete="tel-national"
                maxLength={11}
                placeholder="03XXXXXXXXX"
                className={errors.mobileNumber ? "border-destructive" : ""}
              />
              {errors.mobileNumber && <span className="text-[11px] text-destructive font-medium">{errors.mobileNumber}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address *</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <span className="text-[11px] text-destructive font-medium">{errors.email}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Password *</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                className={errors.password ? "border-destructive" : ""}
              />
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
      </div>
    </div>
  )
}
