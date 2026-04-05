"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    (context, contextSafe) => {
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
              [
                ".hero-badge",
                ".hero-word",
                ".hero-desc",
                ".hero-cta",
                ".hero-mockup",
                ".hero-glow",
                ".mockup-row",
              ],
              { autoAlpha: 1, clearProps: "transform" }
            );
            return;
          }

          // ── Entrance timeline ────────────────────────────────────────────
          const tl = gsap.timeline({
            defaults: { ease: "power3.out", duration: 0.7 },
          });

          tl.from(".hero-badge", { x: -24, autoAlpha: 0, duration: 0.5 });

          tl.from(
            ".hero-word",
            { y: 40, autoAlpha: 0, stagger: 0.07, duration: 0.65 },
            "-=0.2"
          );

          tl.from(
            ".hero-desc",
            { y: 20, autoAlpha: 0, duration: 0.55 },
            "-=0.3"
          );

          tl.from(
            ".hero-cta",
            {
              scale: 0.88,
              autoAlpha: 0,
              ease: "back.out(1.7)",
              duration: 0.5,
            },
            "-=0.2"
          );

          tl.from(
            ".hero-mockup",
            { x: 48, autoAlpha: 0, duration: 0.85, ease: "power2.out" },
            "-=0.65"
          );

          tl.from(
            ".hero-glow",
            {
              scale: 0.5,
              autoAlpha: 0,
              duration: 1.2,
              stagger: 0.2,
              ease: "power1.out",
            },
            "<0.3"
          );

          tl.from(
            ".mockup-row",
            {
              scaleX: 0,
              transformOrigin: "left center",
              stagger: 0.07,
              duration: 0.4,
              ease: "power2.out",
            },
            "-=0.6"
          );

          // ── Scroll parallax on glow orbs ─────────────────────────────────
          gsap.to(".hero-glow-top", {
            yPercent: -30,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1.5,
            },
          });

          gsap.to(".hero-glow-bottom", {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 2,
            },
          });

          // ── Floating animation on mockup (uses y) ────────────────────────
          tl.to(
            ".hero-mockup",
            {
              y: -10,
              duration: 2.8,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            },
            "+=0.5"
          );

          // ── Mouse parallax (orbs + 3D tilt on mockup) ────────────────────
          // contextSafe wraps handlers created after useGSAP so they get
          // properly reverted on unmount.
          if (contextSafe) {
            const onMouseMove = contextSafe((e: Event) => {
              const me = e as MouseEvent;
              const el = containerRef.current;
              if (!el) return;
              const rect = el.getBoundingClientRect();
              // Normalised -1 … +1 from section center
              const nx =
                (me.clientX - rect.left - rect.width / 2) / (rect.width / 2);
              const ny =
                (me.clientY - rect.top - rect.height / 2) / (rect.height / 2);

              // Background orbs drift (x only — y is handled by scroll scrub)
              gsap.to(".hero-glow-top", {
                x: nx * -38,
                duration: 1.2,
                ease: "power2.out",
                overwrite: "auto",
              });
              gsap.to(".hero-glow-bottom", {
                x: nx * 48,
                duration: 1.5,
                ease: "power2.out",
                overwrite: "auto",
              });

              // 3-D card tilt on mockup (rotationY/X don't conflict with y float)
              gsap.to(".hero-mockup", {
                rotationY: nx * 9,
                rotationX: -ny * 5,
                transformPerspective: 900,
                duration: 0.8,
                ease: "power2.out",
                overwrite: "auto",
              });
            });

            const onMouseLeave = contextSafe(() => {
              gsap.to([".hero-glow-top", ".hero-glow-bottom"], {
                x: 0,
                duration: 1,
                ease: "power2.out",
                overwrite: "auto",
              });
              gsap.to(".hero-mockup", {
                rotationY: 0,
                rotationX: 0,
                duration: 0.8,
                ease: "power2.out",
                overwrite: "auto",
              });
            });

            const el = containerRef.current;
            el?.addEventListener("mousemove", onMouseMove);
            el?.addEventListener("mouseleave", onMouseLeave);

            return () => {
              el?.removeEventListener("mousemove", onMouseMove);
              el?.removeEventListener("mouseleave", onMouseLeave);
            };
          }
        }
      );

      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="relative overflow-hidden">
      {/* Background glow orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="hero-glow hero-glow-top absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/20 blur-3xl"
          style={{ visibility: "hidden" }}
        />
        <div
          className="hero-glow hero-glow-bottom absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl"
          style={{ visibility: "hidden" }}
        />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
        {/* Left: copy */}
        <div>
          <p
            className="hero-badge mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500"
            style={{ visibility: "hidden" }}
          >
            LeadBy
          </p>

          <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
            <span
              className="hero-word inline-block"
              style={{ visibility: "hidden" }}
            >
              Multiplica las ventas B2B
            </span>{" "}
            <span
              className="hero-word inline-block"
              style={{ visibility: "hidden" }}
            >
              de tu industria
            </span>{" "}
            <span
              className="hero-word inline-block"
              style={{ visibility: "hidden" }}
            >
              sin aumentar tu equipo comercial.
            </span>
          </h1>

          <p
            className="hero-desc mt-6 text-base leading-relaxed text-black/70 dark:text-white/70"
            style={{ visibility: "hidden" }}
          >
            Automatiza la prospección y la redacción de correos con Inteligencia
            Artificial. Libera a tus agentes de la carga administrativa para que
            se enfoquen en lo que realmente importa: la interacción humana y el
            cierre de acuerdos.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/sobre-nosotros"
              className="hero-cta inline-flex items-center gap-2 rounded-full bg-leadby-500 px-6 py-3 text-sm font-semibold text-foreground shadow-leadby transition-colors hover:bg-leadby-600"
              style={{ visibility: "hidden" }}
            >
              Descubre cómo funciona
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right: dashboard mockup */}
        <div
          className="hero-mockup rounded-2xl bg-white/70 p-2 shadow-lg shadow-black/5 backdrop-blur dark:bg-white/5"
          style={{ visibility: "hidden" }}
        >
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
            {/* Window bar */}
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <div className="h-2.5 w-2.5 rounded-full bg-leadby-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-leadby-300" />
              <div className="h-2.5 w-2.5 rounded-full bg-leadby-200" />
              <div className="ml-4 h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-3 p-4">
              {[
                { label: "w-14", value: "w-8", accent: true },
                { label: "w-16", value: "w-6", accent: false },
                { label: "w-12", value: "w-10", accent: true },
              ].map((card, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div
                    className={`h-2 ${card.label} rounded bg-gray-200 dark:bg-gray-700`}
                  />
                  <div
                    className={`mt-2 h-5 ${card.value} rounded ${
                      card.accent
                        ? "bg-leadby-500/20"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Table rows */}
            <div className="space-y-2.5 px-4 pb-4">
              {[
                { w: "flex-1", tag: "w-20" },
                { w: "w-3/4", tag: "w-16" },
                { w: "w-5/6", tag: "w-24" },
                { w: "w-2/3", tag: "w-14" },
                { w: "flex-1", tag: "w-20" },
              ].map((row, i) => (
                <div
                  key={i}
                  className="mockup-row flex items-center gap-3"
                  style={{ visibility: "hidden" }}
                >
                  <div className="h-3 w-3 rounded-full bg-leadby-500/30" />
                  <div
                    className={`h-2 ${row.w} rounded bg-gray-100 dark:bg-gray-800`}
                  />
                  <div className={`h-2 ${row.tag} rounded bg-leadby-500/15`} />
                </div>
              ))}
            </div>

            {/* Orange glow overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-leadby-500/5 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
