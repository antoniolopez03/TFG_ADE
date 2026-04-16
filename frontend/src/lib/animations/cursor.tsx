/**
 * Cursor utilities for LeadBy animations.
 *
 * The full custom cursor (orange arrow + halo, ripple on click, magnetic pull)
 * is already implemented in `CursorEffect` and mounted in the root app layout
 * for all routes — you don't need to mount it again.
 *
 * This module exposes:
 *
 * - `MAGNETIC_CLASS` — CSS class that activates the cursor's magnetic-halo
 *   attraction. Add it to any element you also wrap in `<Magnetic>`.
 *
 * - `CursorEffect` — re-exported so it can be imported from a single
 *   animations namespace if preferred.
 */

export { CursorEffect } from "@/components/landing/CursorEffect";

/**
 * Adding this class to an element signals to `CursorEffect` that the halo
 * should be magnetically pulled towards that element when the pointer is near.
 *
 * Usage — pair it with the `<Magnetic>` wrapper:
 * ```tsx
 * <Magnetic>
 *   <button className={`btn-primary ${MAGNETIC_CLASS}`}>
 *     Empezar gratis
 *   </button>
 * </Magnetic>
 * ```
 * `<Magnetic>` adds the class automatically, so you only need to add it
 * manually when you want the halo effect without the element physically moving.
 */
export const MAGNETIC_CLASS = "cursor-magnetic" as const;
