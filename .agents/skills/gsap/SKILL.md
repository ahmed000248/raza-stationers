---
name: gsap
description: GSAP 3 animation skill featuring ScrollTrigger, ScrollSmoother, SplitText, MorphSVGPlugin, DrawSVGPlugin, Flip, InertiaPlugin, Draggable, MotionPathPlugin, ScrambleTextPlugin, and React useGSAP hook. Use when building complex timeline animations, scroll-driven motion, text splitting, SVG morphing/drawing, or smooth page inertia in Next.js / React apps.
---

# GSAP & Premium Motion Skill Guide

This skill provides best practices, registration guidelines, and implementation recipes for **GSAP 3** and its full suite of plugins (including bonus plugins: `ScrollTrigger`, `ScrollSmoother`, `SplitText`, `MorphSVGPlugin`, `DrawSVGPlugin`, `Flip`, `InertiaPlugin`, `Draggable`, `CustomEase`, `ScrambleTextPlugin`).

---

## 1. Importing & Centralized Module

Always import GSAP and plugins from `@/lib/gsap` in React / Next.js client components:

```tsx
'use client';

import { useRef } from 'react';
import { gsap, useGSAP, ScrollTrigger, SplitText, MorphSVGPlugin } from '@/lib/gsap';

export default function AnimatedHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // GSAP animations automatically context-scoped and cleaned up!
    gsap.from('.hero-title', {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="hero">
      <h1 className="hero-title">Raza Stationers</h1>
    </div>
  );
}
```

---

## 2. Key Rules & Best Practices

1. **Always Use `useGSAP` Hook**:
   - In React / Next.js, always wrap animations inside `useGSAP(() => { ... }, { scope: containerRef })`.
   - Never use `useEffect` for GSAP animations when `useGSAP` is available — `useGSAP` handles React 18 Strict Mode double-invocations and memory cleanup automatically.

2. **Next.js SSR Safety**:
   - Component using GSAP MUST have `'use client';` at top of file.
   - Access DOM nodes via `useRef` or scoped selector strings within `{ scope: containerRef }`.

3. **ScrollTrigger Refresh**:
   - Call `ScrollTrigger.refresh()` after dynamic layout updates or modal toggles.

---

## 3. Plugin Usage Quick-Reference

### A. ScrollTrigger (Scroll-Driven Animations)
```tsx
useGSAP(() => {
  gsap.to('.box', {
    x: 300,
    scrollTrigger: {
      trigger: '.box',
      start: 'top 80%',
      end: 'top 20%',
      scrub: 1,
      markers: false,
    },
  });
}, { scope: containerRef });
```

### B. SplitText (Animated Typography)
```tsx
useGSAP(() => {
  const split = new SplitText('.text-target', { type: 'chars,words' });
  gsap.from(split.chars, {
    opacity: 0,
    y: 20,
    stagger: 0.03,
    ease: 'back.out(1.7)',
  });
}, { scope: containerRef });
```

### C. MorphSVGPlugin & DrawSVGPlugin
```tsx
useGSAP(() => {
  // Draw SVG lines
  gsap.from('#stroke-path', { drawSVG: 0, duration: 2 });

  // Morph path A to path B
  gsap.to('#shape-a', { morphSVG: '#shape-b', duration: 1.5, ease: 'power2.inOut' });
}, { scope: containerRef });
```

### D. ScrollSmoother (Smooth Inertia Scrolling)
```tsx
useGSAP(() => {
  ScrollSmoother.create({
    smooth: 1.5,
    effects: true,
    smoothTouch: 0.1,
  });
});
```

### E. Flip (Shared Layout Morphs & Transitions)
```tsx
const state = Flip.getState('.square');
// Modify DOM layout / CSS classes...
Flip.from(state, { duration: 0.6, ease: 'power1.inOut' });
```
