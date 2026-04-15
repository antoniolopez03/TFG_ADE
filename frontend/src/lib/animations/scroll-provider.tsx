"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Context ─────────────────────────────────────────────────────────────────

const LenisContext = createContext<Lenis | null>(null);

/** Access the Lenis instance from any child component. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface ScrollProviderProps {
  children: ReactNode;
}

/**
 * Mounts Lenis smooth scroll and syncs it with GSAP ScrollTrigger so that
 * all scroll-triggered animations feel perfectly fluid.
 *
 * Mount this once in the public layout (never inside the SaaS layout, which
 * has its own scroll container).
 */
export function ScrollProvider({ children }: ScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Respect user preference for reduced motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const instance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    setLenis(instance);

    // Keep ScrollTrigger positions up to date on every Lenis tick
    instance.on("scroll", ScrollTrigger.update);

    // Drive Lenis via the GSAP ticker so both share the same rAF loop.
    // gsap.ticker time is in seconds; Lenis.raf() expects milliseconds.
    const onTick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(onTick);

    // Disable GSAP's built-in lag-smoothing so Lenis stays perfectly in sync
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      instance.off("scroll", ScrollTrigger.update);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
