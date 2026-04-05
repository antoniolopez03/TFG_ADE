"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

/**
 * Thin progress bar fixed at the top of the page.
 * Uses a native scroll listener (not ScrollTrigger) so it works correctly
 * on all pages regardless of height, including those with portals or
 * dynamic content that changes the page height after initial render.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function update() {
      if (!bar) return;
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const pct        = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

      if (reducedMotion) {
        bar.style.transform = `scaleX(${pct})`;
      } else {
        gsap.set(bar, { scaleX: pct });
      }
    }

    update(); // set initial state

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    // Re-calculate when page height changes (e.g. BannerPortal loading)
    const ro = new ResizeObserver(update);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-leadby-600 via-leadby-500 to-leadby-300"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
