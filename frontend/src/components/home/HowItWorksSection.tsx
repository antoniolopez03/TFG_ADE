"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Search, CheckSquare, TrendingUp } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Encuentra empresas ideales automáticamente",
    description:
      "El motor analiza más de 670 empresas industriales en España y filtra las que encajan con tu perfil de cliente ideal. Sin búsquedas manuales ni directorios.",
    tags: ["Búsqueda manual", "Modo Lookalike IA"],
  },
  {
    number: "02",
    icon: CheckSquare,
    title: "Revisa y aprueba cada lead con un clic",
    description:
      "Ves empresa, contacto, cargo y LinkedIn de cada prospecto. Apruebas los buenos, descartas los malos. La IA genera el borrador del cold email al instante.",
    tags: ["Bandeja de leads", "Human-in-the-loop", "Editor IA"],
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "El correo llega al CRM, tú cierras el trato",
    description:
      "Un clic en 'Confirmar y Enviar' dispara el flujo: el correo sale con Resend y queda registrado automáticamente en HubSpot. Cero administración.",
    tags: ["HubSpot sync", "Resend DKIM", "Registro automático"],
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
            gsap.set([".hiw-label", ".hiw-headline", ".hiw-card"], {
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

          tl.from(".hiw-label", { y: -12, autoAlpha: 0, duration: 0.35 })
            .from(".hiw-headline", { y: 20, autoAlpha: 0, duration: 0.45 }, "-=0.2");

          // Set cards invisible first, then batch animate
          gsap.set(".hiw-card", { autoAlpha: 0, y: 40 });

          ScrollTrigger.batch(".hiw-card", {
            start: "top 88%",
            once: true,
            onEnter: (elements) => {
              gsap.to(elements, {
                autoAlpha: 1,
                y: 0,
                duration: 0.55,
                stagger: 0.15,
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
    <section
      ref={containerRef}
      className="border-y border-black/5 dark:border-white/8 py-24 overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
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
            De cero a pipeline en tres pasos
          </h2>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ number, icon: Icon, title, description, tags }) => (
            <article
              key={number}
              className="hiw-card relative rounded-2xl border border-black/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-leadby-500/30 hover:shadow-[0_8px_30px_rgba(255,117,31,0.08)]"
              style={{ visibility: "hidden" }}
            >
              {/* Large step number */}
              <div
                aria-hidden
                className="absolute top-4 right-5 select-none text-6xl font-bold leading-none text-leadby-500/15"
              >
                {number}
              </div>

              {/* Icon */}
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-leadby-500/20 bg-leadby-500/8 text-leadby-500">
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-base font-semibold leading-snug pr-6">{title}</h3>
              <p className="text-sm leading-relaxed text-black/65 dark:text-white/65">
                {description}
              </p>

              {/* Tags */}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/8 dark:border-white/8 bg-black/[0.03] dark:bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-black/55 dark:text-white/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
