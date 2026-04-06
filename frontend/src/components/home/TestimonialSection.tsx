"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

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
            gsap.set(".ts-block", { autoAlpha: 1, clearProps: "transform" });
            return;
          }

          gsap.from(".ts-block", {
            autoAlpha: 0,
            y: 30,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
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
      {/* Orbe naranja sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-leadby-500/8 blur-3xl"
      />

      <div className="mx-auto max-w-5xl px-6">
        <div
          className="ts-block relative mx-auto max-w-3xl text-center"
          style={{ visibility: "hidden" }}
        >
          {/* Quote mark */}
          <div
            aria-hidden
            className="mb-6 select-none text-8xl font-bold leading-none text-leadby-500/15"
          >
            &ldquo;
          </div>

          {/* Quote */}
          <blockquote className="text-xl font-medium italic leading-relaxed text-balance md:text-2xl">
            Antes íbamos a las ferias a pescar sin saber qué íbamos a encontrar.
            Ahora llegamos con una lista de prospectos cualificados y sabemos exactamente
            a quién queremos conocer.
          </blockquote>

          {/* Attribution */}
          <div className="mt-8 flex flex-col items-center gap-3">
            {/* Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-leadby-500/20 text-sm font-bold text-leadby-500 ring-2 ring-leadby-500/20">
              DC
            </div>

            <div>
              <p className="text-sm font-semibold">Director Comercial</p>
              <p className="text-xs text-black/55 dark:text-white/55">
                Fabricante de maquinaria CNC · Corredor del Henares
              </p>
            </div>

            {/* Result badge */}
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-leadby-500/30 bg-leadby-500/8 px-3 py-1 text-xs font-medium text-leadby-500">
              <span className="h-1.5 w-1.5 rounded-full bg-leadby-500" />
              −80% tiempo de prospección en 6 meses
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
