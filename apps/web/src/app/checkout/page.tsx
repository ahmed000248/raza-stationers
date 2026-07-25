"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { DeliveryZoneNotice } from "@/components/checkout/DeliveryZoneNotice"
import { MinOrderNotice } from "@/components/checkout/MinOrderNotice"
import { PaymentMethodPicker } from "@/components/checkout/PaymentMethodPicker"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bilingual } from "@/components/ui/bilingual"
import { formatPKR } from "@/lib/pricing"
import { isCityInDeliveryZone, PaymentMethodType, SUPPORTED_DELIVERY_CITIES } from "@raza-stationers/validation"
import { ArrowLeft, ArrowRight, ShieldCheck, Truck, AlertCircle, Building2, Lock } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, totalItems, clearCart } = useCart()

  // Form State
  const [recipientName, setRecipientName] = React.useState("Ahmed Raza")
  const [phone, setPhone] = React.useState("03001234567")
  const [city, setCity] = React.useState("Karachi")
  const [address, setAddress] = React.useState("Shop #42, Main Stationery Market, Urdu Bazar")
  const [deliveryNotes, setDeliveryNotes] = React.useState("Deliver during morning shop hours (9am - 1pm)")
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodType>("CASH_ON_DELIVERY")
  const [agreeToTerms, setAgreeToTerms] = React.useState(true)
  const [receiptUploaded, setReceiptUploaded] = React.useState(false)
  const [isCreditActive, setIsCreditActive] = React.useState(true)

  // Validation Error State
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const minOrderThreshold = 2000
  const isBelowMinOrder = subtotal < minOrderThreshold
  const isCityValid = isCityInDeliveryZone(city)

  // Redirect to cart if empty
  React.useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items, router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!recipientName || recipientName.trim().length < 2) {
      newErrors.recipientName = "Recipient name is required"
    }
    if (!phone || phone.trim().length < 10) {
      newErrors.phone = "Valid Pakistani mobile number is required (+92 300 1234567)"
    }
    if (!city) {
      newErrors.city = "City is required"
    } else if (!isCityValid) {
      newErrors.city = "This city is outside our delivery zones. Supported: Karachi & major Punjab cities."
    }
    if (!address || address.trim().length < 10) {
      newErrors.address = "Complete street address is required"
    }
    if (!agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the wholesale delivery terms"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (isBelowMinOrder) return

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate order submission & redirect to Order Confirmation
    setTimeout(() => {
      const mockOrderId = `RS-${Math.floor(1000 + Math.random() * 9000)}`
      clearCart()
      router.push(`/order-confirmation/${mockOrderId}`)
    }, 1200)
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="py-10 px-6 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Basket</span>
            </Link>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)]">
              Wholesale Order Checkout
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirm delivery address, zone availability, and payment preferences.
            </p>
          </div>

          <Badge variant="evergreen" className="px-3 py-1 text-xs shrink-0">
            <Lock className="size-3 mr-1" />
            <span>FR-SEC-01 Secured Checkout</span>
          </Badge>
        </div>

        {/* Minimum Order Blocking Banner (OF-01) */}
        {isBelowMinOrder && (
          <MinOrderNotice subtotal={subtotal} threshold={minOrderThreshold} />
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Delivery Form & Payment Selection */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Recipient & Delivery Address */}
            <div className="space-y-4 p-6 rounded-2xl border border-border bg-card shadow-xs">
              <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <Truck className="size-4 text-[var(--color-evergreen-600)]" />
                <span>1. Delivery Address & Contact (OF-04)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Contact / Recipient Name *</label>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Ahmed Raza"
                    className={errors.recipientName ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.recipientName && (
                    <span className="text-[11px] text-destructive font-medium">{errors.recipientName}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Mobile Number *</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03001234567"
                    className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.phone && (
                    <span className="text-[11px] text-destructive font-medium">{errors.phone}</span>
                  )}
                </div>
              </div>

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
                  <option value="Other">Other City (Outside Delivery Zone)</option>
                </select>
                {errors.city && (
                  <span className="text-[11px] text-destructive font-medium block">{errors.city}</span>
                )}
              </div>

              {/* Delivery Zone Notice Component (OF-04) */}
              <DeliveryZoneNotice selectedCity={city} errorMessage={!isCityValid ? errors.city : undefined} />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Shop / Office Complete Address *</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop #, Street name, Market area, City"
                  className={`w-full p-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none ${
                    errors.address ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.address && (
                  <span className="text-[11px] text-destructive font-medium">{errors.address}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Delivery Instructions (Optional)</label>
                <Input
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Deliver between 9am - 1pm"
                />
              </div>
            </div>

            {/* 2. Payment Method Selection */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
              <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <Building2 className="size-4 text-[var(--color-evergreen-600)]" />
                <span>2. Payment Selection (FR-CRT-02 to 07)</span>
              </h3>

              <PaymentMethodPicker
                value={paymentMethod}
                onChange={setPaymentMethod}
                isCreditActive={isCreditActive}
                receiptUploaded={receiptUploaded}
                onUploadReceipt={() => setReceiptUploaded((prev) => !prev)}
              />
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="p-4 rounded-xl border border-border bg-card flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 size-4 rounded accent-[var(--color-evergreen-600)]"
              />
              <label htmlFor="agreeTerms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                I agree to the wholesale delivery terms, dispatch schedules, and minimum order rules. I understand client-side validation provides UX guidance and final order confirmation is executed server-side (<strong className="text-foreground">FR-SEC-01</strong>).
              </label>
            </div>
            {errors.agreeToTerms && (
              <span className="text-[11px] text-destructive font-medium block">{errors.agreeToTerms}</span>
            )}
          </div>

          {/* Right Column: Order Summary & Place Order Button */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6 sticky top-24">
              <h3 className="font-heading text-lg font-bold text-[var(--color-ink-900)] border-b border-border pb-3">
                Order Review
              </h3>

              {/* Items Breakdown */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold truncate">{item.title}</p>
                      <span className="text-muted-foreground">{item.quantity} x {formatPKR(item.price)} ({item.unit})</span>
                    </div>
                    <span className="font-bold text-foreground shrink-0">{formatPKR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-2 text-sm border-t border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-medium text-foreground">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Zone Delivery</span>
                  <span className="font-medium text-[var(--color-evergreen-600)]">Free (Zone Covered)</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between items-baseline">
                  <span className="font-heading font-bold text-base text-[var(--color-ink-900)]">Total Payable</span>
                  <span className="font-heading font-bold text-2xl text-[var(--color-evergreen-600)]">{formatPKR(subtotal)}</span>
                </div>
              </div>

              {/* Submit Order Button */}
              <Button
                type="submit"
                size="lg"
                variant="default"
                disabled={isBelowMinOrder || !isCityValid || isSubmitting}
                className="w-full rounded-full gap-2 text-sm font-semibold shadow-md py-6"
              >
                {isSubmitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <Bilingual en="Confirm & Submit Order" ur="آرڈر جمع کروائیں" layout="inline" />
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
