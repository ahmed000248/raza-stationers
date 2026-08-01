"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { usePathname } from "next/navigation"

/**
 * FloatingCartFAB — a sticky floating action button that shows the cart item
 * count. Visible on all pages except /cart and /checkout.
 * Includes a fly-to-cart animation: when totalItems increases, a "burst"
 * badge animates from origin to the FAB.
 *
 * ponytail: uses framer-motion (already installed); no extra deps.
 */
export function FloatingCartFAB() {
  const { totalItems } = useCart()
  const pathname = usePathname()
  const prevItemCount = React.useRef(totalItems)
  const [showBurst, setShowBurst] = React.useState(false)

  // Hide on cart and checkout pages — the full cart UI is already visible
  const hidden = pathname === "/cart" || pathname === "/checkout"

  React.useEffect(() => {
    if (totalItems > prevItemCount.current) {
      setShowBurst(true)
      const t = setTimeout(() => setShowBurst(false), 700)
      prevItemCount.current = totalItems
      return () => clearTimeout(t)
    }
    prevItemCount.current = totalItems
  }, [totalItems])

  if (hidden) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      aria-label="Floating cart button"
      id="floating-cart-fab"
    >
      {/* Fly-to-cart burst ring animation */}
      <AnimatePresence>
        {showBurst && (
          <motion.span
            key="burst"
            className="absolute inset-0 rounded-full bg-[var(--color-evergreen-600)]"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <Link href="/cart" aria-label={`View cart — ${totalItems} items`}>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="relative flex size-14 items-center justify-center rounded-full bg-[var(--color-evergreen-600)] text-white shadow-lg hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--color-evergreen-600)] focus:ring-offset-2"
        >
          <ShoppingBag className="size-6" />

          <AnimatePresence>
            {totalItems > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="absolute -top-1 -right-1 flex min-w-[20px] h-5 items-center justify-center rounded-full bg-white text-[var(--color-evergreen-600)] text-[11px] font-bold px-1 shadow-sm"
              >
                {totalItems > 99 ? "99+" : totalItems}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </Link>
    </div>
  )
}
