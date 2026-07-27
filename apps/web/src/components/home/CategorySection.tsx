import Link from "next/link"
import { ProductIconBlock } from "@/components/ui/product-icon-block"
import { ArrowUpRight } from "lucide-react"

const HOME_CATEGORIES = [
  { id: "paper", name: "Paper" }, { id: "pens", name: "Pens" },
  { id: "office", name: "Office" }, { id: "files", name: "Files" },
  { id: "cutting", name: "Cutting" }, { id: "art", name: "Art" },
  { id: "general", name: "General" }, { id: "books", name: "Books" },
]

export function CategorySection() {
  return (
    <section className="py-12 px-6 border-t border-border/40">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">FR-CAT-02 Browse Category</span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink-900)]">Stationery Categories</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">Explore our wholesale catalogue sorted by product family.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {HOME_CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/catalogue?category=${cat.id}`}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border hover:border-foreground/30 bg-card transition-all hover:shadow-xs group">
              <ProductIconBlock category={cat.id as any} size="md" className="opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="text-[11px] font-semibold text-center text-muted-foreground group-hover:text-foreground leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link href="/catalogue" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-evergreen-600)] hover:underline">
            <span>Browse Full Catalogue</span><ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
