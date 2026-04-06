"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

const INTEGRATIONS = [
  {
    emoji: "🟠",
    name: "HubSpot CRM",
    description: "Sincronización bidireccional de contactos y pipeline de ventas",
  },
  {
    emoji: "🔷",
    name: "Google Gemini",
    description: "Generación de correos hiperpersonalizados con contexto real de cada empresa",
  },
  {
    emoji: "🔴",
    name: "n8n",
    description: "Orquestación visual de flujos de automatización sin necesidad de código",
  },
  {
    emoji: "📮",
    name: "Resend",
    description: "Envío transaccional con DKIM/SPF para máxima entregabilidad",
  },
  {
    emoji: "🟩",
    name: "Supabase",
    description: "Base de datos multitenant con aislamiento criptográfico por organización",
  },
  {
    emoji: "🎭",
    name: "Playwright",
    description: "Scraping de datos industriales con evasión de sistemas anti-bot",
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
            Se conecta a tu CRM actual. Sin migraciones, sin fricción, sin curva de aprendizaje.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {INTEGRATIONS.map(({ emoji, name, description }) => (
            <div
              key={name}
              className="int-card rounded-xl border border-black/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-leadby-500/30 hover:shadow-[0_4px_20px_rgba(255,117,31,0.08)]"
              style={{ visibility: "hidden" }}
            >
              <span className="text-2xl leading-none">{emoji}</span>
              <h3 className="mt-3 text-sm font-semibold">{name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-black/55 dark:text-white/55">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
