"use client";

import { useRef, useEffect } from "react";
import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(bar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    });

    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
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
