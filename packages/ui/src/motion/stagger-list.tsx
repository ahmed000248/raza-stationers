"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion"
import { cn } from "../lib/utils"

interface StaggerListProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number
  maxTotalStagger?: number
  children: React.ReactNode
}

/**
 * StaggerList Component
 * Capped stagger wrapper for lists/grids enforcing total stagger duration < 300ms
 * for clean non-jarring UI micro-animations and accessibility compliance.
 */
function StaggerList({
  staggerDelay = 0.04,
  maxTotalStagger = 0.28,
  children,
  className,
  ...props
}: StaggerListProps) {
  const shouldReduceMotion = useReducedMotion()
  const childArray = React.Children.toArray(children)
  const totalCount = childArray.length

  // Calculate actual per-item stagger so total never exceeds maxTotalStagger cap
  const effectiveStagger = totalCount > 1
    ? Math.min(staggerDelay, maxTotalStagger / totalCount)
    : staggerDelay

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : effectiveStagger,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.05 : 0.2, ease: "easeOut" as const },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(className)}
      {...props}
    >
      {childArray.map((child, idx) => (
        <motion.div key={idx} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

export { StaggerList }
