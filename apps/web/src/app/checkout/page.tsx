"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { DeliveryZoneNotice } from "@/components/checkout/DeliveryZoneNotice"
import { MinOrderNotice } from "@/components/checkout/MinOrderNotice"
import { PaymentMethodPicker } from "@/components/checkout/PaymentMethodPicker"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bilingual } from "@/components/ui/bilingual"
import { formatPKR } from "@/lib/pricing"
import { normalizePakistaniMobile, PaymentMethodType, SUPPORTED_DELIVERY_CITIES } from "@raza-stationers/validation"
import { createAPIClient } from "@raza-stationers/api"
import { ArrowLeft, ArrowRight, Truck, Building2, Lock, Loader2, MapPin, Store } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, totalItems, clearCart } = useCart()
  const { accountStatus, clientBusiness, getAccessToken, logout } = useAuth()

  const [recipientName, setRecipientName] = React.useState(clientBusiness?.contactPerson || "")
  const [phone, setPhone] = React.useState(clientBusiness?.phone || "")
  const [city, setCity] = React.useState(clientBusiness?.city || "Karachi")
  const [address, setAddress] = React.useState(clientBusiness?.address || "")
  const [deliveryNotes, setDeliveryNotes] = React.useState("")
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodType>("CASH_ON_DELIVERY")
  const [agreeToTerms, setAgreeToTerms] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")
  const [fulfilmentMethod, setFulfilmentMethod] = React.useState<"delivery" | "pickup" | null>(null)
  const [fulfilmentOptions, setFulfilmentOptions] = React.useState<any>(null)
  const [optionsLoading, setOptionsLoading] = React.useState(true)
  const submittingRef = React.useRef(false)
  const idempotencyKeyRef = React.useRef("")

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const minOrderThreshold = 2000
  const isBelowMinOrder = subtotal < minOrderThreshold
  const selectedDeliveryZone = fulfilmentOptions?.deliveryZones?.find((zone: any) => zone.city.toLowerCase() === city.toLowerCase())
  const isCityValid = fulfilmentMethod !== "delivery" || Boolean(selectedDeliveryZone)
  const deliveryCharge = fulfilmentMethod === "delivery" ? Number(selectedDeliveryZone?.charge || 0) : 0

  React.useEffect(() => {
    if (accountStatus === "guest") return
    let active = true
    getAccessToken().then(async (token) => {
      if (!token) return
      const api = createAPIClient({ baseUrl: API_BASE, authToken: token })
      const options = await api.getFulfilmentOptions()
      if (active) setFulfilmentOptions(options)
    }).catch(() => { if (active) setError("Fulfilment options could not be loaded.") }).finally(() => { if (active) setOptionsLoading(false) })
    return () => { active = false }
  }, [accountStatus, getAccessToken])

  React.useEffect(() => { if (items.length === 0) router.push("/cart") }, [items, router])

  // Redirect to login if user is guest, preserving current input state
  React.useEffect(() => {
    if (accountStatus === "guest") {
      try {
        const tempState = { recipientName, phone, city, address, deliveryNotes, paymentMethod, fulfilmentMethod }
        sessionStorage.setItem("raza_stationers_temp_checkout", JSON.stringify(tempState))
      } catch (err) {
        // Ignore session storage write errors
      }
      router.push("/signin?returnTo=/checkout")
    }
  }, [accountStatus, router])

  // Restore input state from session storage on mount
  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem("raza_stationers_temp_checkout")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.recipientName) setRecipientName(parsed.recipientName)
        if (parsed.phone) setPhone(parsed.phone)
        if (parsed.city) setCity(parsed.city)
        if (parsed.address) setAddress(parsed.address)
        if (parsed.deliveryNotes) setDeliveryNotes(parsed.deliveryNotes)
        if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod)
        if (parsed.fulfilmentMethod) setFulfilmentMethod(parsed.fulfilmentMethod)
        sessionStorage.removeItem("raza_stationers_temp_checkout")
      }
    } catch (err) {
      // Ignore session storage read errors
    }
  }, [])

  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!fulfilmentMethod) e.fulfilmentMethod = "Select delivery or pickup"
    if (!recipientName || recipientName.trim().length < 2) e.recipientName = "Recipient name is required"
    if (!normalizePakistaniMobile(phone)) e.phone = "Use Pakistani mobile format 03XXXXXXXXX"
    if (fulfilmentMethod === "delivery") {
      if (!city) e.city = "City is required"
      else if (!isCityValid) e.city = "Delivery is not configured for this city"
      if (!address || address.trim().length < 10) e.address = "Complete address required"
    }
    if (!agreeToTerms) e.agreeToTerms = "You must agree to the terms"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current || isBelowMinOrder || !validateForm() || !fulfilmentMethod) return
    submittingRef.current = true
    setIsSubmitting(true)
    setError("")

    try {
      const token = await getAccessToken()
      if (!token) throw new Error("SESSION_EXPIRED")
      const api = createAPIClient({ baseUrl: API_BASE, authToken: token })
      if (!idempotencyKeyRef.current) idempotencyKeyRef.current = crypto.randomUUID()
      const order = await api.createOrder({
        clientBusinessId: clientBusiness?.id || "",
        items: items.map((item) => {
          return { productPackagingId: item.id, quantity: item.quantity }
        }),
        recipientName,
        mobile: normalizePakistaniMobile(phone)!,
        address,
        city,
        deliveryNotes,
        paymentMethod,
        fulfilmentMethod,
        idempotencyKey: idempotencyKeyRef.current,
      })
      clearCart()
      router.push(`/order-confirmation/${order.id}`)
    } catch (err: any) {
      const expired = err.message === "SESSION_EXPIRED" || /^401\b/.test(err.message || "")
      if (expired) {
        setError("Your session expired. Sign in again to continue checkout.")
        await logout()
        router.push("/signin?returnTo=/checkout&reason=session-expired")
      } else {
        setError(err.message || "Failed to submit order")
      }
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="min-h-screen px-3 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2">
              <ArrowLeft className="size-4" /><span>Back to Basket</span>
            </Link>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)]">Wholesale Order Checkout</h1>
          </div>
          <Badge variant="evergreen" className="px-3 py-1 text-xs shrink-0"><Lock className="size-3 mr-1" /><span>FR-SEC-01 Secured Checkout</span></Badge>
        </div>

        {isBelowMinOrder && <MinOrderNotice subtotal={subtotal} threshold={minOrderThreshold} />}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="flex items-center gap-2 border-b border-border pb-3 font-heading text-base font-bold text-[var(--color-ink-900)]"><MapPin className="size-4 text-[var(--color-evergreen-600)]" />1. Fulfilment method</h3>
              {optionsLoading ? <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-4 animate-spin" />Loading fulfilment options…</div> : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setFulfilmentMethod("delivery")} disabled={!fulfilmentOptions?.deliveryZones?.length} className={`min-h-24 rounded-2xl border p-4 text-left transition-colors ${fulfilmentMethod === "delivery" ? "border-[var(--color-evergreen-600)] bg-[var(--color-mist-100)]" : "border-border hover:border-[var(--color-sage-400)]"}`}><Truck className="mb-2 size-5" /><span className="block text-sm font-bold">Delivery</span><span className="text-xs text-muted-foreground">Address and configured zone charge apply.</span></button>
                  <button type="button" onClick={() => setFulfilmentMethod("pickup")} disabled={!fulfilmentOptions?.pickup?.available} className={`min-h-24 rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${fulfilmentMethod === "pickup" ? "border-[var(--color-evergreen-600)] bg-[var(--color-mist-100)]" : "border-border hover:border-[var(--color-sage-400)]"}`}><Store className="mb-2 size-5" /><span className="block text-sm font-bold">Pickup</span><span className="text-xs text-muted-foreground">{fulfilmentOptions?.pickup?.available ? "No delivery charge." : "Awaiting owner pickup configuration."}</span></button>
                </div>
              )}
              {errors.fulfilmentMethod && <p className="text-xs font-medium text-destructive">{errors.fulfilmentMethod}</p>}
              {fulfilmentMethod === "pickup" && fulfilmentOptions?.pickup?.available && <div className="rounded-xl bg-[var(--color-mist-100)] p-3 text-xs"><p className="font-semibold">{fulfilmentOptions.pickup.location}</p><p className="mt-1 text-muted-foreground">{fulfilmentOptions.pickup.instructions}</p></div>}
            </div>
            <div className="space-y-4 p-6 rounded-2xl border border-border bg-card shadow-xs">
              <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <Truck className="size-4 text-[var(--color-evergreen-600)]" /><span>2. {fulfilmentMethod === "pickup" ? "Pickup contact" : "Delivery address"}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Recipient Name *</label>
                  <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={errors.recipientName ? "border-destructive" : ""} />
                  {errors.recipientName && <span className="text-[11px] text-destructive font-medium">{errors.recipientName}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Mobile Number *</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel-national" maxLength={11} placeholder="03XXXXXXXXX" className={errors.phone ? "border-destructive" : ""} />
                  {errors.phone && <span className="text-[11px] text-destructive font-medium">{errors.phone}</span>}
                </div>
              </div>
              {fulfilmentMethod !== "pickup" && <div className="space-y-1.5">
                <label className="text-xs font-semibold">City *</label>
                <select value={city} onChange={(e) => setCity(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-ring ${errors.city ? "border-destructive" : "border-border"}`}>
                  {SUPPORTED_DELIVERY_CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  <option value="Other">Other City</option>
                </select>
                {errors.city && <span className="text-[11px] text-destructive font-medium block">{errors.city}</span>}
              </div>}
              {fulfilmentMethod !== "pickup" && <DeliveryZoneNotice selectedCity={city} />}
              {fulfilmentMethod !== "pickup" && <div className="space-y-1.5">
                <label className="text-xs font-semibold">Address *</label>
                <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)}
                  className={`w-full p-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none ${errors.address ? "border-destructive" : "border-border"}`} />
                {errors.address && <span className="text-[11px] text-destructive font-medium">{errors.address}</span>}
              </div>}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Delivery Notes (Optional)</label>
                <Input value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} placeholder="e.g. Deliver between 9am - 1pm" />
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
              <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <Building2 className="size-4" /><span>3. Payment Method</span>
              </h3>
              <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} isCreditActive={false} receiptUploaded={false} onUploadReceipt={() => {}} />
            </div>

            <div className="p-4 rounded-xl border border-border bg-card flex items-start gap-3">
              <input type="checkbox" id="agreeTerms" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="mt-1 size-4 rounded accent-[var(--color-evergreen-600)]" />
              <label htmlFor="agreeTerms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">I agree to the wholesale delivery terms and minimum order rules.</label>
            </div>
            {errors.agreeToTerms && <span className="text-[11px] text-destructive font-medium">{errors.agreeToTerms}</span>}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6 sticky top-24">
              <h3 className="font-heading text-lg font-bold text-[var(--color-ink-900)] border-b border-border pb-3">Order Review</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                    <div className="min-w-0 pr-2"><p className="font-semibold truncate">{item.title}</p><span className="text-muted-foreground">{item.quantity} x {formatPKR(item.price)} ({item.unit})</span></div>
                    <span className="font-bold shrink-0">{formatPKR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2 text-sm border-t border-border">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal ({totalItems} items)</span><span className="font-medium">{formatPKR(subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>{fulfilmentMethod === "pickup" ? "Pickup" : "Delivery"}</span><span className="font-medium text-[var(--color-evergreen-600)]">{deliveryCharge > 0 ? formatPKR(deliveryCharge) : fulfilmentMethod ? "No charge" : "Select a method"}</span></div>
                <div className="pt-3 border-t border-border flex justify-between items-baseline">
                  <span className="font-heading font-bold text-base">Total Payable</span>
                  <span className="font-heading font-bold text-2xl text-[var(--color-evergreen-600)]">{formatPKR(subtotal + deliveryCharge)}</span>
                </div>
              </div>
              {error && <p className="text-xs text-destructive font-medium">{error}</p>}
              <Button type="submit" disabled={isBelowMinOrder || !isCityValid || isSubmitting || !fulfilmentMethod || optionsLoading} size="lg" className="w-full rounded-full gap-2 text-sm font-semibold shadow-md py-6">
                {isSubmitting ? <><Loader2 className="size-4 animate-spin" /><span>Submitting...</span></> : <><Bilingual en="Confirm & Submit Order" ur="آرڈر جمع کروائیں" layout="inline" /><ArrowRight className="size-4" /></>}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
