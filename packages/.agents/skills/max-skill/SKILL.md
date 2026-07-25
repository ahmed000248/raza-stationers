---
name: max-skill
description: Master motion, design, and knowledge orchestration skill combining animate, design-motion-principles, gsap, graphify, and impeccable into a unified workflow. Use when designing, building, animating, auditing, or refactoring UI components and pages in Next.js / React applications.
---

# Max-Skill: Master Motion & Design Orchestration Skill

`max-skill` is the unified master workflow that orchestrates **all** motion, design quality, and codebase intelligence skills installed in this workspace:

1. **`animate`**: Emil Kowalski motion patterns and Framer Motion recipes (modals, toasts, hover states, shared layout morphs).
2. **`design-motion-principles`**: 3-designer perspective (Emil Kowalski restraint, Jakub Krehel polish, Jhey Tompkins playfulness) + anti-AI-slop audit rules.
3. **`gsap`**: GSAP 3 timeline engine, ScrollTrigger, ScrollSmoother, SplitText, MorphSVGPlugin, DrawSVGPlugin, Flip, InertiaPlugin, Draggable, and `@gsap/react` `useGSAP` hook.
4. **`graphify`**: Codebase knowledge graph querying (`graphify query`) and incremental graph maintenance (`graphify --update`).
5. **`impeccable`**: Frontend design system alignment, UX shaping (`/impeccable shape`), component audit (`/impeccable audit`), and design polish (`/impeccable polish`).

---

## 5-Phase Workflow Execution Pipeline

Whenever building or enhancing a page or component, execute the following 5 phases in sequence:

```
[1. Query & Context] ──► [2. UX Shaping] ──► [3. Motion Engineering] ──► [4. Anti-Slop Audit] ──► [5. Polish & Sync]
  Graphify + PRODUCT.md    Impeccable Shape      GSAP + Framer Motion       3-Lens Motion Audit       Graphify --update
```

---

### Phase 1: Context & Knowledge Querying (`graphify` + `PRODUCT.md`)
- Before writing code, consult `graphify-out/graph.json` via `graphify query "<feature>"` or check existing components in `src/components/`.
- Review [PRODUCT.md](file:///d:/Projects/Raza%20Stationers/PRODUCT.md) to ensure design language aligns with business logic and user personas (e.g. non-technical retail/wholesale users, clear Urdu/English labeling, mobile data performance).

---

### Phase 2: UX Shaping (`impeccable` + `design-motion-principles`)
- Plan layout, typography hierarchy, and interaction flow (`/impeccable shape`).
- Decide the motion style based on designer weighting:
  - **Product / Data Views**: Emil Kowalski restraint (fast 150-200ms transitions, zero layout shift).
  - **Hero & Marketing Sections**: Jakub Krehel polish (GSAP ScrollTrigger, smooth inertia, refined typography).
  - **Interactive Micro-actions**: Jhey Tompkins playfulness (subtle morphs, responsive hover states).

---

### Phase 3: Motion Engineering (`gsap` + `animate`)
- Use **`framer-motion`** for component mounting/unmounting (`AnimatePresence`), layout morphs (`layoutId`), and simple gestures.
- Use **`gsap`** and the `useGSAP` hook from `@/lib/gsap` for complex timeline animations, ScrollTrigger scroll effects, SplitText typography, and SVG morphs/drawings.

#### Standard Next.js Client Component Template
```tsx
'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap, useGSAP, ScrollTrigger, SplitText } from '@/lib/gsap';
import { Button } from '@/components/ui/button';

interface MotionCardProps {
  title: string;
  subtitle: string;
}

export function MotionCard({ title, subtitle }: MotionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Split text animation on title
    const split = new SplitText('.card-title', { type: 'chars' });
    gsap.from(split.chars, {
      opacity: 0,
      y: 15,
      stagger: 0.02,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 85%',
      },
    });
  }, { scope: cardRef });

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="p-6 rounded-xl bg-card text-card-foreground border border-border shadow-sm"
    >
      <h3 className="card-title text-xl font-bold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}
```

---

### Phase 4: Anti-AI-Slop Motion Audit (`design-motion-principles` + `impeccable`)
Run audit rules before approving any UI component:
- ❌ **No Excessive Bounce**: Avoid over-exaggerated spring bounces (`bounce: 0.8`) on simple UI buttons or modals.
- ❌ **No Stagger Spam**: Do not delay list items by more than 30ms per item. Total stagger duration must remain under 300ms.
- ❌ **No Unwanted Pulsing**: Do not add infinite pulsing scale loops to passive indicators.
- ❌ **No Purple-Gradient Generic Look**: Use curated dark/light HSL tokens from `globals.css`.

---

### Phase 5: Polish & Knowledge Sync (`graphify` + `git`)
- Perform final design-system audit (`/impeccable polish`).
- Update knowledge graph incrementally (`graphify extract . --code-only` or `--update`).
- Commit changes — the automated git hook (`graphify hook install`) updates graph nodes post-commit.
