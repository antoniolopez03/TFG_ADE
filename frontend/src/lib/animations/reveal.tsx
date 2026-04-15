"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RevealDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "scale"
  | "none";

export interface RevealProps {
  children: ReactNode;
  /** Animation entrance direction. Default: "up". */
  direction?: RevealDirection;
  /** Seconds before the animation starts. Default: 0. */
  delay?: number;
  /** Animation duration in seconds. Default: 0.6. */
  duration?: number;
  /** Viewport intersection threshold (0–1). Default: 0.15. */
  threshold?: number;
  /** Whether to animate only the first time. Default: true. */
  once?: boolean;
  className?: string;
}

// ─── Variants ────────────────────────────────────────────────────────────────

const OFFSET = 30;

function buildVariants(direction: RevealDirection) {
  const hidden: Record<string, number> = { opacity: 0 };
  const visible: Record<string, number> = { opacity: 1 };

  switch (direction) {
    case "up":
      hidden.y = OFFSET;
      visible.y = 0;
      break;
    case "down":
      hidden.y = -OFFSET;
      visible.y = 0;
      break;
    case "left":
      hidden.x = OFFSET;
      visible.x = 0;
      break;
    case "right":
      hidden.x = -OFFSET;
      visible.x = 0;
      break;
    case "scale":
      hidden.scale = 0.92;
      visible.scale = 1;
      break;
    case "none":
      // Only fade, no transform
      break;
  }

  return { hidden, visible } as const;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Wraps children in a framer-motion div that fades + slides into view when
 * the element enters the viewport.
 *
 * @example
 * <Reveal direction="up" delay={0.2}>
 *   <h2>Headline</h2>
 * </Reveal>
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  threshold = 0.15,
  once = true,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const variants = buildVariants(direction);

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{
        duration,
        delay,
        // Refined cubic-bezier matching the "slide-in-blur" feel
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
