import * as React from "react"
import { SUPPORTED_DELIVERY_CITIES } from "@raza-stationers/validation"
import { Truck, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DeliveryZoneNoticeProps {
  selectedCity?: string
  errorMessage?: string
  className?: string
}

export function DeliveryZoneNotice({ selectedCity, errorMessage, className }: DeliveryZoneNoticeProps) {
  return (
    <div className={cn("space-y-3 p-4 rounded-xl border bg-card text-xs", className)}>
      <div className="flex items-center justify-between">
        <span className="font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)] flex items-center gap-1.5">
          <Truck className="size-4" />
          <span>OF-04 Delivery Zones</span>
        </span>
        <span className="text-[11px] text-muted-foreground">Karachi & Punjab Major Cities</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground font-medium mr-1">Supported Cities:</span>
        {SUPPORTED_DELIVERY_CITIES.map((city) => (
          <span
            key={city}
            className={cn(
              "px-2 py-0.5 rounded-full border text-[11px] font-medium transition-colors",
              selectedCity?.toLowerCase() === city.toLowerCase()
                ? "bg-[var(--color-evergreen-600)] text-white border-[var(--color-evergreen-600)]"
                : "bg-muted/50 border-border text-muted-foreground"
            )}
          >
            {city}
          </span>
        ))}
      </div>

      {errorMessage ? (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive flex items-start gap-2 animate-shake">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{errorMessage}</span>
        </div>
      ) : selectedCity ? (
        <div className="flex items-center gap-1.5 text-[var(--color-evergreen-600)] font-medium text-[11px]">
          <CheckCircle2 className="size-3.5" />
          <span>{selectedCity} is covered by our next-day delivery zone!</span>
        </div>
      ) : null}
    </div>
  )
}
