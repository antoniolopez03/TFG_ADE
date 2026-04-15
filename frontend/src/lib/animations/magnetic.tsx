"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MagneticProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode;
  /**
   * Multiplier for the pull strength.
   * 0 = no movement, 1 = cursor position, 0.3 = subtle. Default: 0.3.
   */
  strength?: number;
  /** Spring stiffness. Higher = snappier. Default: 150. */
  stiffness?: number;
  /** Spring damping. Higher = less oscillation. Default: 15. */
  damping?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Wraps children and gives them a magnetic pull towards the cursor when
 * hovered. Works in tandem with the global CursorEffect (the `.cursor-magnetic`
 * class also triggers the halo attraction in the cursor overlay).
 *
 * @example
 * <Magnetic strength={0.25}>
 *   <button className="btn-primary">Empezar gratis</button>
 * </Magnetic>
 */
export function Magnetic({
  children,
  strength = 0.3,
  stiffness = 150,
  damping = 15,
  className,
  ...rest
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const x = useSpring(rawX, { stiffness, damping, mass: 0.1 });
  const y = useSpring(rawY, { stiffness, damping, mass: 0.1 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rawX.set((e.clientX - cx) * strength);
    rawY.set((e.clientY - cy) * strength);
  }

  function onMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      // cursor-magnetic activates the halo pull in CursorEffect
      className={`cursor-magnetic ${className ?? ""}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
