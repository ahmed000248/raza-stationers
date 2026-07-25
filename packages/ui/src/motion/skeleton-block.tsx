"use client"

import * as React from "react"
import { useReducedMotion } from "framer-motion"
import { cn } from "../lib/utils"

interface SkeletonBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: string | number
  width?: string | number
}

/**
 * SkeletonBlock Component
 * Reusable skeleton with pulse animation that gracefully disables pulsing
 * when prefers-reduced-motion is active.
 */
function SkeletonBlock({
  height,
  width,
  className,
  style,
  ...props
}: SkeletonBlockProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      style={{
        height,
        width,
        ...style,
      }}
      className={cn(
        "rounded-md bg-muted/60",
        shouldReduceMotion ? "opacity-75" : "animate-pulse",
        className
      )}
      {...props}
    />
  )
}

export { SkeletonBlock }
