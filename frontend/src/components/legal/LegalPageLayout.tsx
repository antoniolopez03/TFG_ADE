"use client";

/**
 * LegalPageLayout
 *
 * Animated layout for /legal/* pages. Implements Sprint 9 plan section 9:
 *   – TextSplit on page title (plays immediately on mount, no scroll-trigger)
 *   – GSAP ScrollTrigger.batch for staggered section reveals (transform + autoAlpha only)
 *   – Sticky TOC (desktop) with native IntersectionObserver for active-section tracking
 *   – GSAP ScrollToPlugin for smooth scroll on TOC click
 *   – gsap.matchMedia() respects prefers-reduced-motion throughout
 */

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef, useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { TextSplit } from "@/lib/animations/text-split";

// Register once at module level so it's always available
gsap.registerPlugin(ScrollToPlugin);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LegalSection {
  id: string;
  heading: string;
  content: ReactNode;
}

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  backHref?: string;
  sections: LegalSection[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  backHref = "/",
  sections,
}: LegalPageLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  // ── IntersectionObserver: highlight the TOC entry for the visible h2 ─────
  //
  // rootMargin: top dead zone (-20%) + bottom dead zone (-60%) so the heading
  // is considered "active" only while it sits in the upper-middle of the
  // viewport — avoids jumping between entries on fast scrolls.
  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Take the topmost intersecting heading (closest to top of viewport)
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0% -60% 0%", threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [sections]);

  // ── Smooth scroll to section on TOC click ───────────────────────────────
  //
  // Uses GSAP ScrollToPlugin instead of scrollIntoView so we get a GSAP-eased
  // scroll that matches the rest of the site's motion language.
  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id); // immediate visual feedback in TOC
    gsap.to(window, {
      duration: 0.8,
      scrollTo: { y: el, offsetY: 80 },
      ease: "power2.inOut",
    });
  }

  // ── Staggered section reveals (GSAP ScrollTrigger.batch) ─────────────────
  //
  // Performance pattern (from GSAP performance skill):
  //   – Only animate transform (y) + autoAlpha → compositor-only, no layout.
  //   – willChange: "transform" is set on enter and cleared after animation.
  //   – ScrollTrigger.batch groups all elements that enter in the same tick so
  //     we create far fewer ScrollTrigger instances than one-per-element.
  //   – once: true kills each batch ScrollTrigger after it fires.
  useGSAP(
    () => {
      const q = gsap.utils.selector(containerRef);
      const blocks = q<HTMLElement>(".legal-section");
      if (!blocks.length) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Set initial invisible state — compositor-only, no layout cost
        gsap.set(blocks, { autoAlpha: 0, y: 22, willChange: "transform" });

        ScrollTrigger.batch(blocks, {
          start: "top 88%",
          once: true,
          onEnter(batch) {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              ease: "power2.out",
              // Stagger object: fixed delay per item along power1 ease curve
              stagger: { each: 0.09, from: "start", ease: "power1.out" },
              // Release GPU layer + hand control back to CSS after animation
              clearProps: "willChange,transform,opacity,visibility",
            });
          },
        });

        // Refresh after custom fonts finish loading to fix trigger positions
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // Immediately show all sections — no motion
        gsap.set(blocks, { autoAlpha: 1, y: 0 });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="px-6 pb-24 pt-14 md:pt-20">
      <div className="mx-auto max-w-6xl">

        {/* ── Back link ─────────────────────────────────────────────────── */}
        <Link
          href={backHref}
          className="mb-10 inline-flex items-center gap-1.5 text-sm text-leadby-500 transition-colors hover:text-leadby-600"
        >
          ← Volver
        </Link>

        {/* ── Title (TextSplit — plays on mount, not scroll) ─────────────── */}
        <div className="mb-2">
          <TextSplit
            type="words"
            stagger={0.04}
            delay={0.05}
            scrollTriggered={false}
            className="text-balance text-3xl font-semibold leading-tight md:text-4xl"
          >
            {title}
          </TextSplit>
        </div>

        {subtitle && (
          <p className="mb-2 max-w-2xl text-base leading-relaxed text-black/70 dark:text-white/70">
            {subtitle}
          </p>
        )}

        {lastUpdated && (
          <p className="mb-12 text-sm text-black/40 dark:text-white/40">
            Última actualización: {lastUpdated}
          </p>
        )}

        {/* ── Two-column: prose (left) + sticky TOC (right, xl+) ─────────── */}
        <div className="flex gap-16">

          {/* ── Article content ─────────────────────────────────────────── */}
          <article className="prose prose-neutral min-w-0 flex-1 max-w-none leading-relaxed dark:prose-invert prose-headings:text-foreground prose-p:text-black/70 dark:prose-p:text-white/70 prose-li:text-black/70 dark:prose-li:text-white/70 prose-a:text-leadby-500 dark:prose-a:text-leadby-400 prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4 prose-h2:scroll-mt-24">
            {sections.map((s) => (
              /*
               * .legal-section is the GSAP batch target — the whole block
               * (heading + content) animates as one unit.
               * The h2 carries the ID for IntersectionObserver.
               */
              <div key={s.id} className="legal-section">
                <h2 id={s.id}>{s.heading}</h2>
                {s.content}
              </div>
            ))}
          </article>

          {/* ── Sticky TOC (xl screens only) ────────────────────────────── */}
          <aside className="hidden w-52 flex-shrink-0 xl:block">
            <nav
              className="sticky top-24"
              aria-label="Tabla de contenidos"
            >
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-black/35 dark:text-white/35">
                En esta página
              </p>
              <ul className="space-y-0.5">
                {sections.map((s) => {
                  const isActive = activeId === s.id;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(s.id)}
                        className={[
                          "w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-200",
                          isActive
                            ? "bg-leadby-500/10 font-medium text-leadby-500"
                            : "text-black/45 hover:bg-black/5 hover:text-black/75 dark:text-white/45 dark:hover:bg-white/5 dark:hover:text-white/75",
                        ].join(" ")}
                      >
                        {s.heading}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}
