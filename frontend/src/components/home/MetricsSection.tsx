"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

const STATS = [
  {
    value: "−80%",
    to: 80,
    prefix: "−",
    suffix: "%",
    label: "Reducción del tiempo de prospección semanal por comercial",
  },
  {
    value: "+45%",
    to: 45,
    prefix: "+",
    suffix: "%",
    label: "Incremento en visitas comerciales presenciales",
  },
  {
    value: "35–45%",
    to: null,
    prefix: null,
    suffix: null,
    label: "Tasa de apertura de correos hiperpersonalizados (vs 8% masivo)",
  },
  {
    value: "6.9×",
    to: 6.9,
    prefix: "",
    suffix: "×",
    label: "Ratio LTV/CAC — retorno sobre la inversión en captación",
    isFloat: true,
  },
];

export function MetricsSection() {
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
            gsap.set([".ms-label", ".ms-headline", ".ms-card"], {
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

          tl.from(".ms-label", { y: -12, autoAlpha: 0, duration: 0.35 })
            .from(".ms-headline", { y: 20, autoAlpha: 0, duration: 0.45 }, "-=0.2");

          // Cards stagger in
          gsap.set(".ms-card", { autoAlpha: 0, y: 20 });

          ScrollTrigger.batch(".ms-card", {
            start: "top 85%",
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

          // CountUp for animatable stats
          const countEls =
            containerRef.current?.querySelectorAll<HTMLElement>("[data-ms-countup]") ?? [];

          countEls.forEach((el) => {
            const to = parseFloat(el.getAttribute("data-to") ?? "0");
            const prefix = el.getAttribute("data-prefix") ?? "";
            const suffix = el.getAttribute("data-suffix") ?? "";
            const isFloat = el.getAttribute("data-float") === "true";
            const obj = { val: 0 };

            gsap.to(obj, {
              val: to,
              duration: 1.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
              onUpdate() {
                const formatted = isFloat ? obj.val.toFixed(1) : Math.round(obj.val).toString();
                el.textContent = prefix + formatted + suffix;
              },
            });
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
      className="border-y border-leadby-500/10 bg-leadby-500/5 py-24 overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <p
            className="ms-label mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500"
            style={{ visibility: "hidden" }}
          >
            Impacto medido
          </p>
          <h2
            className="ms-headline text-3xl font-semibold md:text-4xl text-balance"
            style={{ visibility: "hidden" }}
          >
            Resultados demostrados en la industria española
          </h2>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="ms-card rounded-2xl border border-black/8 dark:border-white/8 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5 text-center"
              style={{ visibility: "hidden" }}
            >
              {stat.to !== null ? (
                <div
                  className="text-4xl font-bold text-leadby-500 tabular-nums"
                  data-ms-countup=""
                  data-to={String(stat.to)}
                  data-prefix={stat.prefix ?? ""}
                  data-suffix={stat.suffix ?? ""}
                  data-float={stat.isFloat ? "true" : "false"}
                >
                  {stat.value}
                </div>
              ) : (
                <div className="text-4xl font-bold text-leadby-500 tabular-nums">
                  {stat.value}
                </div>
              )}
              <p className="mt-2 text-sm leading-snug text-black/60 dark:text-white/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
