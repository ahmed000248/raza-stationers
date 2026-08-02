import * as React from "react"
import Link from "next/link"
import { Bilingual } from "@/components/ui/bilingual"
import { Button } from "@/components/ui/button"
import { BookOpen, ShieldCheck, Truck, Award, MapPin, ArrowRight } from "lucide-react"

export const metadata = {
  title: "About Us | Raza Stationers",
  description: "Learn about Raza Stationers, owned by Nafaj Taj and Kamran Malik in Wah Cantt.",
}

export default function AboutPage() {
  return (
    <div className="py-12 px-6 min-h-screen space-y-16">
      <div className="mx-auto max-w-none w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-[var(--color-evergreen-600)] text-white shadow-md mb-2">
            <BookOpen className="size-8" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)] block">
            Brand Story & Heritage
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-ink-900)]">
            Wholesale & Retail Stationery Excellence
          </h1>
          <p dir="rtl" className="font-urdu text-xl text-[var(--color-evergreen-600)] font-semibold">
            رضا اسٹیشنرز — معیاری اور سستی ہول سیل اسٹیشنری کا بااعتماد نام
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Owned and managed by <strong>Nafaj Taj and Kamran Malik</strong>, Raza Stationers is a trusted wholesale paper merchant and office stationery supplier based at Main GT Road, New City Phase 1, Wah Cantt.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-3">
            <div className="size-10 rounded-2xl bg-[var(--color-evergreen-600)]/10 text-[var(--color-evergreen-600)] flex items-center justify-center font-bold">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--color-ink-900)]">
              Direct Mill Sourcing
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We source paper, registers, and writing supplies directly from top paper mills and manufacturers, ensuring competitive wholesale rates for registered shops.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-3">
            <div className="size-10 rounded-2xl bg-[var(--color-evergreen-600)]/10 text-[var(--color-evergreen-600)] flex items-center justify-center font-bold">
              <Truck className="size-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--color-ink-900)]">
              Dedicated Delivery Zones
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our fleet handles door-to-door delivery across Wah Cantt, Hassan Abdal, Taxila, and Rawalpindi.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-3">
            <div className="size-10 rounded-2xl bg-[var(--color-evergreen-600)]/10 text-[var(--color-evergreen-600)] flex items-center justify-center font-bold">
              <Award className="size-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--color-ink-900)]">
              Wholesale Business Credit
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We support long-standing retail shop partners with revolving credit limits and transparent invoicing documentation.
            </p>
          </div>
        </div>

        {/* Heritage Story Section */}
        <div className="p-8 sm:p-10 rounded-3xl border border-border bg-card space-y-6">
          <div className="flex items-center gap-3">
            <MapPin className="size-6 text-[var(--color-evergreen-600)]" />
            <h2 className="font-heading font-bold text-2xl text-[var(--color-ink-900)]">
              Wah Cantt Headquarters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <div className="space-y-3">
              <p>
                Located at <strong>Main GT Road, New City Phase 1, Wah Cantt</strong>, Raza Stationers is led by Nafaj Taj and Kamran Malik. We established our reputation on honest pricing, strict quality standards, and genuine customer care.
              </p>
              <p>
                We serve retail stationery shops, educational institutions, book depots, and corporate offices across Wah Cantt, Hassan Abdal, Taxila, and Rawalpindi.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-muted/40 border border-border">
              <h4 className="font-heading font-bold text-sm text-[var(--color-ink-900)]">
                Our Commitment to Wholesale Partners
              </h4>
              <ul className="space-y-2 list-disc list-inside text-xs">
                <li>Strict tier-based pricing privacy</li>
                <li>Clear unit conversion formats (Piece, Dozen, Pack, Carton)</li>
                <li>Digital tax invoice generation and order tracking</li>
                <li>Dedicated phone support & WhatsApp ordering (03125120693)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--color-ink-900)] text-white text-center space-y-6 shadow-lg">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight">
            Ready to Supply Your Shop at Wholesale Prices?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto">
            Register your shop credentials today and start saving on paper, registers, pens, and office files.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="rounded-full gap-2 font-semibold">
                <Bilingual en="Register Wholesale Account" ur="ہول سیل اکاؤنٹ بنائیں" layout="inline" />
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <Link href="/catalogue">
              <Button size="lg" variant="outline" className="rounded-full gap-2 font-semibold text-white border-white/40 hover:bg-white/10">
                <span>Browse Product Catalogue</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
