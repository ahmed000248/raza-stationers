"use client"

import * as React from "react"
import { ProductCard } from "@/components/catalogue/ProductCard"
import { StaggerList } from "@/components/motion/stagger-list"
import { useAuth } from "@/hooks/use-auth"
import { createAPIClient } from "@raza-stationers/api"
import { Sparkles, Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export function FeaturedSection() {
  const { pricingContext } = useAuth()
  const [products, setProducts] = React.useState<any[]>([])

  React.useEffect(() => {
    const api = createAPIClient({ baseUrl: API_BASE })
    api.getProducts({ limit: 4 }).then((d: any) => setProducts(d.items || [])).catch(() => {})
  }, [])

  return (
    <section className="py-12 px-6 bg-card/30 border-t border-border/40">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">FR-CAT-04 Featured Selection</span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink-900)]">Recently Restocked</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">Fresh wholesale inventory just arrived — order before stock runs out.</p>
        </div>
        {products.length === 0 ? (
          <div className="flex justify-center py-8"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p: any) => <ProductCard key={p.id} product={p} pricingContext={pricingContext} />)}
          </StaggerList>
        )}
      </div>
    </section>
  )
}
