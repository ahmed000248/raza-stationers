/**
 * Motion tokens for Raza Stationers customer website.
 * Shared constants for Framer Motion, GSAP, and CSS transitions.
 * Reference: architecture.md §7 & phases.md Phase 0
 */

export const MOTION_DURATIONS = {
  /** Fast micro-interactions: hover, active press, validation shake (150ms) */
  fast: 0.15,
  /** Base state transitions: modals, drawers, toasts, enter/exit (250ms) */
  base: 0.25,
  /** Slow reveals: hero entrance, page transitions (400ms) */
  slow: 0.4,
} as const;

export const MOTION_EASINGS = {
  /** Smooth entrance easing */
  easeOut: [0.16, 1, 0.3, 1] as const,
  /** Smooth exit easing */
  easeIn: [0.7, 0, 0.84, 0] as const,
  /** Standard ease in-out */
  easeInOut: [0.65, 0, 0.35, 1] as const,
  /** Controlled spring bounce reserved specifically for Add-to-Cart delight moment */
  cartBounce: {
    type: "spring",
    stiffness: 400,
    damping: 15,
  } as const,
} as const;
