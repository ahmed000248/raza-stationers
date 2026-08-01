import Image from "next/image"

export function BrandedLoader({ label = "Securing the operations portal…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center bg-[var(--canvas)] px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="relative grid size-16 place-items-center rounded-2xl bg-[var(--ink-900)] shadow-lg">
          <Image src="/brand-mark.svg" alt="" width={56} height={56} priority className="size-14 rounded-xl" />
          <span className="absolute inset-0 -z-10 rounded-2xl border-2 border-[var(--sage-400)] motion-safe:animate-ping motion-reduce:hidden" />
        </span>
        <div><p className="font-heading text-sm font-bold text-[var(--ink-900)]">Raza Stationers</p><p className="mt-1 text-xs text-[var(--text-muted)]">{label}</p></div>
      </div>
    </div>
  )
}
