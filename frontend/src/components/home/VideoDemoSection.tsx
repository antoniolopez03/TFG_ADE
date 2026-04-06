"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { VideoDemo } from "./VideoDemo";

const CHIPS = [
  { label: "✓ Prospección automatizada", pos: "top-3 left-3" },
  { label: "✓ Cold email con IA", pos: "top-3 right-3" },
  { label: "✓ Sync HubSpot en tiempo real", pos: "bottom-3 right-3" },
];

export function VideoDemoSection() {
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
            gsap.set([".vd-headline", ".vd-sub", ".vd-frame", ".vd-chip"], {
              autoAlpha: 1,
              clearProps: "transform",
            });
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

          tl.from(".vd-headline", { y: 24, autoAlpha: 0, duration: 0.5 })
            .from(".vd-sub", { y: 16, autoAlpha: 0, duration: 0.4 }, "-=0.25")
            .from(
              ".vd-frame",
              { scale: 0.95, autoAlpha: 0, duration: 0.8, ease: "power2.out" },
              "-=0.2"
            )
            .from(
              ".vd-chip",
              { y: 10, autoAlpha: 0, stagger: 0.15, duration: 0.4, ease: "power2.out" },
              "-=0.4"
            );
        }
      );

      document.fonts.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} id="demo-video" className="py-24 overflow-hidden">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2
            className="vd-headline text-3xl font-semibold md:text-4xl text-balance"
            style={{ visibility: "hidden" }}
          >
            Mira cómo funciona en 90 segundos
          </h2>
          <p
            className="vd-sub mt-4 text-base leading-relaxed text-black/60 dark:text-white/60 max-w-xl mx-auto"
            style={{ visibility: "hidden" }}
          >
            Del lead sin contacto al correo aprobado en tu CRM. Todo automatizado.
          </p>
        </div>

        {/* Video container */}
        <div
          className="vd-frame relative"
          style={{ visibility: "hidden" }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-black/8 dark:border-white/10 shadow-[0_20px_80px_rgba(255,117,31,0.15)]">
            <VideoDemo />
          </div>

          {/* Feature chips */}
          {CHIPS.map((chip) => (
            <div
              key={chip.label}
              className={`vd-chip absolute ${chip.pos} z-10 rounded-full border border-leadby-500/30 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm`}
              style={{ visibility: "hidden" }}
            >
              {chip.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
