"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ShoppingBag, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Bilingual } from "@/components/ui/bilingual"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
  onAdd: () => void
  disabled?: boolean
  className?: string
}

/**
 * AddToCartButton Component
 * Single expressive spring/bounce moment exception allowed on the site per design-system decision.
 */
export function AddToCartButton({ onAdd, disabled = false, className }: AddToCartButtonProps) {
  const [added, setAdded] = React.useState(false)
  const shouldReduceMotion = useReducedMotion()

  const handleClick = () => {
    if (disabled || added) return
    onAdd()
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.05 }
          : { type: "spring", stiffness: 420, damping: 16 }
      }
      className={cn("w-full sm:w-auto", className)}
    >
      <Button
        size="lg"
        variant={added ? "secondary" : "default"}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "w-full sm:min-w-[200px] rounded-full gap-2 text-sm font-semibold shadow-md transition-colors",
          added && "bg-[var(--color-evergreen-600)] text-white"
        )}
      >
        {added ? (
          <>
            <Check className="size-4 animate-bounce" />
            <span>Added to Cart!</span>
          </>
        ) : (
          <>
            <ShoppingBag className="size-4" />
            <Bilingual en="Add to Cart" ur="ٹوکری میں شامل کریں" layout="inline" />
          </>
        )}
      </Button>
    </motion.div>
  )
}
