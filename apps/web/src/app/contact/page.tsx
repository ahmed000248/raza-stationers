"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { normalizePakistaniMobile, SUPPORTED_DELIVERY_CITIES } from "@raza-stationers/validation"
import { Mail, Phone, MapPin, MessageSquare, Send, Check, Clock, Building2 } from "lucide-react"

export default function ContactPage() {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [mobile, setMobile] = React.useState("")
  const [city, setCity] = React.useState("Karachi")
  const [topic, setTopic] = React.useState("Wholesale Account Query")
  const [message, setMessage] = React.useState("")

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitted, setSubmitted] = React.useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name || name.trim().length < 2) newErrors.name = "Name is required"
    if (!normalizePakistaniMobile(mobile)) newErrors.mobile = "Use Pakistani mobile format 03XXXXXXXXX"
    if (!city) newErrors.city = "City is required"
    if (!message || message.trim().length < 10) newErrors.message = "Message must be at least 10 characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitted(true)
    setTimeout(() => {
      setName("")
      setEmail("")
      setMobile("")
      setMessage("")
    }, 1500)
  }

  return (
    <div className="py-12 px-6 min-h-screen">
      <div className="mx-auto max-w-none w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">
            Get in Touch
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)]">
            Contact Raza Stationers Support
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Have questions about wholesale pricing, delivery zones, or credit accounts? Our team is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Contact Cards & Location Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-6">
              <h3 className="font-heading font-bold text-base text-[var(--color-ink-900)] border-b border-border pb-3 flex items-center gap-2">
                <Building2 className="size-4 text-[var(--color-evergreen-600)]" />
                <span>Market Headquarters</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-[var(--color-evergreen-600)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Physical Address</span>
                    <span className="text-muted-foreground leading-relaxed block">
                      Shop #42, Main Wholesale Market, Urdu Bazar, Karachi, Sindh, Pakistan
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-[var(--color-evergreen-600)] shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground block">Phone Support</span>
                    <span className="text-muted-foreground">+92 21 3262 0000 / +92 300 1234567</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-[var(--color-evergreen-600)] shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground block">Email Inquiry</span>
                    <span className="text-muted-foreground">support@razastationers.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-[var(--color-evergreen-600)] shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground block">Shop Operating Hours</span>
                    <span className="text-muted-foreground">Monday – Saturday: 9:00 AM – 7:30 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick Link */}
            <div className="p-6 rounded-3xl border border-[var(--color-evergreen-600)]/30 bg-[var(--color-evergreen-600)]/10 space-y-3">
              <div className="flex items-center gap-2 text-[var(--color-evergreen-600)] font-bold text-sm">
                <MessageSquare className="size-5" />
                <span>Direct WhatsApp Support</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For quick stock availability or instant order booking, chat directly with our Urdu Bazar dispatch desk on WhatsApp.
              </p>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-evergreen-600)] text-white text-xs font-semibold shadow-xs hover:bg-[var(--color-evergreen-600)]/90 transition-colors"
              >
                <MessageSquare className="size-3.5" />
                <span>Chat on WhatsApp (+92 300 1234567)</span>
              </a>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="p-8 rounded-3xl border border-border bg-card shadow-xs space-y-6">
              <h3 className="font-heading font-bold text-lg text-[var(--color-ink-900)] border-b border-border pb-3">
                Send Us an Inquiry
              </h3>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-[var(--color-evergreen-600)]/10 border border-[var(--color-evergreen-600)]/30 text-center space-y-3">
                  <div className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--color-evergreen-600)] text-white mx-auto">
                    <Check className="size-6" />
                  </div>
                  <h4 className="font-heading font-bold text-base text-[var(--color-ink-900)]">
                    Inquiry Received!
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Thank you for reaching out. Our support team will contact you shortly via phone or WhatsApp.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Your Full Name *</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ahmed Raza"
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && <span className="text-[11px] text-destructive font-medium">{errors.name}</span>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Mobile Phone Number *</label>
                      <Input
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        inputMode="tel"
                        autoComplete="tel-national"
                        maxLength={11}
                        placeholder="03XXXXXXXXX"
                        className={errors.mobile ? "border-destructive" : ""}
                      />
                      {errors.mobile && <span className="text-[11px] text-destructive font-medium">{errors.mobile}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Email Address (Optional)</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@domain.com"
                      />
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
                        <option value="Other">Other City</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Inquiry Topic</label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Wholesale Account Query">Wholesale Business Account Query</option>
                      <option value="Product Availability & Stock">Product Availability & Stock</option>
                      <option value="Order Dispatch Status">Order Dispatch Status</option>
                      <option value="Credit Term Request">Wholesale Credit Term Request (PY-01)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Your Message *</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Specify your inquiry details, product requirements, or shop location..."
                      className={`w-full p-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none ${
                        errors.message ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.message && <span className="text-[11px] text-destructive font-medium">{errors.message}</span>}
                  </div>

                  <Button type="submit" size="lg" className="w-full rounded-full gap-2 text-sm font-semibold shadow-md py-6">
                    <Send className="size-4" />
                    <Bilingual en="Send Message" ur="پیغام بھیجیں" layout="inline" />
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
