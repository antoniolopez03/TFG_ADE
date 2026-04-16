"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Pasamos de prospectar a ciegas a trabajar con oportunidades concretas cada semana. El equipo comercial llega a reunión mucho mejor preparado.",
    name: "Laura Campos",
    role: "Directora Comercial",
    company: "Induval Robotics",
    rating: 5,
  },
  {
    quote:
      "La calidad de los leads y el contexto de cada cuenta nos ayudaron a reducir tiempos internos de análisis y priorización.",
    name: "Mario Navas",
    role: "Responsable de Desarrollo de Negocio",
    company: "Mecaflow Systems",
    rating: 5,
  },
  {
    quote:
      "La integración con el CRM evitó doble trabajo administrativo. Ahora nos enfocamos más en cerrar y menos en registrar datos.",
    name: "Elena Prieto",
    role: "Sales Manager",
    company: "TecnoPack Iberia",
    rating: 4,
  },
  {
    quote:
      "En menos de un trimestre vimos un pipeline más saludable y una comunicación comercial mucho más personalizada.",
    name: "Javier Ortiz",
    role: "Director General",
    company: "Grupo Metalnova",
    rating: 5,
  },
];

export function TestimonialSection() {
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
            gsap.set([".ts-label", ".ts-headline", ".ts-card"], {
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

          tl.from(".ts-label", { y: -10, autoAlpha: 0, duration: 0.35 }).from(
            ".ts-headline",
            { y: 18, autoAlpha: 0, duration: 0.45 },
            "-=0.15"
          );

          gsap.set(".ts-card", { autoAlpha: 0, y: 28 });

          ScrollTrigger.batch(".ts-card", {
            start: "top 90%",
            once: true,
            onEnter: (elements) => {
              gsap.to(elements, {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
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
    <section ref={containerRef} className="relative overflow-hidden py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-leadby-500/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-cyan-500/8 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p
            className="ts-label mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500"
            style={{ visibility: "hidden" }}
          >
            Testimonios
          </p>
          <h2
            className="ts-headline text-3xl font-semibold text-balance md:text-4xl"
            style={{ visibility: "hidden" }}
          >
            Equipos comerciales que ya están acelerando su pipeline
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((item) => (
            <article
              key={item.name}
              className="ts-card rounded-2xl border border-black/8 bg-white/80 p-5 shadow-[0_6px_25px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-leadby-500/35 hover:shadow-[0_10px_30px_rgba(255,117,31,0.12)] dark:border-white/8 dark:bg-white/[0.04]"
              style={{ visibility: "hidden" }}
            >
              <div className="mb-4 flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`${item.name}-${index}`}
                    className="h-4 w-4"
                    fill={index < item.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>

              <blockquote className="text-sm leading-relaxed text-black/70 dark:text-white/70">
                “{item.quote}”
              </blockquote>

              <div className="mt-5 border-t border-black/8 pt-4 dark:border-white/10">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-black/55 dark:text-white/55">{item.role}</p>
                <p className="mt-1 text-xs font-medium text-leadby-600 dark:text-leadby-400">
                  {item.company}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
