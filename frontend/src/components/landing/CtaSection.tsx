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
              [".cta-card", ".cta-headline", ".cta-desc", ".cta-btn"],
              { autoAlpha: 1, clearProps: "transform" }
            );
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
            defaults: { ease: "power3.out" },
          });

          // Card bounces into view
          tl.from(".cta-card", {
            y: 48,
            scale: 0.97,
            autoAlpha: 0,
            duration: 0.7,
          });

          // Headline
          tl.from(
            ".cta-headline",
            { y: 20, autoAlpha: 0, duration: 0.55, ease: "power2.out" },
            "-=0.35"
          );

          // Description
          tl.from(
            ".cta-desc",
            { y: 16, autoAlpha: 0, duration: 0.5, ease: "power2.out" },
            "-=0.3"
          );

          // Buttons stagger in with back ease
          tl.from(
            ".cta-btn",
            {
              y: 12,
              scale: 0.9,
              autoAlpha: 0,
              stagger: 0.12,
              duration: 0.45,
              ease: "back.out(1.7)",
            },
            "-=0.2"
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
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="cta-btn inline-flex items-center justify-center rounded-full bg-leadby-500 px-6 py-3 text-sm font-semibold text-foreground shadow-leadby transition-colors hover:bg-leadby-600"
              style={{ visibility: "hidden" }}
            >
              Agenda una demostración
            </Link>
            <Link
              href="/precios"
              className="cta-btn inline-flex items-center justify-center rounded-full border border-leadby-500/40 px-6 py-3 text-sm font-semibold text-leadby-500 transition-colors hover:border-leadby-500 hover:bg-leadby-50/60 dark:hover:bg-white/5"
              style={{ visibility: "hidden" }}
            >
              Ver precios
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
