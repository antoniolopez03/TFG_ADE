"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParallaxProps {
  children: ReactNode;
  /**
   * Movement speed relative to scroll.
   * Negative values move the child UP as the page scrolls down (classic parallax).
   * Range: -1 (max upward) to 1 (max downward). Default: -0.3.
   */
  speed?: number;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Moves its child at a speed relative to the scroll position using
 * GSAP ScrollTrigger with `scrub: true` — perfectly synced to the
 * Lenis smooth-scroll timeline.
 *
 * The outer container clips overflow so movement is invisible at edges.
 *
 * @example
 * <Parallax speed={-0.2}>
 *   <img src="/hero-bg.webp" alt="" />
 * </Parallax>
 */
export function Parallax({ children, speed = -0.3, className }: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const inner = innerRef.current;
      if (!container || !inner) return;

      gsap.to(inner, {
        // Translate as a percentage of the inner element's own height
        yPercent: speed * 100,
        ease: "none", // Linear scrub — no easing so scroll pos maps 1:1
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={`overflow-hidden ${className ?? ""}`}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
