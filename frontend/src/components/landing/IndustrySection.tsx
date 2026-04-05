"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export function IndustrySection() {
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
              [".industry-blob", ".industry-line", ".industry-desc", ".industry-accent-bar"],
              { autoAlpha: 1, clearProps: "transform" }
            );
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
            defaults: { ease: "power3.out" },
          });

          // Background blob grows organically
          tl.from(".industry-blob", {
            scale: 0,
            autoAlpha: 0,
            duration: 1.4,
            ease: "power1.out",
          });

          // Left accent bar draws down
          tl.from(
            ".industry-accent-bar",
            {
              scaleY: 0,
              transformOrigin: "top center",
              duration: 0.7,
              ease: "expo.out",
            },
            "<0.3"
          );

          // Headline lines reveal
          tl.from(
            ".industry-line",
            { y: 36, autoAlpha: 0, stagger: 0.1, duration: 0.65 },
            "-=0.5"
          );

          // Description fades up
          tl.from(
            ".industry-desc",
            { y: 20, autoAlpha: 0, duration: 0.55 },
            "-=0.2"
          );
        }
      );

      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="relative overflow-hidden py-20">
      {/* Ambient blob */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="industry-blob absolute left-0 top-0 h-64 w-64 rounded-full bg-leadby-500/10 blur-3xl"
          style={{ visibility: "hidden" }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Left accent bar */}
        <div className="relative pl-6">
          <div
            className="industry-accent-bar absolute left-0 top-0 h-full w-0.5 rounded-full bg-leadby-500/40"
            style={{ visibility: "hidden" }}
          />

          <h2 className="text-balance text-3xl font-semibold md:text-4xl">
            <span
              className="industry-line block"
              style={{ visibility: "hidden" }}
            >
              Especialistas en la
            </span>
            <span
              className="industry-line block text-leadby-500"
              style={{ visibility: "hidden" }}
            >
              Industria Española.
            </span>
          </h2>

          <p
            className="industry-desc mt-6 text-base leading-relaxed text-black/70 dark:text-white/70"
            style={{ visibility: "hidden" }}
          >
            Conocemos la complejidad del sector B2B. Nuestro software está
            diseñado pensando en las necesidades específicas de los fabricantes
            y distribuidores de maquinaria, adaptándonos a ciclos de venta
            largos y negociaciones de alto valor.
          </p>
        </div>
      </div>
    </section>
  );
}
