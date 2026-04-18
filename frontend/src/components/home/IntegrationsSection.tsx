"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef, useCallback } from "react";
import { CheckCircle2, Link2, Shield, Workflow } from "lucide-react";

const CRM_OPTIONS = [
  { name: "SAP",        description: "ERP y procesos enterprise" },
  { name: "Salesforce", description: "Sales Cloud y automatizaciones" },
  { name: "HubSpot",    description: "Marketing y pipeline comercial" },
  { name: "API a medida", description: "Conectores REST para sistemas propios" },
];

export function IntegrationsSection() {
  const containerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty("--mouse-x", `${e.clientX - left}px`);
    cardRef.current.style.setProperty("--mouse-y", `${e.clientY - top}px`);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion:   "(prefers-reduced-motion: no-preference)",
          noMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { motion } = ctx.conditions as { motion: boolean; noMotion: boolean };

          if (!motion) {
            gsap.set(
              [".int-label", ".int-headline", ".int-sub", ".int-main-card"],
              { autoAlpha: 1, clearProps: "transform" }
            );
            return;
          }

          // ─── Header ────────────────────────────────────────────────────────
          const headerTl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 82%",
              once: true,
            },
            defaults: { ease: "power3.out" },
          });
          headerTl
            .from(".int-label",    { y: -12, autoAlpha: 0, duration: 0.35 })
            .from(".int-headline", { y: 20,  autoAlpha: 0, duration: 0.45 }, "-=0.2")
            .from(".int-sub",      { y: 14,  autoAlpha: 0, duration: 0.4  }, "-=0.25");

          // ─── Main card choreography ────────────────────────────────────────
          const cardTl = gsap.timeline({
            scrollTrigger: {
              trigger: ".int-main-card",
              start: "top 82%",
              once: true,
            },
            defaults: { ease: "power3.out" },
          });

          // 1 — outer card slides up
          cardTl.from(".int-main-card", { autoAlpha: 0, y: 44, duration: 0.55 });

          // 2 — left column: title then body, overlapping with card entrance
          cardTl
            .from(".int-left-title", { autoAlpha: 0, x: -22, duration: 0.45 }, "-=0.25")
            .from(".int-left-body",  { autoAlpha: 0, y: 12,  duration: 0.4  }, "-=0.2");

          // 3 — bullet items cascade in from left
          cardTl.from(".int-bullet", {
            autoAlpha: 0,
            x: -18,
            duration: 0.38,
            stagger: 0.11,
            ease: "power3.out",
          }, "-=0.15");

          // 4 — right hub panel slides in from right (overlaps with bullets)
          cardTl.from(".int-hub-panel", {
            autoAlpha: 0,
            x: 36,
            duration: 0.55,
            ease: "power3.out",
          }, "<-=0.35");   // starts 0.35 s before bullets finish

          // 5 — integration badge pops in
          cardTl.from(".int-hub-badge", {
            autoAlpha: 0,
            scale: 0.82,
            duration: 0.38,
            ease: "back.out(2.2)",
          }, "-=0.2");

          // 6 — hub title + subtitle fade up
          cardTl
            .from(".int-hub-title", { autoAlpha: 0, y: 10, duration: 0.32 }, "-=0.15")
            .from(".int-hub-sub",   { autoAlpha: 0, y: 8,  duration: 0.28 }, "-=0.18");

          // 7 — CRM option cards pop in with stagger
          cardTl.from(".int-crm-card", {
            autoAlpha: 0,
            y: 18,
            scale: 0.93,
            duration: 0.4,
            stagger: 0.09,
            ease: "back.out(1.8)",
          }, "-=0.1");
        }
      );

      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">

        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-12 text-center">
          <p
            className="int-label mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500"
            style={{ visibility: "hidden" }}
          >
            Stack tecnológico
          </p>
          <h2
            className="int-headline text-3xl font-semibold md:text-4xl text-balance"
            style={{ visibility: "hidden" }}
          >
            Tecnología que encaja con lo que ya usas
          </h2>
          <p
            className="int-sub mt-4 max-w-xl mx-auto text-base leading-relaxed text-black/60 dark:text-white/60"
            style={{ visibility: "hidden" }}
          >
            Integración universal con cualquier CRM: conectamos tu ecosistema actual sin
            migraciones traumáticas.
          </p>
        </div>

        {/* ─── Main card ────────────────────────────────────────────────────── */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="int-main-card group relative overflow-hidden rounded-3xl border border-black/8 bg-white/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] dark:border-white/8 dark:bg-white/[0.04] md:p-8"
          style={{ visibility: "hidden" }}
        >
          {/* Mouse spotlight overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(500px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,117,31,0.07), transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-leadby-500/12 blur-3xl"
          />

          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">

            {/* ─── Left: text + bullets ───────────────────────────────────── */}
            <div>
              <h3 className="int-left-title text-2xl font-semibold text-balance md:text-3xl">
                Conecta LeadBy con tu CRM sin cambiar tu forma de trabajar
              </h3>
              <p className="int-left-body mt-4 text-sm leading-relaxed text-black/65 dark:text-white/65 md:text-base">
                Unificamos datos comerciales, automatizaciones y acciones del equipo en una sola
                capa de integración. Tú mantienes tus herramientas; nosotros conectamos todo
                mediante API.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-black/65 dark:text-white/65">
                <li className="int-bullet flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leadby-500" />
                  <span>Sincronización de contactos, empresas y etapas del pipeline.</span>
                </li>
                <li className="int-bullet flex items-start gap-2.5">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-leadby-500" />
                  <span>Flujos seguros con tokens cifrados y trazabilidad operativa.</span>
                </li>
                <li className="int-bullet flex items-start gap-2.5">
                  <Workflow className="mt-0.5 h-4 w-4 shrink-0 text-leadby-500" />
                  <span>Automatización lista para equipos comerciales B2B.</span>
                </li>
              </ul>
            </div>

            {/* ─── Right: hub panel (floats after reveal) ─────────────────── */}
            <div className="int-hub-panel rounded-2xl border border-leadby-500/25 bg-leadby-500/6 p-5 md:p-6">

              {/* Integration hub header */}
              <div className="rounded-2xl border border-black/8 bg-white/85 p-4 text-center dark:border-white/8 dark:bg-black/30">
                <p className="int-hub-badge inline-flex items-center gap-2 rounded-full border border-leadby-500/35 bg-leadby-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-leadby-600 dark:text-leadby-400">
                  {/* Live ping dot */}
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leadby-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-leadby-500" />
                  </span>
                  <Link2 className="h-3.5 w-3.5" />
                  Integración Universal
                </p>
                <p className="int-hub-title mt-3 text-lg font-semibold">
                  LeadBy Integration Hub
                </p>
                <p className="int-hub-sub mt-1 text-xs text-black/60 dark:text-white/60">
                  Compatible con APIs estándar y flujos custom
                </p>
              </div>

              {/* CRM option cards */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {CRM_OPTIONS.map(({ name, description }) => (
                  <div
                    key={name}
                    className="int-crm-card rounded-xl border border-black/8 bg-white/70 px-3.5 py-3 dark:border-white/8 dark:bg-white/[0.03]"
                  >
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="mt-1 text-xs text-black/55 dark:text-white/55">{description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
