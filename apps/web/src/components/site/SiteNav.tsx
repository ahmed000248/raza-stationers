"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingBag, UserRound } from "lucide-react"
import { BrandLogo } from "@/components/site/BrandLogo"
import { Sheet, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { cn } from "@/lib/utils"

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function SiteNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const { accountStatus } = useAuth()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const accountHref = accountStatus === "guest" ? `/signin?returnTo=${encodeURIComponent(pathname)}` : "/account"

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6 pointer-events-none">
      <nav
        aria-label="Primary navigation"
        className="pointer-events-auto mx-auto flex h-14 sm:h-16 w-full max-w-6xl items-center justify-between gap-4 rounded-2xl border border-border/80 bg-[var(--color-canvas)]/90 px-4 shadow-xs backdrop-blur-md sm:px-6"
      >
        <Link href="/" aria-label="Raza Stationers home" className="shrink-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring">
          <BrandLogo compact className="sm:hidden" />
          <BrandLogo className="hidden sm:inline-flex" />
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {primaryLinks.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
            return (
              <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
                className={cn("rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring", active ? "bg-[var(--color-mist-100)] text-[var(--color-ink-900)]" : "text-muted-foreground hover:text-foreground")}>
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <Link href={accountHref} aria-label={accountStatus === "guest" ? "Sign in" : "Open account"}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold text-[var(--color-ink-900)] hover:bg-[var(--color-mist-100)] focus:outline-none focus:ring-2 focus:ring-ring">
            <UserRound className="size-4" />
            <span className="hidden lg:inline">{accountStatus === "guest" ? "Sign in" : "Account"}</span>
          </Link>
          <Link href="/cart" aria-label={`Cart with ${totalItems} items`}
            className="relative inline-flex size-10 items-center justify-center rounded-xl text-[var(--color-ink-900)] hover:bg-[var(--color-mist-100)] focus:outline-none focus:ring-2 focus:ring-ring">
            <ShoppingBag className="size-4" />
            {totalItems > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-[var(--color-evergreen-600)] px-1 text-[10px] font-bold text-white">{totalItems}</span>}
          </Link>
          <button type="button" onClick={() => setMobileOpen(true)} className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-[var(--color-mist-100)] focus:outline-none focus:ring-2 focus:ring-ring md:hidden" aria-label="Open navigation menu">
            <Menu className="size-5" />
          </button>
        </div>
      </nav>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="left">
        <SheetClose onClick={() => setMobileOpen(false)} />
        <SheetHeader><SheetTitle><BrandLogo /></SheetTitle></SheetHeader>
        <div className="flex flex-1 flex-col gap-1 py-6">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={cn("rounded-xl px-4 py-3 text-sm font-semibold", pathname === link.href ? "bg-[var(--color-mist-100)]" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")}>{link.label}</Link>
          ))}
          <Link href="/orders" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground">Orders</Link>
          <Link href={accountHref} onClick={() => setMobileOpen(false)} className="mt-auto rounded-xl bg-[var(--color-evergreen-600)] px-4 py-3 text-center text-sm font-semibold text-white">
            {accountStatus === "guest" ? "Sign in to your account" : "Open your account"}
          </Link>
        </div>
      </Sheet>
    </header>
  )
}
