"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { MinOrderNotice } from "@/components/checkout/MinOrderNotice"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bilingual } from "@/components/ui/bilingual"
import { formatPKR } from "@/lib/pricing"
import { normalizePakistaniMobile, PaymentMethodType, SUPPORTED_DELIVERY_CITIES } from "@raza-stationers/validation"
import { ArrowLeft, ArrowRight, Truck, Building2, Lock, MapPin, Store } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, totalItems } = useCart()
  const { clientBusiness } = useAuth()

  const [recipientName, setRecipientName] = React.useState(clientBusiness?.contactPerson || "")
  const [phone, setPhone] = React.useState(clientBusiness?.phone || "")
  const [city, setCity] = React.useState(clientBusiness?.city || "Wah Cantt")
  const [address, setAddress] = React.useState(clientBusiness?.address || "")
  const [deliveryNotes, setDeliveryNotes] = React.useState("")
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodType>("CASH_ON_DELIVERY")
  const [agreeToTerms, setAgreeToTerms] = React.useState(true)
  const [fulfilmentMethod, setFulfilmentMethod] = React.useState<"delivery" | "pickup">("delivery")

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const minOrderThreshold = 2000
  const isBelowMinOrder = subtotal < minOrderThreshold

  React.useEffect(() => { if (items.length === 0) router.push("/cart") }, [items, router])

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    alert("Backend rebuild in progress. Order submission is currently disabled.")
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
          <Badge variant="amber" className="px-3 py-1 text-xs shrink-0"><Lock className="size-3 mr-1" /><span>Backend Rebuild in Progress</span></Badge>
        </div>

        {isBelowMinOrder && <MinOrderNotice subtotal={subtotal} threshold={minOrderThreshold} />}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="flex items-center gap-2 border-b border-border pb-3 font-heading text-base font-bold text-[var(--color-ink-900)]"><MapPin className="size-4 text-[var(--color-evergreen-600)]" />1. Fulfilment method</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setFulfilmentMethod("delivery")} className={`min-h-24 rounded-2xl border p-4 text-left transition-colors ${fulfilmentMethod === "delivery" ? "border-[var(--color-evergreen-600)] bg-[var(--color-mist-100)]" : "border-border"}`}><Truck className="mb-2 size-5" /><span className="block text-sm font-bold">Delivery</span></button>
                <button type="button" onClick={() => setFulfilmentMethod("pickup")} className={`min-h-24 rounded-2xl border p-4 text-left transition-colors ${fulfilmentMethod === "pickup" ? "border-[var(--color-evergreen-600)] bg-[var(--color-mist-100)]" : "border-border"}`}><Store className="mb-2 size-5" /><span className="block text-sm font-bold">Pickup</span></button>
              </div>
            </div>
            <div className="space-y-4 p-6 rounded-2xl border border-border bg-card shadow-xs">
              <h3 className="font-heading text-base font-bold text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <Truck className="size-4 text-[var(--color-evergreen-600)]" /><span>2. Address & Contact</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Recipient Name *</label>
                  <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Mobile Number *</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="03XXXXXXXXX" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Address *</label>
                <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background text-sm outline-none resize-none" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card flex items-start gap-3">
              <input type="checkbox" id="agreeTerms" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="mt-1 size-4 rounded accent-[var(--color-evergreen-600)]" />
              <label htmlFor="agreeTerms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">I agree to the wholesale terms.</label>
            </div>
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
              </div>
              <p className="text-xs text-amber-700 font-medium">Backend rebuild in progress. Submissions are disabled.</p>
              <Button type="submit" disabled size="lg" className="w-full rounded-full gap-2 text-sm font-semibold shadow-md py-6 opacity-60">
                <Bilingual en="Confirm & Submit Order (Disabled)" ur="آرڈر جمع کروائیں" layout="inline" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
