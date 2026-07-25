import Link from "next/link"
import { mockCategories } from "@/content/mock/products"
import { ProductIconBlock } from "@/components/ui/product-icon-block"
import { ArrowUpRight } from "lucide-react"

export function CategorySection() {
  return (
    <section className="py-12 px-6 border-t border-border/40">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">
              Catalogue Categories
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink-900)] mt-1">
              Browse by Product Category
            </h2>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-evergreen-600)] hover:underline"
          >
            <span>View Full Catalogue</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockCategories.map((cat) => {
            const categoryKey = cat.id.replace("cat-", "") as "paper" | "pens" | "office" | "files" | "cutting" | "art" | "general"
            return (
              <Link
                key={cat.id}
                href={`/catalogue?category=${cat.id}`}
                className="group flex flex-col items-center text-center p-4 rounded-2xl border border-border bg-card shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <ProductIconBlock
                  category={categoryKey}
                  size="md"
                  className="mb-3 w-full rounded-xl"
                />
                <h4 className="font-heading font-semibold text-xs text-[var(--color-ink-900)] group-hover:text-[var(--color-evergreen-600)] transition-colors">
                  {cat.name}
                </h4>
                {cat.nameUrdu && (
                  <span dir="rtl" className="font-urdu text-[11px] text-muted-foreground mt-0.5">
                    {cat.nameUrdu}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
