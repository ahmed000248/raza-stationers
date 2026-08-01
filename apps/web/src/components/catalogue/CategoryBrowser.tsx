"use client"

import * as React from "react"
import { FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function CategoryBrowser({ categories, selectedSlug, onSelect, variant = "desktop" }: { categories: any[]; selectedSlug: string | null; onSelect: (slug: string | null) => void; variant?: "desktop" | "mobile" }) {
  const [open, setOpen] = React.useState(false)
  const visible = categories.slice(0, 6)
  const categoryList = (close = false) => (
    <div className="space-y-1">
      <button type="button" onClick={() => { onSelect(null); if (close) setOpen(false) }} className={cn("w-full rounded-lg px-3 py-2 text-left text-xs font-semibold", !selectedSlug ? "bg-[var(--color-mist-100)] text-[var(--color-ink-900)]" : "text-muted-foreground hover:bg-muted")}>All products</button>
      {categories.map((category) => <button key={category.slug} type="button" onClick={() => { onSelect(category.slug); if (close) setOpen(false) }} className={cn("w-full rounded-lg px-3 py-2 text-left text-xs font-medium", selectedSlug === category.slug ? "bg-[var(--color-evergreen-600)] text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>{category.name}</button>)}
    </div>
  )

  return (
    <>
      {variant === "desktop" && <aside className="hidden w-56 shrink-0 lg:block" aria-label="Product categories">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-3"><h2 className="mb-2 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-[var(--color-ink-900)]"><FolderTree className="size-4" />Categories</h2>{categoryList()}</div>
      </aside>}
      {variant === "mobile" && <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <button type="button" onClick={() => onSelect(null)} className={cn("min-h-10 shrink-0 rounded-xl px-3 text-xs font-semibold", !selectedSlug ? "bg-[var(--color-evergreen-600)] text-white" : "bg-muted text-muted-foreground")}>All</button>
          {visible.map((category) => <button key={category.slug} type="button" onClick={() => onSelect(category.slug)} className={cn("min-h-10 shrink-0 rounded-xl px-3 text-xs font-semibold", selectedSlug === category.slug ? "bg-[var(--color-evergreen-600)] text-white" : "bg-muted text-muted-foreground")}>{category.name}</button>)}
          <Button type="button" variant="outline" className="min-h-10 shrink-0 rounded-xl text-xs" onClick={() => setOpen(true)}>Show all categories</Button>
        </div>
      </div>}
      {variant === "mobile" && <Sheet open={open} onOpenChange={setOpen} side="left"><SheetClose onClick={() => setOpen(false)} /><SheetHeader><SheetTitle>All categories</SheetTitle></SheetHeader><div className="mt-4 flex-1 overflow-y-auto">{categoryList(true)}</div></Sheet>}
    </>
  )
}
