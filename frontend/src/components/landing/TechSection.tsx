"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export function TechSection() {
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
              [".tech-word-inner", ".tech-desc", ".tech-border-line"],
              { autoAlpha: 1, clearProps: "transform" }
            );
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 95%",
              toggleActions: "play none none none",
            },
            defaults: { ease: "power3.out" },
          });

          // Animated border lines draw in
          tl.from(".tech-border-line", {
            scaleX: 0,
            transformOrigin: "center center",
            duration: 0.6,
            stagger: 0.08,
            ease: "expo.out",
          });

          // Headline words wipe up from below overflow:hidden clip
          tl.from(
            ".tech-word-inner",
            { y: "110%", duration: 0.5, stagger: 0.05 },
            "-=0.35"
          );

          // Description fades up
          tl.from(
            ".tech-desc",
            { y: 20, autoAlpha: 0, duration: 0.45 },
            "-=0.15"
          );
        }
      );

      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    },
    { scope: containerRef }
  );

  // Split headline into words for clip-reveal
  const words = "Tecnología que se adapta a ti, no al revés.".split(" ");

  return (
    <section
      ref={containerRef}
      className="relative border-y border-black/5 py-20 dark:border-white/10"
    >
      {/* Animated border lines (top & bottom) */}
      <div
        aria-hidden
        className="tech-border-line pointer-events-none absolute inset-x-0 top-0 h-px origin-center bg-gradient-to-r from-transparent via-leadby-500/40 to-transparent"
        style={{ visibility: "hidden" }}
      />
      <div
        aria-hidden
        className="tech-border-line pointer-events-none absolute inset-x-0 bottom-0 h-px origin-center bg-gradient-to-r from-transparent via-leadby-500/40 to-transparent"
        style={{ visibility: "hidden" }}
      />

      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-balance text-3xl font-semibold md:text-4xl">
          {words.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <span
                className="tech-word-inner inline-block"
                style={{ visibility: "hidden" }}
              >
                {word}
                {i < words.length - 1 ? "\u00A0" : ""}
              </span>
            </span>
          ))}
        </h2>

        <p
          className="tech-desc mt-6 text-base leading-relaxed text-black/70 dark:text-white/70"
          style={{ visibility: "hidden" }}
        >
          Nuestra arquitectura se acopla directamente al CRM que tu empresa ya
          posee. Sin migraciones dolorosas, sin curvas de aprendizaje complejas
          y eliminando el rechazo al cambio tecnológico de las plantillas
          tradicionales.
        </p>
      </div>
    </section>
  );
}
