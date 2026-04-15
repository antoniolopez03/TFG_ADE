"use client";

import { useRef, useEffect } from "react";
import { useInView } from "framer-motion";
import gsap from "gsap";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CountUpProps {
  /** Target number to animate to. */
  to: number;
  /** Starting value. Default: 0. */
  from?: number;
  /** Animation duration in seconds. Default: 2. */
  duration?: number;
  /** Seconds to wait after entering the viewport before starting. Default: 0. */
  delay?: number;
  /** Number of decimal places to display. Default: 0. */
  decimals?: number;
  /** Text appended after the number (e.g. "+" or "%"). Default: "". */
  suffix?: string;
  /** Text prepended before the number (e.g. "$"). Default: "". */
  prefix?: string;
  className?: string;
  /** Whether to animate only the first time. Default: true. */
  once?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Animates a number from `from` to `to` when the element enters the viewport,
 * using GSAP for the tween and framer-motion `useInView` for the trigger.
 *
 * @example
 * <CountUp to={275} suffix="M+" className="text-5xl font-bold" />
 */
export function CountUp({
  to,
  from = 0,
  duration = 2,
  delay = 0,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
  once = true,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });

  // Write initial value synchronously to avoid a flash of empty content
  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = `${prefix}${from.toFixed(decimals)}${suffix}`;
    }
  }, [from, decimals, prefix, suffix]);

  useEffect(() => {
    if (!isInView || !ref.current) return;

    const obj = { value: from };

    tweenRef.current = gsap.to(obj, {
      value: to,
      duration,
      delay,
      ease: "power2.out",
      onUpdate() {
        if (ref.current) {
          ref.current.textContent = `${prefix}${obj.value.toFixed(decimals)}${suffix}`;
        }
      },
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [isInView, to, from, duration, delay, decimals, suffix, prefix]);

  return (
    <span ref={ref} className={className}>
      {/* Initial text is set via useEffect above */}
    </span>
  );
}
