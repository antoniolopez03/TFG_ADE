"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { CheckCircle2, Link2, Shield, Workflow } from "lucide-react";

const CRM_OPTIONS = [
  {
    name: "SAP",
    description: "ERP y procesos enterprise",
  },
  {
    name: "Salesforce",
    description: "Sales Cloud y automatizaciones",
  },
  {
    name: "HubSpot",
    description: "Marketing y pipeline comercial",
  },
  {
    name: "API a medida",
    description: "Conectores REST para sistemas propios",
  },
];

export function IntegrationsSection() {
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
          const { motion } = ctx.conditions as { motion: boolean; noMotion: boolean };

          if (!motion) {
            gsap.set([".int-label", ".int-headline", ".int-sub", ".int-card"], {
              autoAlpha: 1,
              clearProps: "transform",
            });
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
            defaults: { ease: "power3.out" },
          });

          tl.from(".int-label", { y: -12, autoAlpha: 0, duration: 0.35 })
            .from(".int-headline", { y: 20, autoAlpha: 0, duration: 0.45 }, "-=0.2")
            .from(".int-sub", { y: 14, autoAlpha: 0, duration: 0.4 }, "-=0.25");

          gsap.set(".int-card", { autoAlpha: 0, y: 24 });

          ScrollTrigger.batch(".int-card", {
            start: "top 90%",
            once: true,
            onEnter: (elements) => {
              gsap.to(elements, {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: "power3.out",
                overwrite: true,
              });
            },
          });
        }
      );

      document.fonts.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
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
            className="int-sub mt-4 text-base leading-relaxed text-black/60 dark:text-white/60 max-w-xl mx-auto"
            style={{ visibility: "hidden" }}
          >
            Integración universal con cualquier CRM: conectamos tu ecosistema actual sin migraciones traumáticas.
          </p>
        </div>

        <div
          className="int-card relative overflow-hidden rounded-3xl border border-black/8 bg-white/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] dark:border-white/8 dark:bg-white/[0.04] md:p-8"
          style={{ visibility: "hidden" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-leadby-500/12 blur-3xl"
          />

          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h3 className="text-2xl font-semibold text-balance md:text-3xl">
                Conecta LeadBy con tu CRM sin cambiar tu forma de trabajar
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-black/65 dark:text-white/65 md:text-base">
                Unificamos datos comerciales, automatizaciones y acciones del equipo en una sola capa de integración.
                Tú mantienes tus herramientas; nosotros conectamos todo mediante API.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-black/65 dark:text-white/65">
                <li className="int-card flex items-start gap-2.5" style={{ visibility: "hidden" }}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leadby-500" />
                  <span>Sincronización de contactos, empresas y etapas del pipeline.</span>
                </li>
                <li className="int-card flex items-start gap-2.5" style={{ visibility: "hidden" }}>
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-leadby-500" />
                  <span>Flujos seguros con tokens cifrados y trazabilidad operativa.</span>
                </li>
                <li className="int-card flex items-start gap-2.5" style={{ visibility: "hidden" }}>
                  <Workflow className="mt-0.5 h-4 w-4 shrink-0 text-leadby-500" />
                  <span>Automatización lista para equipos comerciales B2B.</span>
                </li>
              </ul>
            </div>

            <div className="int-card rounded-2xl border border-leadby-500/25 bg-leadby-500/6 p-5 md:p-6" style={{ visibility: "hidden" }}>
              <div className="rounded-2xl border border-black/8 bg-white/85 p-4 text-center dark:border-white/8 dark:bg-black/30">
                <p className="inline-flex items-center gap-2 rounded-full border border-leadby-500/35 bg-leadby-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-leadby-600 dark:text-leadby-400">
                  <Link2 className="h-3.5 w-3.5" />
                  Integración Universal
                </p>
                <p className="mt-3 text-lg font-semibold">LeadBy Integration Hub</p>
                <p className="mt-1 text-xs text-black/60 dark:text-white/60">Compatible con APIs estándar y flujos custom</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {CRM_OPTIONS.map(({ name, description }) => (
                  <div
                    key={name}
                    className="int-card rounded-xl border border-black/8 bg-white/70 px-3.5 py-3 dark:border-white/8 dark:bg-white/[0.03]"
                    style={{ visibility: "hidden" }}
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
