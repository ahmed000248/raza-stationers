import Link from "next/link"
import { BookOpen, Phone, MapPin, ShieldCheck, Truck } from "lucide-react"
import { Bilingual } from "@/components/ui/bilingual"

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[var(--color-ink-900)] text-white/90 border-t border-[var(--color-forest-700)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-[var(--color-evergreen-600)] text-white shadow-xs">
                <BookOpen className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-base font-bold tracking-tight text-white">
                  Raza Stationers
                </span>
                <span dir="rtl" className="font-urdu text-xs text-[var(--color-sage-400)]">
                  رضا اسٹیشنرز
                </span>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Premier wholesale & retail stationers supplying quality paper, notebooks, pens, and office supplies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[var(--color-sage-400)] mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  <Bilingual en="Home" ur="صفحہ اول" layout="inline" />
                </Link>
              </li>
              <li>
                <Link href="/catalogue" className="hover:text-white transition-colors">
                  <Bilingual en="Product Catalogue" ur="پروڈکٹ کیٹلاگ" layout="inline" />
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  <Bilingual en="Order Tracking" ur="آرڈر ٹریکنگ" layout="inline" />
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  <Bilingual en="Wholesale Registration" ur="تھوک کھاتہ رجسٹریشن" layout="inline" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Delivery Info */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[var(--color-sage-400)] mb-3">
              Delivery & Terms
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75">
              <li className="flex items-start gap-2">
                <Truck className="size-4 shrink-0 text-[var(--color-amber-500)] mt-0.5" />
                <span>Karachi & major Punjab delivery zones supported.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="size-4 shrink-0 text-[var(--color-amber-500)] mt-0.5" />
                <span>Verified business account approval required for wholesale credit.</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[var(--color-sage-400)] mb-3">
              Contact Us
            </h4>
            <div className="space-y-2 text-xs text-white/75">
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-[var(--color-amber-500)]" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-[var(--color-amber-500)] shrink-0 mt-0.5" />
                <span>Stationery Market, Karachi, Pakistan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[var(--color-forest-700)]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Raza Stationers. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
