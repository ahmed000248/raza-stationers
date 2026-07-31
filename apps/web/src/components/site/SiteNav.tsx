"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, Menu, User, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { NotificationDropdown } from "@/components/site/NotificationDropdown"
import { Sheet, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { SignInModal } from "@/components/auth/SignInModal"

const navLinks = [
  { href: "/", en: "Home", ur: "صفحہ اول" },
  { href: "/catalogue", en: "Catalogue", ur: "کیٹلاگ" },
  { href: "/orders", en: "Orders", ur: "آرڈرز" },
  { href: "/about", en: "About", ur: "ہمارے بارے میں" },
  { href: "/contact", en: "Contact", ur: "رابطہ کریں" },
]

export function SiteNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const { accountStatus } = useAuth()
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [signInOpen, setSignInOpen] = React.useState(false)

  // Ponytail: Lightweight 2-line scroll listener instead of heavy library
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="sticky top-0 z-40 flex justify-center w-full px-4 pt-4 pb-2 transition-all">
      {/* Floating Pill Nav with Glass styling */}
      <nav
        className={cn(
          "glass relative flex items-center justify-between w-full max-w-none h-14 px-6 sm:px-8 rounded-full transition-all duration-200 border border-[var(--glass-border)] shadow-md",
          scrolled && "shadow-lg scale-[0.99]"
        )}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-evergreen-600)] text-white shadow-xs group-hover:scale-105 transition-transform">
            <BookOpen className="size-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading font-bold text-sm tracking-tight text-[var(--color-ink-900)]">
              Raza Stationers
            </span>
            <span dir="rtl" className="font-urdu text-[10px] text-muted-foreground">
              رضا اسٹیشنرز
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors hover:text-foreground",
                  isActive
                    ? "bg-black/10 text-[var(--color-ink-900)] font-semibold"
                    : "text-muted-foreground hover:bg-black/5"
                )}
              >
                <span className="flex items-center gap-1">
                  <span>{link.en}</span>
                  <span dir="rtl" className="font-urdu text-[10px] opacity-70">
                    {link.ur}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Dropdown (Glass) */}
          <NotificationDropdown />

          {/* Cart Trigger with Count Badge */}
          <Link
            href="/cart"
            className="relative flex size-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-black/5 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="size-4" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--color-evergreen-600)] text-[10px] font-bold text-white shadow-xs">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Sign In / Account Status Trigger */}
          <Button
            size="xs"
            variant={accountStatus === "approved" ? "secondary" : "default"}
            className="rounded-full px-3 gap-1 hidden sm:inline-flex"
            onClick={() => setSignInOpen(true)}
          >
            <User className="size-3" />
            <span>
              {accountStatus === "approved"
                ? "Wholesale Account"
                : accountStatus === "pending"
                ? "Pending Approval"
                : "Sign In"}
            </span>
          </Button>

          {/* SignIn Modal Component */}
          <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex md:hidden size-9 items-center justify-center rounded-full hover:bg-black/5 focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="left">
        <SheetClose onClick={() => setMobileOpen(false)} />
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-[var(--color-evergreen-600)]" />
            <Bilingual en="Raza Stationers" ur="رضا اسٹیشنرز" layout="inline" />
          </SheetTitle>
        </SheetHeader>
        <div className="py-6 flex flex-col gap-2 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <span>{link.en}</span>
              <span dir="rtl" className="font-urdu text-xs text-muted-foreground">
                {link.ur}
              </span>
            </Link>
          ))}
          <div className="mt-auto pt-6 border-t border-border">
            <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
              <Button className="w-full justify-center gap-2 rounded-full" variant="default">
                <User className="size-4" />
                <Bilingual en="Sign In to Account" ur="اکاؤنٹ میں سائن ان کریں" layout="inline" />
              </Button>
            </Link>
          </div>
        </div>
      </Sheet>
    </header>
  )
}
