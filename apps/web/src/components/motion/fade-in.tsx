"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  distance?: number
  children: React.ReactNode
}

/**
 * FadeIn Component
 * Accessible, reduced-motion-safe entrance wrapper for elements.
 */
function FadeIn({
  delay = 0,
  duration = 0.25,
  direction = "up",
  distance = 12,
  children,
  className,
  ...props
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion()

  const getOffset = () => {
    if (shouldReduceMotion || direction === "none") return { x: 0, y: 0 }
    switch (direction) {
      case "up":
        return { x: 0, y: distance }
      case "down":
        return { x: 0, y: -distance }
      case "left":
        return { x: distance, y: 0 }
      case "right":
        return { x: -distance, y: 0 }
    }
  }

  const offset = getOffset()

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.05 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: "easeOut" as const,
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { FadeIn }
