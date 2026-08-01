import Image from "next/image"

export function BrandedLoader({ label = "Loading Raza Stationers…", fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return (
    <div role="status" aria-live="polite" className={fullScreen ? "flex min-h-screen items-center justify-center bg-[var(--color-canvas)] px-6" : "flex min-h-[45vh] items-center justify-center px-6"}>
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="relative grid size-16 place-items-center rounded-2xl bg-[var(--color-ink-900)] shadow-lg shadow-[var(--color-evergreen-600)]/20">
          <Image src="/brand-mark.svg" alt="" width={56} height={56} priority className="size-14 rounded-xl" />
          <span className="absolute inset-0 -z-10 rounded-2xl border-2 border-[var(--color-sage-400)] motion-safe:animate-ping motion-reduce:hidden" />
        </span>
        <div><p className="font-heading text-sm font-bold text-[var(--color-ink-900)]">Raza Stationers</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>
      </div>
    </div>
  )
}
