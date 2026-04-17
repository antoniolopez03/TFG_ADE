"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Link from "next/link";
import { Magnetic } from "@/lib/animations/magnetic";
import { HeroBackground } from "@/components/landing/HeroBackground";

// ─── Data ─────────────────────────────────────────────────────────────────────

const METRICS = [
  { display: "−80%", to: 80, prefix: "−", suffix: "%", label: "Tiempo en prospección" },
  { display: "+35%", to: 35, prefix: "+", suffix: "%", label: "Oportunidades cualificadas" },
  { display: "×10",  to: 10, prefix: "×", suffix: "",  label: "Tasa de respuesta vs. correo masivo" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    (_, _contextSafe) => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion:    "(prefers-reduced-motion: no-preference)",
          noMotion:  "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { motion: hasMotion } = ctx.conditions as {
            motion: boolean;
            noMotion: boolean;
          };

          if (!hasMotion) {
            gsap.set(
              [".h-badge", ".h-headline", ".h-subtitle", ".h-metric", ".h-cta", ".h-trust"],
              { autoAlpha: 1, clearProps: "transform" }
            );
            return;
          }

          // ── Entry timeline ──────────────────────────────────────────────
          const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.65 } });

          tl.from(".h-badge",    { y: -20, autoAlpha: 0 })
            .from(".h-headline", { y: 40,  autoAlpha: 0 },               "-=0.3")
            .from(".h-subtitle", { y: 30,  autoAlpha: 0 },               "-=0.4")
            .from(".h-metric",   { y: 20,  autoAlpha: 0, stagger: 0.1 }, "-=0.3")
            .from(".h-cta",      { y: 20,  autoAlpha: 0, stagger: 0.08 },"-=0.3")
            .from(".h-trust",    { autoAlpha: 0, duration: 0.4 },         "-=0.2");

          // ── CountUp on scroll ───────────────────────────────────────────
          const metricEls =
            containerRef.current?.querySelectorAll<HTMLElement>("[data-countup]") ?? [];

          metricEls.forEach((el) => {
            const to     = Number(el.getAttribute("data-to"));
            const prefix = el.getAttribute("data-prefix") ?? "";
            const suffix = el.getAttribute("data-suffix") ?? "";
            const obj    = { val: 0 };

            gsap.to(obj, {
              val: to, duration: 1.5, ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 95%", once: true },
              onUpdate() {
                el.textContent = prefix + Math.round(obj.val) + suffix;
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
      className="relative min-h-[70dvh] overflow-hidden flex items-center bg-white dark:bg-black"
    >
      {/* ── Animated background layer ─────────────────────────────────────── */}
      <HeroBackground />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 pt-28 pb-20 md:pt-32 md:pb-24 text-center">

        {/* Badge */}
        <div
          className="h-badge mb-6 inline-flex items-center gap-2 rounded-full border border-leadby-500/40 bg-leadby-500/10 px-3 py-1 text-xs font-medium text-leadby-600 dark:text-leadby-400"
          style={{ visibility: "hidden" }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-leadby-600 dark:bg-leadby-400 animate-pulse" />
          Prospección B2B con IA · Nueva era comercial
        </div>

        {/* H1 */}
        <h1
          className="h-headline text-balance text-5xl font-bold leading-[1.08] text-gray-900 dark:text-white md:text-7xl"
          style={{ visibility: "hidden" }}
        >
          La Nueva Era de la{" "}
          <span className="text-leadby-500">Prospección B2B</span>
        </h1>

        {/* Subtitle */}
        <p
          className="h-subtitle mt-6 text-lg leading-relaxed text-gray-600 dark:text-white/60 max-w-xl mx-auto"
          style={{ visibility: "hidden" }}
        >
          Basta de tareas manuales, deja que la IA encuentre a tus clientes ideales, redacte los correos y actualice tu CRM automáticamente. Devuélvele a tu equipo el tiempo para vender.
        </p>

        {/* Metrics */}
        <div className="mt-10 flex flex-wrap items-start justify-center gap-x-10 gap-y-4">
          {METRICS.map((m, i) => (
            <div
              key={i}
              className="h-metric flex flex-col items-center"
              style={{ visibility: "hidden" }}
            >
              <span
                className="text-3xl font-bold text-leadby-500 tabular-nums"
                data-countup
                data-to={m.to}
                data-prefix={m.prefix}
                data-suffix={m.suffix}
              >
                {m.display}
              </span>
              <span className="mt-0.5 text-xs text-gray-400 dark:text-white/40 max-w-[120px] leading-tight text-center">
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Magnetic strength={0.2}>
            <Link
              href="/contact"
              className="h-cta inline-flex items-center gap-2 rounded-full bg-leadby-500 px-7 py-3.5 text-sm font-semibold text-white shadow-leadby transition-all hover:bg-leadby-600 animate-glow-pulse cursor-magnetic"
              style={{ visibility: "hidden" }}
            >
              Empieza gratis — 14 días
              <span aria-hidden>→</span>
            </Link>
          </Magnetic>

          <Magnetic strength={0.15}>
            <button
              onClick={() =>
                document.getElementById("demo-video")?.scrollIntoView({ behavior: "smooth" })
              }
              className="h-cta inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/15 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-white/80 transition-all hover:border-leadby-500/50 hover:text-leadby-500 dark:hover:text-leadby-400 cursor-magnetic"
              style={{ visibility: "hidden" }}
            >
              Ver cómo funciona ↓
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
