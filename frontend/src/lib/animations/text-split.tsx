"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP);

// ─── Types ────────────────────────────────────────────────────────────────────

export type SplitType =
  | "words"
  | "chars"
  | "lines"
  | "words,chars"
  | "lines,words"
  | "lines,words,chars";

export interface TextSplitProps {
  children: string;
  /** Which unit to animate. Default: "words". */
  type?: SplitType;
  /** Stagger delay between each unit in seconds. Default: 0.04. */
  stagger?: number;
  /** Animation duration per unit in seconds. Default: 0.7. */
  duration?: number;
  /** Global delay before the animation starts. Default: 0. */
  delay?: number;
  /** GSAP ease string. Default: "power3.out". */
  ease?: string;
  /**
   * When true (default), the animation fires once the element enters the
   * viewport. When false, it plays immediately on mount.
   */
  scrollTriggered?: boolean;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Splits a text string into animated units (words / chars / lines) using
 * GSAP SplitText. Automatically re-splits on window resize (`autoSplit`).
 *
 * **Important:** `children` must be a plain string — no JSX nodes inside.
 *
 * @example
 * <TextSplit type="words" stagger={0.04} className="text-5xl font-bold">
 *   Vende más sin ampliar tu equipo
 * </TextSplit>
 */
export function TextSplit({
  children,
  type = "words",
  stagger = 0.04,
  duration = 0.7,
  delay = 0,
  ease = "power3.out",
  scrollTriggered = true,
  className,
}: TextSplitProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const splitInstance = SplitText.create(el, {
        type,
        autoSplit: true,
        onSplit(self) {
          // Pick the finest-grained unit to animate
          const targets = type.includes("chars")
            ? self.chars
            : type.includes("lines")
            ? self.lines
            : self.words;

          const fromVars: gsap.TweenVars = {
            opacity: 0,
            y: 24,
            duration,
            stagger,
            delay,
            ease,
          };

          if (scrollTriggered) {
            fromVars.scrollTrigger = {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            };
          }

          // Returning the tween lets SplitText manage its lifecycle on re-split
          return gsap.from(targets, fromVars);
        },
      });

      return () => splitInstance.revert();
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
