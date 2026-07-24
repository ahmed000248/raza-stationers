"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bilingual } from "@/components/ui/bilingual"
import { ProductIconBlock } from "@/components/ui/product-icon-block"
import { useCart } from "@/hooks/use-cart"
import { ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const { addItem } = useCart()

  const handleTestAddToCart = () => {
    addItem({
      id: "prod-sample-1",
      title: "Evergreen A4 Rim (80gsm)",
      price: 850,
      unit: "Rim",
      category: "paper",
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] py-12 px-6">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <Badge variant="mist" className="px-3 py-1">
          <Bilingual en="Phase 2 — Site Shell Active" ur="سائٹ شیل فعال" layout="inline" />
        </Badge>

        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-[var(--color-ink-900)] leading-tight">
          Quality Wholesale & Retail Stationery
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
          Supplying premium paper, notebooks, pens, and office supplies with wholesale pricing for verified shop owners across Pakistan.
        </p>

        {/* Feature Specimen Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs">
            <ProductIconBlock category="paper" size="sm" className="mb-3" />
            <h3 className="font-heading font-semibold text-sm">Paper & Notebooks</h3>
            <p className="mt-1 text-xs text-muted-foreground">High grade 80gsm rim bundles and register books.</p>
          </div>
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs">
            <ProductIconBlock category="pens" size="sm" className="mb-3" />
            <h3 className="font-heading font-semibold text-sm">Writing Instruments</h3>
            <p className="mt-1 text-xs text-muted-foreground">Gel pens, ballpoints, markers, and ink supplies.</p>
          </div>
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs">
            <ProductIconBlock category="office" size="sm" className="mb-3" />
            <h3 className="font-heading font-semibold text-sm">Office & Files</h3>
            <p className="mt-1 text-xs text-muted-foreground">Box files, ring binders, staplers, and desk tools.</p>
          </div>
        </div>

        {/* Shell Interaction Test CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button onClick={handleTestAddToCart} variant="default" className="rounded-full gap-2">
            <ShoppingBag className="size-4" />
            <span>Test Add Item to Cart</span>
          </Button>

          <Link href="/dev/components">
            <Button variant="outline" className="rounded-full gap-2">
              <span>View Component Library Showcase</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
