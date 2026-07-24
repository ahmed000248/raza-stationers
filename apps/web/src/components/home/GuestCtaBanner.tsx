import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { Building2, ArrowRight, ShieldCheck } from "lucide-react"

export function GuestCtaBanner() {
  return (
    <section className="py-16 px-6">
      <div className="mx-auto max-w-6xl relative overflow-hidden rounded-3xl bg-[var(--color-ink-900)] text-white p-8 sm:p-12 shadow-xl border border-[var(--color-forest-700)]">
        {/* Background Decorative Accents */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 size-64 rounded-full bg-[var(--color-evergreen-600)]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 size-64 rounded-full bg-[var(--color-amber-500)]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-[var(--color-mist-100)] backdrop-blur-xs">
            <Building2 className="size-3.5 text-[var(--color-amber-500)]" />
            <span>Own a Stationery Shop, School, or Office?</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            Register for a Raza Stationers Wholesale Account
          </h2>

          <p className="text-sm sm:text-base text-white/80 leading-relaxed">
            Apply today to access tiered pricing, 30-day credit terms (for approved accounts), priority stock notifications, and dedicated delivery scheduling across Pakistan.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/register">
              <Button size="lg" variant="default" className="rounded-full gap-2 bg-[var(--color-evergreen-600)] hover:bg-[var(--color-forest-700)] text-white shadow-md">
                <Bilingual en="Apply for Wholesale Account" ur="تھوک کھاتہ میں سائن ان کریں" layout="inline" />
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <Link href="/contact">
              <Button size="lg" variant="outline" className="rounded-full text-white border-white/30 hover:bg-white/10">
                <span>Talk to Sales Representative</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
