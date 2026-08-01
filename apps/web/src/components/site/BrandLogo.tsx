import Image from "next/image"
import { cn } from "@/lib/utils"

export function BrandLogo({ compact = false, inverse = false, className }: { compact?: boolean; inverse?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <Image src="/brand-mark.svg" alt="" width={40} height={40} priority className="size-9 shrink-0 rounded-xl" />
      {!compact && (
        <span className="min-w-0 leading-tight">
          <span className={cn("block truncate font-heading text-sm font-bold tracking-tight", inverse ? "text-white" : "text-[var(--color-ink-900)]")}>Raza Stationers</span>
          <span className={cn("block truncate text-[10px] font-semibold tracking-[0.14em]", inverse ? "text-[var(--color-sage-400)]" : "text-[var(--color-evergreen-600)]")}>WHOLESALE · RETAIL</span>
        </span>
      )}
    </span>
  )
}
