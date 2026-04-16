"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BlogArticleSummary, BlogCategory } from "@/lib/content/blog";
import { TextSplit } from "@/lib/animations/text-split";
import { Reveal } from "@/lib/animations/reveal";
import { Magnetic } from "@/lib/animations/magnetic";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPageClientProps {
  articles: BlogArticleSummary[];
  categories: BlogCategory[];
}

// ─── Category semantic colours ────────────────────────────────────────────────

const CATEGORY_STYLES: Record<string, { pill: string }> = {
  "Inteligencia Artificial": {
    pill: "bg-leadby-500/10 text-leadby-600 dark:text-leadby-200 border-leadby-500/30",
  },
  "Guías de Ventas B2B": {
    pill: "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30",
  },
  "Casos de Éxito": {
    pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  },
};

function getCategoryStyle(category: string) {
  return (
    CATEGORY_STYLES[category] ?? {
      pill: "bg-leadby-500/10 text-leadby-600 dark:text-leadby-200 border-leadby-500/30",
    }
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlogPageClient({ articles, categories }: BlogPageClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  // ── Filtering ──────────────────────────────────────────────────────────────
  const selectedLabel =
    categories.find((c) => c.id === activeCategory && c.id !== "all")?.label ?? null;

  const filteredArticles = useMemo(
    () =>
      activeCategory === "all"
        ? articles
        : articles.filter((a) => a.category === selectedLabel),
    [activeCategory, articles, selectedLabel]
  );

  // ── Card stagger (GSAP ScrollTrigger.batch) ────────────────────────────────
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(gridRef);
      const cards = q<HTMLElement>(".blog-card");

      if (!cards.length) return;

      /*
       * Performance: only animate transform + opacity (compositor-only).
       * Set initial state synchronously so there's no flash of visible content.
       */
      gsap.set(cards, { autoAlpha: 0, y: 24, willChange: "transform" });

      /*
       * ScrollTrigger.batch groups all cards that enter the viewport within
       * the same animation frame and fires a single coordinated callback —
       * far cheaper than one ScrollTrigger per card.
       *
       * gsap.utils.distribute spreads the stagger delay along an ease curve
       * instead of a flat interval, giving a more organic feel.
       */
      ScrollTrigger.batch(cards, {
        start: "top 88%",
        once: true,
        onEnter(batch) {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out",
            stagger: gsap.utils.distribute({
              from: "start",
              each: 0.08,
              ease: "power1.out",
            }),
            overwrite: true,
            clearProps: "willChange", // release the GPU layer after animation
          });
        },
      });

      document.fonts.ready.then(() => ScrollTrigger.refresh());
    },
    {
      scope: gridRef,
      /*
       * revertOnUpdate: true kills all ScrollTriggers created in this context
       * and reverts inline styles when the dependency changes (filter switch).
       * The next render shows new cards → the effect re-runs → new batch.
       */
      dependencies: [filteredArticles],
      revertOnUpdate: true,
    }
  );

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="glow-orb animate-float absolute -top-24 left-1/2 -translate-x-1/2"
            style={
              {
                "--size": "480px",
                "--color": "rgba(255,117,31,0.14)",
                "--blur": "100px",
              } as React.CSSProperties
            }
          />
          <div
            className="glow-orb animate-float absolute bottom-0 right-0"
            style={
              {
                "--size": "300px",
                "--color": "rgba(255,145,77,0.09)",
                "--blur": "80px",
                animationDelay: "-2.5s",
              } as React.CSSProperties
            }
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal direction="down" delay={0.05}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500">
              Blog de Noticias / Recursos
            </p>
          </Reveal>

          <TextSplit
            type="words"
            stagger={0.04}
            delay={0.15}
            className="text-balance text-4xl font-semibold leading-tight md:text-5xl"
          >
            Recursos, Guias y Casos de Exito B2B.
          </TextSplit>

          <Reveal direction="up" delay={0.45} threshold={0.05}>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-black/70 dark:text-white/70">
              Descubre como la inteligencia artificial y la automatizacion estan redefiniendo las
              ventas en el sector industrial espanol. Estrategias reales para directores
              comerciales.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Category filter tabs ──────────────────────────────────────────── */}
      <section className="border-y border-black/5 py-10 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6">
          {categories.map((category) => {
            const isActive = category.id === activeCategory;
            return (
              /*
               * framer-motion button: the layoutId "tab-indicator" span is the
               * sliding pill. When the active tab changes, framer-motion smoothly
               * animates the pill from the old button to the new one using a
               * spring transition — no manual calculation needed.
               */
              <motion.button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(category.id)}
                className="relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]"
                whileTap={{ scale: 0.95 }}
              >
                {/* Sliding active pill */}
                {isActive && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-full bg-leadby-500 shadow-leadby-sm"
                    style={{ zIndex: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                <span
                  className={[
                    "relative z-10 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-leadby-600 hover:text-leadby-500 dark:text-leadby-200",
                  ].join(" ")}
                >
                  {category.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ── Article grid ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          {/*
           * gridRef is the scope for useGSAP — all ".blog-card" selectors
           * are limited to this subtree (gsap.utils.selector pattern).
           */}
          <div
            ref={gridRef}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredArticles.map((article) => {
              const catStyle = getCategoryStyle(article.category);
              return (
                <article
                  key={article.slug}
                  className={[
                    "blog-card", // selector target for GSAP batch
                    "group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5",
                    "bg-white/80 p-6 shadow-sm shadow-black/5 backdrop-blur",
                    "transition-all duration-300",
                    "hover:-translate-y-1.5 hover:border-leadby-500/25",
                    "hover:shadow-[0_16px_48px_rgba(255,117,31,0.10)]",
                    "dark:border-white/10 dark:bg-white/5",
                  ].join(" ")}
                  /*
                   * will-change is set/cleared by GSAP; not needed inline here.
                   * Inline style removed to avoid competing with GSAP's autoAlpha.
                   */
                >
                  {/* Thumbnail with zoom on hover */}
                  <div
                    className={[
                      "relative aspect-[16/9] overflow-hidden rounded-xl",
                      "border border-leadby-500/20",
                      `bg-gradient-to-br ${article.gradient}`,
                      "dark:from-leadby-500/20 dark:via-leadby-400/10 dark:to-black/30",
                    ].join(" ")}
                  >
                    {/*
                     * Inner scale target: `group-hover:scale-105` zooms this div
                     * while the parent clips it — pure CSS compositor transform.
                     */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,117,31,0.35),_transparent_60%)] transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-leadby-600 backdrop-blur dark:bg-black/40 dark:text-leadby-200">
                      LeadBy Insight
                    </div>
                  </div>

                  {/* Meta row with semantic category colour */}
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
                    <span
                      className={`rounded-full border px-3 py-1 ${catStyle.pill}`}
                    >
                      {article.category}
                    </span>
                    <time
                      dateTime={article.dateTime}
                      className="text-black/50 dark:text-white/50"
                    >
                      {article.dateLabel}
                    </time>
                    <span className="text-black/30 dark:text-white/30">·</span>
                    <span className="text-black/50 dark:text-white/50">
                      {article.readingTime}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold leading-snug md:text-xl">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/70 dark:text-white/70">
                    {article.excerpt}
                  </p>

                  {/* CTA link — arrow slides right on group-hover */}
                  <Link
                    href={`/blog/${article.slug}`}
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-leadby-600 transition-colors hover:text-leadby-500"
                  >
                    Leer artículo
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal direction="scale" threshold={0.1}>
            <div className="noise-overlay relative rounded-3xl border border-leadby-500/20 bg-leadby-400/10 px-8 py-14 text-center dark:bg-leadby-400/15">
              {/* Decorative orbs */}
              <div
                aria-hidden
                className="glow-orb animate-float pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2"
                style={
                  {
                    "--size": "250px",
                    "--color": "rgba(255,117,31,0.12)",
                    "--blur": "60px",
                  } as React.CSSProperties
                }
              />
              <div
                aria-hidden
                className="glow-orb animate-float pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2"
                style={
                  {
                    "--size": "250px",
                    "--color": "rgba(255,117,31,0.10)",
                    "--blur": "60px",
                    animationDelay: "-3s",
                  } as React.CSSProperties
                }
              />

              <h2 className="relative text-balance text-3xl font-semibold md:text-4xl">
                ¿Quieres aplicar estas estrategias en tu empresa?
              </h2>
              <p className="relative mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
                Agenda una demostración y descubre cómo adaptar LeadBy a tu equipo
                comercial con un plan técnico a medida.
              </p>

              <div className="relative mt-8 flex justify-center">
                <Magnetic strength={0.2}>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-leadby-500 px-7 py-3.5 text-sm font-semibold text-white shadow-leadby transition-all hover:bg-leadby-600 animate-glow-pulse cursor-magnetic"
                  >
                    Agenda una demostración
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
