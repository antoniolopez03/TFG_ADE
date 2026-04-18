"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Database, Rocket, Search, type LucideIcon } from "lucide-react";

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
  glowClass: string;
  iconClass: string;
  hoverClass: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    icon: Search,
    title: "Prospección Inteligente",
    description:
      "Identificamos cuentas objetivo según tu mercado, tamaño de empresa y señales comerciales en minutos.",
    highlights: [
      "Empresas prioritarias listas para trabajar",
      "Contactos relevantes desde el primer paso",
    ],
    glowClass: "from-leadby-500/22 to-transparent",
    iconClass: "bg-leadby-500/10 border-leadby-500/25 text-leadby-500",
    hoverClass:
      "hover:shadow-[0_16px_48px_rgba(255,117,31,0.15)] hover:border-leadby-500/35",
  },
  {
    number: "02",
    icon: Database,
    title: "Enriquecimiento de Datos",
    description:
      "Consolidamos contexto de empresa, perfil de contacto y señales clave para preparar un informe preciso.",
    highlights: [
      "Contexto comercial accionable",
      "Base sólida para mensajes hiperpersonalizados",
    ],
    glowClass: "from-cyan-500/18 to-transparent",
    iconClass: "bg-cyan-500/10 border-cyan-500/25 text-cyan-500",
    hoverClass:
      "hover:shadow-[0_16px_48px_rgba(6,182,212,0.15)] hover:border-cyan-500/35",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Integración y Acción",
    description:
      "Empujamos cada lead aprobado al CRM y activamos tu siguiente movimiento comercial sin fricción operativa.",
    highlights: [
      "Sincronización directa con tu sistema",
      "Menos tareas manuales, más foco en cerrar",
    ],
    glowClass: "from-emerald-500/18 to-transparent",
    iconClass: "bg-emerald-500/10 border-emerald-500/25 text-emerald-500",
    hoverClass:
      "hover:shadow-[0_16px_48px_rgba(16,185,129,0.15)] hover:border-emerald-500/35",
  },
];

export function HowItWorksSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          noMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { motion } = ctx.conditions as {
            motion: boolean;
            noMotion: boolean;
          };

          if (!motion) {
            gsap.set(
              [
                ".hiw-label",
                ".hiw-headline",
                ".hiw-sub",
                ".hiw-card",
                ".hiw-node-1",
                ".hiw-node-2",
                ".hiw-node-3",
              ],
              { autoAlpha: 1, clearProps: "transform" }
            );
            return;
          }

          // ─── Initial states ──────────────────────────────────────────────
          gsap.set(".hiw-card", { autoAlpha: 0, y: 48 });
          gsap.set([".hiw-node-1", ".hiw-node-2", ".hiw-node-3"], { scale: 0 });

          // ─── Header ──────────────────────────────────────────────────────
          const headerTl = gsap.timeline({
            scrollTrigger: {
              trigger: ".hiw-header",
              start: "top 82%",
              once: true,
            },
            defaults: { ease: "power3.out" },
          });
          headerTl
            .from(".hiw-label", { y: -12, autoAlpha: 0, duration: 0.35 })
            .from(".hiw-headline", { y: 20, autoAlpha: 0, duration: 0.45 }, "-=0.2")
            .from(".hiw-sub", { y: 16, autoAlpha: 0, duration: 0.4 }, "-=0.2");

          // ─── Progress line fill — scrubbed to full section scroll range ──
          gsap.fromTo(
            ".hiw-progress-fill",
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 55%",
                end: "bottom 55%",
                scrub: 1.5,
              },
            }
          );

          // ─── Step nodes pop in when cards section enters viewport ─────────
          const nodesTl = gsap.timeline({
            scrollTrigger: {
              trigger: ".hiw-steps-grid",
              start: "top 80%",
              once: true,
            },
          });
          nodesTl
            .to(".hiw-node-1", { scale: 1, duration: 0.45, ease: "back.out(2.5)" })
            .to(".hiw-node-2", { scale: 1, duration: 0.45, ease: "back.out(2.5)" }, "-=0.28")
            .to(".hiw-node-3", { scale: 1, duration: 0.45, ease: "back.out(2.5)" }, "-=0.28");

          // ─── Cards batch reveal ────────────────────────────────────────────
          ScrollTrigger.batch(".hiw-card", {
            start: "top 90%",
            onEnter: (cards) => {
              gsap.to(cards, {
                autoAlpha: 1,
                y: 0,
                duration: 0.65,
                stagger: 0.12,
                ease: "power3.out",
                overwrite: true,
              });
            },
            once: true,
          });
        }
      );

      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden border-y border-black/5 py-28 dark:border-white/8"
    >
      {/* ─── Ambient blobs ──────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-leadby-500/6 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-12 h-64 w-64 rounded-full bg-cyan-500/6 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-20 h-72 w-72 rounded-full bg-emerald-500/4 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-6">
        {/* ─── Section header ─────────────────────────────────────────────── */}
        <div className="hiw-header mx-auto mb-16 max-w-3xl text-center">
          <p
            className="hiw-label mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500"
            style={{ visibility: "hidden" }}
          >
            Metodología
          </p>
          <h2
            className="hiw-headline text-3xl font-semibold md:text-4xl text-balance"
            style={{ visibility: "hidden" }}
          >
            Flujo comercial en tres pasos claros
          </h2>
          <p
            className="hiw-sub mt-5 text-base leading-relaxed text-black/65 dark:text-white/65"
            style={{ visibility: "hidden" }}
          >
            Cada fase te acerca al siguiente movimiento de venta con contexto, prioridad y
            ejecución real en CRM.
          </p>
        </div>

        {/* ─── Desktop progress bar (hidden on mobile) ────────────────────── */}
        <div className="relative mx-4 mb-12 hidden lg:block" aria-hidden>
          {/* Track */}
          <div className="h-px w-full rounded-full bg-black/10 dark:bg-white/10" />
          {/* Scrubbed fill */}
          <div
            className="hiw-progress-fill absolute inset-0 h-px origin-left rounded-full bg-gradient-to-r from-leadby-500 via-cyan-500 to-emerald-500"
          />
          {/* Node 01 — left edge */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2">
            <div className="hiw-node-1 h-3.5 w-3.5 rounded-full bg-leadby-500 shadow-[0_3px_10px_rgba(255,117,31,0.5)] ring-2 ring-white dark:ring-black" />
          </div>
          {/* Node 02 — center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="hiw-node-2 h-3.5 w-3.5 rounded-full bg-cyan-500 shadow-[0_3px_10px_rgba(6,182,212,0.5)] ring-2 ring-white dark:ring-black" />
          </div>
          {/* Node 03 — right edge */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2">
            <div className="hiw-node-3 h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-[0_3px_10px_rgba(16,185,129,0.5)] ring-2 ring-white dark:ring-black" />
          </div>
        </div>

        {/* ─── Steps grid ─────────────────────────────────────────────────── */}
        <div className="hiw-steps-grid grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
          {STEPS.map(
            ({
              number,
              icon: Icon,
              title,
              description,
              highlights,
              glowClass,
              iconClass,
              hoverClass,
            }) => (
              <article
                key={number}
                className={`hiw-card group relative overflow-hidden rounded-3xl border border-black/8 bg-white/85 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 dark:border-white/8 dark:bg-white/[0.05] md:p-10 ${hoverClass}`}
                style={{ visibility: "hidden" }}
              >
                {/* Top gradient glow */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b ${glowClass} opacity-90`}
                />

                {/* Watermark step number */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-3 -right-1 select-none text-[7.5rem] font-black leading-none text-black/[0.035] dark:text-white/[0.045]"
                >
                  {number}
                </div>

                {/* Step badge + icon row */}
                <div className="relative mb-8 flex items-center justify-between">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-leadby-500/30 bg-leadby-500/8 px-2.5 text-xs font-bold tracking-widest text-leadby-500 dark:text-leadby-400">
                    {number}
                  </span>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${iconClass} shadow-sm`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="relative text-xl font-semibold leading-snug">{title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-black/60 dark:text-white/60">
                  {description}
                </p>

                {/* Highlights */}
                <ul className="relative mt-7 space-y-2.5">
                  {highlights.map((hl) => (
                    <li
                      key={hl}
                      className="flex items-start gap-3 text-sm text-black/55 dark:text-white/55"
                    >
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-leadby-500" />
                      {hl}
                    </li>
                  ))}
                </ul>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}
