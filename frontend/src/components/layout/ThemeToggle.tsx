"use client";

/**
 * ThemeToggle
 *
 * Phase 8 addition: GSAP icon-morph animation on toggle.
 *
 * Pattern (scale-out / scale-in):
 *  1. User clicks → GSAP scales the icon wrapper out (scale 0, rotate -90°)
 *  2. onComplete → theme state updates (React re-renders with new icon)
 *  3. GSAP immediately scales the new icon in (back.out elastic bounce)
 *
 * gsap.matchMedia():
 *  – no-preference → full morph animation
 *  – reduce        → instant icon swap, no motion
 *
 * Uses contextSafe so the onComplete callback is properly cleaned up if the
 * component unmounts before the tween finishes.
 */

import "@/lib/gsap/register";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
    return;
  }
  root.classList.remove("dark");
  root.style.colorScheme = "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [theme,   setTheme]   = useState<Theme>("light");
  const iconRef               = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored   = localStorage.getItem(STORAGE_KEY);
    const resolved: Theme = stored === "dark" ? "dark" : "light";
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  const { contextSafe } = useGSAP();

  const handleToggle = contextSafe(() => {
    if (!iconRef.current) {
      // Fallback — no DOM yet (should not happen after mount)
      const next: Theme = theme === "dark" ? "light" : "dark";
      setTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return;
    }

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // ── Phase 1: scale out current icon ──────────────────────────────
      gsap.to(iconRef.current, {
        scale: 0,
        rotation: -90,
        duration: 0.18,
        ease: "power2.in",
        onComplete: () => {
          // ── Phase 2: swap theme (React re-renders with new icon) ──────
          const next: Theme = theme === "dark" ? "light" : "dark";
          setTheme(next);
          localStorage.setItem(STORAGE_KEY, next);
          applyTheme(next);

          // ── Phase 3: scale in new icon ────────────────────────────────
          gsap.fromTo(
            iconRef.current,
            { scale: 0, rotation: 90 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.28,
              ease: "back.out(1.8)",
            }
          );
        },
      });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      // Instant swap — no motion
      const next: Theme = theme === "dark" ? "light" : "dark";
      setTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  });

  const label = theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

  if (!mounted) {
    return (
      <div
        className={cn("h-10 w-10 rounded-full border border-transparent", className)}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      title={label}
      aria-pressed={theme === "dark"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-leadby-500/40 text-leadby-500",
        "transition-colors hover:bg-leadby-50 dark:hover:bg-gray-900",
        className
      )}
    >
      {/* Stable wrapper for GSAP — the icon inside changes on theme swap */}
      <span
        ref={iconRef}
        className="inline-flex items-center justify-center"
        style={{ transformOrigin: "center" }}
        aria-hidden="true"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </span>
    </button>
  );
}
