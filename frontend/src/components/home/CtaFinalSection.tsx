"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Link from "next/link";

export function CtaFinalSection() {
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
            gsap.set([".cfa-card", ".cfa-headline", ".cfa-desc"], {
              autoAlpha: 1,
              clearProps: "transform",
            });
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            defaults: { ease: "power3.out" },
          });

          tl.from(".cfa-card", {
            scale: 0.96,
            autoAlpha: 0,
            duration: 0.7,
            ease: "back.out(1.4)",
          })
            .from(".cfa-headline", { y: 18, autoAlpha: 0, duration: 0.45 }, "-=0.35")
            .from(".cfa-desc", { y: 12, autoAlpha: 0, duration: 0.4 }, "-=0.25");

          // Breathing glow
          gsap.to(".cfa-card", {
            boxShadow: "0 0 60px 12px rgba(255,117,31,0.10)",
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      );

      document.fonts.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-20 overflow-hidden">
      <div className="mx-auto max-w-5xl px-6">
        <div
          className="cfa-card rounded-3xl border border-leadby-500/20 bg-leadby-500/8 px-8 py-16 text-center"
          style={{ visibility: "hidden" }}
        >
          <h2
            className="cfa-headline text-balance text-3xl font-semibold md:text-4xl"
            style={{ visibility: "hidden" }}
          >
            ¿Listo para transformar tu operativa comercial?
          </h2>
          <p
            className="cfa-desc mt-6 max-w-xl mx-auto text-base leading-relaxed text-black/65 dark:text-white/65"
            style={{ visibility: "hidden" }}
          >
            Agenda una demo de 30 minutos. Verás el sistema funcionando con datos reales
            de tu sector industrial.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="cfa-btn inline-flex items-center gap-2 rounded-full bg-leadby-500 px-7 py-3.5 text-sm font-semibold text-white shadow-leadby transition-all hover:bg-leadby-600"
            >
              Hablar con un experto
            </Link>
            <Link
              href="/precios"
              className="cfa-btn inline-flex items-center gap-2 rounded-full border border-leadby-500/40 px-7 py-3.5 text-sm font-semibold text-leadby-500 transition-all hover:border-leadby-500 hover:bg-leadby-50/60 dark:hover:bg-white/5"
            >
              Ver precios →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
