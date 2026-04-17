"use client";

/**
 * SettingsAnimatedLayout
 *
 * Client wrapper for the Settings page that adds a staggered GSAP entrance
 * to every element marked with the `.settings-reveal` class.
 *
 * – Uses useGSAP (not useEffect) so cleanup is automatic on unmount.
 * – Wraps in gsap.matchMedia() so reduced-motion users see instant display.
 * – Animates only transform + opacity (compositor-only, no layout thrash).
 * – clearProps: "transform,opacity,visibility" hands control back to CSS
 *   so hover/focus styles aren't blocked after the animation finishes.
 */

import "@/lib/gsap/register";
import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface Props {
  children: ReactNode;
  fullHeight?: boolean;
}

export function SettingsAnimatedLayout({ children, fullHeight = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const elements = gsap.utils.toArray<HTMLElement>(
        ".settings-reveal",
        containerRef.current
      );
      if (!elements.length) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          elements,
          { y: 18, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.09,
            // Return control to CSS after the animation ends
            clearProps: "transform,opacity,visibility",
          }
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // Show immediately — no motion
        gsap.set(elements, { autoAlpha: 1, y: 0 });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={[
        "w-full overflow-hidden",
        fullHeight ? "h-full" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
