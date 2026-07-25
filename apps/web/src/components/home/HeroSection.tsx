"use client"

import * as React from "react"
import Link from "next/link"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bilingual } from "@/components/ui/bilingual"
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, Percent } from "lucide-react"

export function HeroSection() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const heroTextRef = React.useRef<HTMLDivElement>(null)
  const isoCardsRef = React.useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

        tl.from(heroTextRef.current?.children || [], {
          y: 24,
          opacity: 0,
          stagger: 0.12,
          duration: 0.8,
        }).from(
          isoCardsRef.current?.children || [],
          {
            y: 40,
            opacity: 0,
            rotateX: 15,
            rotateY: -15,
            stagger: 0.15,
            duration: 0.9,
          },
          "-=0.5"
        )
      })

      return () => mm.revert()
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="relative overflow-hidden py-12 md:py-20 px-6">
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline & Action */}
        <div ref={heroTextRef} className="lg:col-span-7 space-y-6">
          <Badge variant="mist" className="px-3.5 py-1 text-xs">
            <Bilingual en="Official Wholesale Stationers" ur="آفیشل ہول سیل اسٹیشنرز" layout="inline" />
          </Badge>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-ink-900)] leading-[1.1]">
            Direct Wholesale Stationery for Registered Shops & Offices
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
            Streamline your inventory with high-grade paper rims, registers, pens, and office supplies. Verified business accounts unlock tiered pricing and flexible payment terms.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/catalogue">
              <Button size="lg" variant="default" className="rounded-full gap-2 px-6 shadow-md">
                <ShoppingBag className="size-4" />
                <Bilingual en="Browse Catalogue" ur="کیٹلاگ دیکھیں" layout="inline" />
              </Button>
            </Link>

            <Link href="/register">
              <Button size="lg" variant="outline" className="rounded-full gap-2 px-6">
                <span>Apply for Wholesale Account</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>

          {/* Value Props */}
          <div className="pt-6 border-t border-border/60 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[var(--color-evergreen-600)] shrink-0" />
              <span>Verified Credit Terms</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-[var(--color-evergreen-600)] shrink-0" />
              <span>Direct Zone Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="size-4 text-[var(--color-evergreen-600)] shrink-0" />
              <span>Tiered Wholesale Rates</span>
            </div>
          </div>
        </div>

        {/* Right Column: Isometric 3D Stationery Cards Composition */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div
            ref={isoCardsRef}
            className="relative w-full max-w-sm h-80 flex items-center justify-center [perspective:1000px]"
          >
            {/* Card 1: Paper Rims */}
            <div className="absolute top-0 right-4 w-64 p-5 rounded-2xl bg-[var(--color-evergreen-600)] text-white shadow-xl transform [rotateX(12deg)] [rotateY(-12deg)] transition-transform hover:scale-105">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-mist-100)] mb-1">
                Bulk Stock
              </div>
              <h4 className="font-heading font-semibold text-base mb-1">A4 Photocopy Rims</h4>
              <p className="text-xs text-white/80">80gsm 500-sheet packs in stock.</p>
              <div className="mt-3 text-right font-heading font-bold text-lg text-[var(--color-amber-500)]">
                Rs. 1,250
              </div>
            </div>

            {/* Card 2: Registers */}
            <div className="absolute top-20 left-0 w-64 p-5 rounded-2xl bg-background border border-border shadow-xl transform [rotateX(12deg)] [rotateY(-12deg)] transition-transform hover:scale-105">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-evergreen-600)] mb-1">
                Shop Registers
              </div>
              <h4 className="font-heading font-semibold text-base mb-1">Bahi Khata 400P</h4>
              <p className="text-xs text-muted-foreground">Bound accounting books.</p>
              <div className="mt-3 text-right font-heading font-bold text-lg text-[var(--color-evergreen-600)]">
                Rs. 480
              </div>
            </div>

            {/* Floating Trust Pill */}
            <div className="absolute bottom-4 right-8 glass px-4 py-2 rounded-full border border-[var(--glass-border)] text-xs font-semibold text-[var(--color-ink-900)] shadow-lg">
              ✨ 100% Genuine Stationery
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
