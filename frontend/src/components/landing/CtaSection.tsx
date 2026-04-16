"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Link from "next/link";

export function CtaSection() {
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
              [".cta-card", ".cta-headline", ".cta-desc"],
              { autoAlpha: 1, clearProps: "transform" }
            );
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 92%",
              toggleActions: "play none none none",
            },
            defaults: { ease: "power3.out" },
          });

          // Card bounces into view
          tl.from(".cta-card", {
            y: 32,
            scale: 0.98,
            autoAlpha: 0,
            duration: 0.5,
          });

          // Headline
          tl.from(
            ".cta-headline",
            { y: 16, autoAlpha: 0, duration: 0.4, ease: "power2.out" },
            "-=0.25"
          );

          // Description
          tl.from(
            ".cta-desc",
            { y: 12, autoAlpha: 0, duration: 0.4, ease: "power2.out" },
            "-=0.25"
          );

          // Subtle breathing glow on the card — infinite
          gsap.to(".cta-card", {
            boxShadow: "0 0 40px 8px rgba(255, 117, 31, 0.12)",
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      );

      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div
          className="cta-card rounded-3xl border border-leadby-500/20 bg-leadby-400/10 px-8 py-12 text-center shadow-sm shadow-black/5 dark:bg-leadby-400/15"
          style={{ visibility: "hidden" }}
        >
          <h2
            className="cta-headline text-balance text-3xl font-semibold md:text-4xl"
            style={{ visibility: "hidden" }}
          >
            ¿Listo para transformar tu operativa comercial?
          </h2>
          <p
            className="cta-desc mt-6 text-base leading-relaxed text-black/70 dark:text-white/70"
            style={{ visibility: "hidden" }}
          >
            Agenda una demostración personalizada y descubre cómo LeadBy puede
            multiplicar la productividad de tu equipo de ventas desde el primer
            mes.
          </p>
          <Link
            href="/contact"
            className="cta-btn mt-8 inline-flex items-center justify-center rounded-full bg-leadby-500 px-8 py-4 text-base font-semibold text-white shadow-leadby transition-all duration-300 hover:-translate-y-1 hover:bg-leadby-600 hover:shadow-xl"
          >
            Contactar ahora
          </Link>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/precios"
              className="cta-btn inline-flex items-center justify-center rounded-full border border-leadby-500/40 px-6 py-3 text-sm font-semibold text-leadby-500 transition-colors hover:border-leadby-500 hover:bg-leadby-50/60 dark:hover:bg-white/5"
            >
              Ver precios
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
