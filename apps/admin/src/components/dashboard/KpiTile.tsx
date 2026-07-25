"use client"

import * as React from "react"

interface KpiTileProps {
  label: string
  urdu: string
  targetValue: number
  subText: string
  toneColor: string
  locked?: boolean
}

export function KpiTile({ label, urdu, targetValue, subText, toneColor, locked = false }: KpiTileProps) {
  const [count, setCount] = React.useState<number>(0)

  React.useEffect(() => {
    if (locked) return

    // Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      setCount(targetValue)
      return
    }

    let animationFrameId: number
    const startTime = performance.now()
    const duration = 700 // ms

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration)
      // Ease-out cubic formula: 1 - (1 - progress)^3
      const easeOutProgress = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(targetValue * easeOutProgress))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      }
    }

    animationFrameId = requestAnimationFrame(step)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [targetValue, locked])

  return (
    <div className="bg-white border border-[var(--border-subtle)] rounded-[16px] p-[22px] relative overflow-hidden shadow-xs hover:border-[var(--sage-400)] transition-colors">
      {locked && (
        <div className="absolute top-3.5 right-3.5 bg-[var(--mist-100)] text-[var(--forest-700)] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[var(--border-subtle)]">
          🔒 Owner only
        </div>
      )}
      <div className="text-[12.5px] text-[var(--text-muted)] font-medium flex items-center gap-1.5">
        <span>{label}</span>
        <span dir="rtl" className="font-urdu text-[12px]">
          {urdu}
        </span>
      </div>
      <div className="text-[32px] font-bold mt-2.5 text-[var(--ink-900)] tracking-tight">
        {locked ? "—" : count}
      </div>
      <div className="text-[12px] font-semibold mt-1.5" style={{ color: toneColor }}>
        {locked ? "Access restricted" : subText}
      </div>
    </div>
  )
}
