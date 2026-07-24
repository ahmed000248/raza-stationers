import * as React from "react"
import { cn } from "@/lib/utils"

interface BilingualProps extends React.HTMLAttributes<HTMLSpanElement> {
  en: string
  ur: string
  layout?: "stacked" | "inline" | "reverse-stacked"
  enClassName?: string
  urClassName?: string
}

/**
 * FR-LNG-01: Bilingual English + Urdu Label Pattern
 * Standardized dual-language component rendering English (Poppins/sans)
 * and Urdu (Noto Nastaliq Urdu) with appropriate alignment and layout options.
 */
function Bilingual({
  en,
  ur,
  layout = "stacked",
  enClassName,
  urClassName,
  className,
  ...props
}: BilingualProps) {
  if (layout === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)} {...props}>
        <span className={cn("font-sans", enClassName)}>{en}</span>
        <span className="text-muted-foreground/50 select-none">•</span>
        <span dir="rtl" className={cn("font-urdu text-[0.95em] leading-normal", urClassName)}>
          {ur}
        </span>
      </span>
    )
  }

  if (layout === "reverse-stacked") {
    return (
      <span className={cn("inline-flex flex-col leading-snug", className)} {...props}>
        <span dir="rtl" className={cn("font-urdu text-[1.05em] leading-normal text-muted-foreground", urClassName)}>
          {ur}
        </span>
        <span className={cn("font-sans font-medium", enClassName)}>{en}</span>
      </span>
    )
  }

  return (
    <span className={cn("inline-flex flex-col leading-snug", className)} {...props}>
      <span className={cn("font-sans font-medium", enClassName)}>{en}</span>
      <span dir="rtl" className={cn("font-urdu text-[0.9em] leading-normal text-muted-foreground", urClassName)}>
        {ur}
      </span>
    </span>
  )
}

export { Bilingual }
