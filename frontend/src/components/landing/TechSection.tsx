"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Link2, PlugZap } from "lucide-react";

const CONNECTORS = [
  { name: "SAP", description: "Procesos enterprise" },
  { name: "Salesforce", description: "Sales Cloud y reporting" },
  { name: "HubSpot", description: "Marketing + pipeline" },
  { name: "API a medida", description: "Sistemas propios por REST" },
];

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
              [".tech-headline", ".tech-desc", ".tech-border-line", ".tech-card", ".tech-chip"],
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

          tl.from(".tech-headline", { y: 18, autoAlpha: 0, duration: 0.5 }, "-=0.3");

          tl.from(".tech-desc", { y: 16, autoAlpha: 0, duration: 0.4 }, "-=0.2");
          tl.from(".tech-card", { y: 24, autoAlpha: 0, duration: 0.45 }, "-=0.15");
          tl.from(
            ".tech-chip",
            { y: 12, autoAlpha: 0, scale: 0.96, duration: 0.32, stagger: 0.08 },
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

      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2
          className="tech-headline text-balance text-3xl font-semibold md:text-4xl"
          style={{ visibility: "hidden" }}
        >
          Tecnología que encaja con lo que ya usas
        </h2>

        <p
          className="tech-desc mt-6 text-base leading-relaxed text-black/70 dark:text-white/70"
          style={{ visibility: "hidden" }}
        >
          Integración universal para que LeadBy se conecte a tu ecosistema comercial actual sin fricción.
        </p>

        <div
          className="tech-card mt-10 rounded-3xl border border-black/8 bg-white/80 p-6 text-left shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:border-white/8 dark:bg-white/[0.04] md:p-8"
          style={{ visibility: "hidden" }}
        >
          <div className="grid items-center gap-7 md:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-leadby-500/35 bg-leadby-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-leadby-600 dark:text-leadby-400">
                <PlugZap className="h-3.5 w-3.5" />
                Integración universal
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-balance">
                CRM Connector Layer by API
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-black/65 dark:text-white/65 md:text-base">
                Sin migraciones obligatorias, sin reconstruir procesos. Nos acoplamos a tu stack y activamos la operación comercial con los datos correctos.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CONNECTORS.map((connector) => (
                <div
                  key={connector.name}
                  className="tech-chip rounded-xl border border-black/8 bg-white/85 px-3.5 py-3 dark:border-white/8 dark:bg-black/25"
                  style={{ visibility: "hidden" }}
                >
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Link2 className="h-3.5 w-3.5 text-leadby-500" />
                    {connector.name}
                  </p>
                  <p className="mt-1 text-xs text-black/55 dark:text-white/55">
                    {connector.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
