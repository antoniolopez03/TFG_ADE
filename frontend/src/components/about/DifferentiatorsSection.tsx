"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Reveal } from "@/lib/animations/reveal";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ITEMS = [
  {
    title: "Coste Cero por Lead",
    description:
      "Descubres y calificas leads sin pagar por contacto. La plataforma cobra solo cuando generas resultados reales, alineando el incentivo con el tuyo.",
    icon: ZeroCostIcon,
    delay: 0,
  },
  {
    title: "Data Moat",
    description:
      "275 M+ contactos verificados con datos de empresa, cargo e intent signals. Una ventaja competitiva que crece con cada búsqueda.",
    icon: DataMoatIcon,
    delay: 0.12,
  },
  {
    title: "Human-in-the-Loop",
    description:
      "La IA propone, tú decides. Cada lead y cada email pasa por tu revisión antes de salir. Control total sin perder la velocidad de la automatización.",
    icon: HumanLoopIcon,
    delay: 0.24,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function DifferentiatorsSection() {
  return (
    <section className="relative overflow-hidden border-y border-black/6 dark:border-white/8 py-20">
      {/* Background orb */}
      <div
        aria-hidden
        className="glow-orb pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          "--size": "600px",
          "--color": "rgba(255,117,31,0.06)",
          "--blur": "100px",
        } as React.CSSProperties}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section header */}
        <Reveal direction="up" threshold={0.1}>
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500">
              Por qué LeadBy
            </p>
            <h2 className="text-3xl font-semibold text-balance md:text-4xl">
              Tres ventajas que ningún competidor replica
            </h2>
          </div>
        </Reveal>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} direction="up" delay={item.delay} threshold={0.05}>
                <article className="group relative flex flex-col gap-5 rounded-2xl border border-black/8 dark:border-white/8 bg-white/50 dark:bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-leadby-500/30 hover:shadow-[0_12px_40px_rgba(255,117,31,0.08)]">
                  {/* Animated SVG icon */}
                  <div className="h-14 w-14">
                    <Icon />
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-black/60 dark:text-white/60">
                      {item.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Animated SVG icons (framer-motion pathLength) ───────────────────────────

/** Shared transition for every stroke path */
const pathTransition = (delay = 0) => ({
  duration: 1.4,
  delay,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
});

// ── Icon: Coste Cero ──────────────────────────────────────────────────────────

function ZeroCostIcon() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });

  return (
    <svg ref={ref} viewBox="0 0 48 48" fill="none" className="h-14 w-14" aria-hidden>
      {/* Circle */}
      <motion.circle
        cx="24" cy="24" r="20"
        stroke="#ff751f" strokeWidth="2.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0)}
      />
      {/* €/0 cross */}
      <motion.path
        d="M16 20h10M16 24h10M20 16v16"
        stroke="#ff751f" strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0.3)}
      />
      {/* Diagonal slash */}
      <motion.line
        x1="30" y1="16" x2="18" y2="32"
        stroke="#ff751f" strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0.6)}
      />
    </svg>
  );
}

// ── Icon: Data Moat ───────────────────────────────────────────────────────────

function DataMoatIcon() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });

  return (
    <svg ref={ref} viewBox="0 0 48 48" fill="none" className="h-14 w-14" aria-hidden>
      {/* Database cylinder top */}
      <motion.ellipse
        cx="24" cy="14" rx="14" ry="5"
        stroke="#ff751f" strokeWidth="2.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0)}
      />
      {/* Left side */}
      <motion.path
        d="M10 14v20"
        stroke="#ff751f" strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0.2)}
      />
      {/* Right side */}
      <motion.path
        d="M38 14v20"
        stroke="#ff751f" strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0.25)}
      />
      {/* Bottom ellipse */}
      <motion.ellipse
        cx="24" cy="34" rx="14" ry="5"
        stroke="#ff751f" strokeWidth="2.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0.4)}
      />
      {/* Middle divider */}
      <motion.path
        d="M10 24c0 2.76 6.27 5 14 5s14-2.24 14-5"
        stroke="#ff751f" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0.55)}
      />
    </svg>
  );
}

// ── Icon: Human-in-the-Loop ───────────────────────────────────────────────────

function HumanLoopIcon() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });

  return (
    <svg ref={ref} viewBox="0 0 48 48" fill="none" className="h-14 w-14" aria-hidden>
      {/* Person head */}
      <motion.circle
        cx="24" cy="14" r="6"
        stroke="#ff751f" strokeWidth="2.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0)}
      />
      {/* Person body */}
      <motion.path
        d="M14 36c0-5.52 4.48-10 10-10s10 4.48 10 10"
        stroke="#ff751f" strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0.25)}
      />
      {/* Loop arrow */}
      <motion.path
        d="M8 24a16 16 0 0 1 16-16"
        stroke="#ff751f" strokeWidth="2" strokeLinecap="round"
        strokeDasharray="3 3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0.45)}
      />
      <motion.path
        d="M40 24a16 16 0 0 1-16 16"
        stroke="#ff751f" strokeWidth="2" strokeLinecap="round"
        strokeDasharray="3 3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0.55)}
      />
      {/* Arrow heads */}
      <motion.path
        d="M5 22l3 2-2 3"
        stroke="#ff751f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0.7)}
      />
      <motion.path
        d="M43 26l-3-2 2-3"
        stroke="#ff751f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={pathTransition(0.75)}
      />
    </svg>
  );
}
