export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-8 bg-[var(--canvas)] text-[var(--ink-900)]">
      <main className="w-full max-w-2xl flex flex-col gap-6 p-8 rounded-[var(--radius-lg)] bg-[var(--white)] border border-[var(--border-subtle)]">
        <div className="space-y-1">
          <span className="text-[var(--text-muted)] text-sm font-medium uppercase tracking-wider">
            Phase 0 — Design System Sanity Check
          </span>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-[var(--ink-900)]">
            Raza Stationers
          </h1>
          <p className="text-xl font-bold font-[family-name:var(--font-urdu)] text-[var(--evergreen-600)]" dir="rtl">
            راضا اسٹیشنرز — ہول سیل اور ریٹیل
          </p>
        </div>

        <p className="text-base text-[var(--text-muted)] leading-relaxed">
          Quality notebooks, pens and office supplies — wholesale pricing for registered shops.
        </p>

        {/* Color Palette Specimen Swatches */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase text-[var(--text-muted)] tracking-wider">
            Palette Tokens
          </h2>
          <div className="grid grid-cols-4 gap-2 text-xs font-medium text-center">
            <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--ink-900)] text-[var(--white)]">
              Primary Ink
            </div>
            <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--forest-800)] text-[var(--white)]">
              Deep Forest
            </div>
            <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--forest-700)] text-[var(--white)]">
              Forest
            </div>
            <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--evergreen-600)] text-[var(--white)]">
              Evergreen
            </div>
            <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--sage-400)] text-[var(--ink-900)]">
              Sage
            </div>
            <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--mist-100)] text-[var(--ink-900)]">
              Mist
            </div>
            <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--canvas)] text-[var(--ink-900)] border border-[var(--border-subtle)]">
              Canvas
            </div>
            <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--amber-500)] text-[var(--ink-900)]">
              Amber
            </div>
          </div>
        </div>

        {/* Radius & Pill Specimen */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button className="px-5 py-2.5 min-h-[44px] rounded-full bg-[var(--evergreen-600)] hover:bg-[var(--forest-700)] text-[var(--white)] font-medium text-sm transition-colors">
            Pill Primary Button (999px)
          </button>
          <div className="glass px-4 py-2 rounded-full text-xs font-semibold text-[var(--ink-900)]">
            Liquid Glass Utility Token
          </div>
        </div>
      </main>
    </div>
  );
}
