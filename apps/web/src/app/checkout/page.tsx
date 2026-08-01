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
import { isCityInDeliveryZone, PaymentMethodType, SUPPORTED_DELIVERY_CITIES } from "@raza-stationers/validation"
import { createAPIClient } from "@raza-stationers/api"
import { ArrowLeft, ArrowRight, Truck, Building2, Lock, Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, totalItems, clearCart } = useCart()
  const { accountStatus, clientBusiness } = useAuth()

  const [recipientName, setRecipientName] = React.useState(clientBusiness?.contactPerson || "")
  const [phone, setPhone] = React.useState(clientBusiness?.phone || "")
  const [city, setCity] = React.useState(clientBusiness?.city || "Karachi")
  const [address, setAddress] = React.useState(clientBusiness?.address || "")
  const [deliveryNotes, setDeliveryNotes] = React.useState("")
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodType>("CASH_ON_DELIVERY")
  const [agreeToTerms, setAgreeToTerms] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const minOrderThreshold = 2000
  const isBelowMinOrder = subtotal < minOrderThreshold
  const isCityValid = isCityInDeliveryZone(city)

  React.useEffect(() => { if (items.length === 0) router.push("/cart") }, [items, router])

  // Redirect to login if user is guest, preserving current input state
  React.useEffect(() => {
    if (accountStatus === "guest") {
      try {
        const tempState = { recipientName, phone, city, address, deliveryNotes, paymentMethod }
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
        sessionStorage.removeItem("raza_stationers_temp_checkout")
      }
    } catch (err) {
      // Ignore session storage read errors
    }
  }, [])

  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!recipientName || recipientName.trim().length < 2) e.recipientName = "Recipient name is required"
    if (!phone || phone.trim().length < 10) e.phone = "Valid mobile number required"
    if (!city) e.city = "City is required"
    else if (!isCityValid) e.city = "City outside delivery zone"
    if (!address || address.trim().length < 10) e.address = "Complete address required"
    if (!agreeToTerms) e.agreeToTerms = "You must agree to the terms"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isBelowMinOrder || !validateForm()) return
    setIsSubmitting(true)
    setError("")

    try {
      const api = createAPIClient({ baseUrl: API_BASE })
      const order = await api.createOrder({
        clientBusinessId: clientBusiness?.id || "",
        items: items.map((item) => {
          const sku = item.id.split("-")[0]
          return { productPackagingId: item.id, quantity: item.quantity }
        }),
        recipientName,
        mobile: phone,
        address,
        city,
      })
      clearCart()
      router.push(`/order-confirmation/${order.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to submit order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="py-10 px-6 min-h-screen">
      <div className="mx-auto max-w-none w-full space-y-8">
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
            <div className="space-y-4 p-6 rounded-2xl border border-border bg-card shadow-xs">
              <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <Truck className="size-4 text-[var(--color-evergreen-600)]" /><span>1. Delivery Address</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Recipient Name *</label>
                  <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={errors.recipientName ? "border-destructive" : ""} />
                  {errors.recipientName && <span className="text-[11px] text-destructive font-medium">{errors.recipientName}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Mobile Number *</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className={errors.phone ? "border-destructive" : ""} />
                  {errors.phone && <span className="text-[11px] text-destructive font-medium">{errors.phone}</span>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">City *</label>
                <select value={city} onChange={(e) => setCity(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-ring ${errors.city ? "border-destructive" : "border-border"}`}>
                  {SUPPORTED_DELIVERY_CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  <option value="Other">Other City</option>
                </select>
                {errors.city && <span className="text-[11px] text-destructive font-medium block">{errors.city}</span>}
              </div>
              <DeliveryZoneNotice selectedCity={city} />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Address *</label>
                <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)}
                  className={`w-full p-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none ${errors.address ? "border-destructive" : "border-border"}`} />
                {errors.address && <span className="text-[11px] text-destructive font-medium">{errors.address}</span>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Delivery Notes (Optional)</label>
                <Input value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} placeholder="e.g. Deliver between 9am - 1pm" />
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
              <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <Building2 className="size-4" /><span>2. Payment Method</span>
              </h3>
              <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} isCreditActive={true} receiptUploaded={false} onUploadReceipt={() => {}} />
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
                <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span className="font-medium text-[var(--color-evergreen-600)]">Free</span></div>
                <div className="pt-3 border-t border-border flex justify-between items-baseline">
                  <span className="font-heading font-bold text-base">Total Payable</span>
                  <span className="font-heading font-bold text-2xl text-[var(--color-evergreen-600)]">{formatPKR(subtotal)}</span>
                </div>
              </div>
              {error && <p className="text-xs text-destructive font-medium">{error}</p>}
              <Button type="submit" disabled={isBelowMinOrder || !isCityValid || isSubmitting} size="lg" className="w-full rounded-full gap-2 text-sm font-semibold shadow-md py-6">
                {isSubmitting ? <><Loader2 className="size-4 animate-spin" /><span>Submitting...</span></> : <><Bilingual en="Confirm & Submit Order" ur="آرڈر جمع کروائیں" layout="inline" /><ArrowRight className="size-4" /></>}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
