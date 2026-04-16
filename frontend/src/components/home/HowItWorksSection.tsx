"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import {
  ArrowDown,
  ArrowRight,
  Database,
  Rocket,
  Search,
  type LucideIcon,
} from "lucide-react";

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
  glowClass: string;
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
          const { motion } = ctx.conditions as { motion: boolean; noMotion: boolean };

          if (!motion) {
            gsap.set([".hiw-label", ".hiw-headline", ".hiw-sub", ".hiw-flow-item"], {
              autoAlpha: 1,
              clearProps: "transform",
            });
            return;
          }

          gsap.set(".hiw-flow-item", { autoAlpha: 0, y: 40 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 82%",
              once: true,
              toggleActions: "play none none none",
            },
            defaults: { ease: "power3.out" },
          });

          tl.from(".hiw-label", { y: -12, autoAlpha: 0, duration: 0.35 })
            .from(".hiw-headline", { y: 20, autoAlpha: 0, duration: 0.45 }, "-=0.2")
            .from(".hiw-sub", { y: 16, autoAlpha: 0, duration: 0.4 }, "-=0.2")
            .to(
              ".hiw-flow-item",
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: "power3.out",
                overwrite: true,
              },
              "-=0.08"
            );
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
      className="relative overflow-hidden border-y border-black/5 py-24 dark:border-white/8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-leadby-500/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-cyan-500/8 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
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

        {/* Steps + flow connectors */}
        <div className="flex flex-col items-stretch gap-8 md:gap-10 lg:flex-row lg:items-stretch lg:gap-12">
          {STEPS.map(({ number, icon: Icon, title, description, highlights, glowClass }, index) => (
            <div key={number} className="contents">
              <article
                className="hiw-flow-item group relative overflow-hidden rounded-3xl border border-black/8 bg-white/85 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-leadby-500/35 hover:shadow-[0_12px_40px_rgba(255,117,31,0.14)] dark:border-white/8 dark:bg-white/[0.05] md:p-10 lg:flex-1"
                style={{ visibility: "hidden" }}
              >
                <div
                  aria-hidden
                  className={
                    "pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b " +
                    glowClass +
                    " opacity-80"
                  }
                />

                <div className="relative mb-8 flex items-center justify-between">
                  <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-leadby-500/35 bg-leadby-500/10 px-2 text-xs font-semibold text-leadby-600 dark:text-leadby-400">
                    {number}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-leadby-500/25 bg-white/90 text-leadby-500 shadow-sm dark:bg-black/20">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="relative pr-4 text-xl font-semibold leading-snug">{title}</h3>
                <p className="relative mt-4 text-sm leading-relaxed text-black/65 dark:text-white/65">
                  {description}
                </p>

                <ul className="relative mt-8 space-y-3">
                  {highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-3 text-sm text-black/60 dark:text-white/60"
                    >
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-leadby-500" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </article>

              {index < STEPS.length - 1 ? (
                <div
                  aria-hidden
                  className="hiw-flow-item flex items-center justify-center"
                  style={{ visibility: "hidden" }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/90 text-leadby-500 shadow-[0_8px_25px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-black/35 lg:hidden">
                    <ArrowDown className="h-5 w-5" />
                  </div>
                  <div className="hidden h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/90 text-leadby-500 shadow-[0_8px_25px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-black/35 lg:flex">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
