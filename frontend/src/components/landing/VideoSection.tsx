"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Play } from "lucide-react";

export function VideoSection() {
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
              [
                ".video-label",
                ".video-headline",
                ".video-sub",
                ".video-wrapper",
                ".play-btn",
                ".video-progress-bar-fill",
              ],
              { autoAlpha: 1, clearProps: "transform" }
            );
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 72%",
              toggleActions: "play none none none",
            },
            defaults: { ease: "power3.out" },
          });

          // Text stagger
          tl.from(".video-label", { x: -16, autoAlpha: 0, duration: 0.45 });
          tl.from(
            ".video-headline",
            { y: 28, autoAlpha: 0, duration: 0.6 },
            "-=0.2"
          );
          tl.from(
            ".video-sub",
            { y: 18, autoAlpha: 0, duration: 0.5 },
            "-=0.3"
          );

          // Video frame slides up
          tl.from(
            ".video-wrapper",
            {
              y: 56,
              autoAlpha: 0,
              scale: 0.96,
              duration: 0.75,
              ease: "power2.out",
            },
            "-=0.2"
          );

          // Progress bar fills left to right
          tl.from(
            ".video-progress-bar-fill",
            {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 1.2,
              ease: "power1.inOut",
            },
            "-=0.3"
          );

          // Play button bounces in
          tl.from(
            ".play-btn",
            { scale: 0, autoAlpha: 0, ease: "back.out(2)", duration: 0.55 },
            "-=0.8"
          );

          // Sonar pulse rings — run independently, infinite
          gsap.to(".play-ring-1", {
            scale: 1.8,
            autoAlpha: 0,
            duration: 1.8,
            repeat: -1,
            ease: "power1.out",
          });
          gsap.to(".play-ring-2", {
            scale: 1.8,
            autoAlpha: 0,
            duration: 1.8,
            repeat: -1,
            ease: "power1.out",
            delay: 0.9,
          });

          // Subtle parallax on the video inner while scrolling
          gsap.to(".video-inner", {
            yPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: ".video-wrapper",
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
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
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-gray-950 py-24"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-leadby-500/10 blur-3xl" />
        <div className="absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-leadby-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p
            className="video-label mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500"
            style={{ visibility: "hidden" }}
          >
            Próximamente
          </p>
          <h2
            className="video-headline text-balance text-3xl font-semibold text-white md:text-4xl"
            style={{ visibility: "hidden" }}
          >
            Descubre cómo funciona LeadBy.
          </h2>
          <p
            className="video-sub mt-4 text-base leading-relaxed text-white/60"
            style={{ visibility: "hidden" }}
          >
            Una demostración en vídeo de cómo LeadBy automatiza tu prospección
            y multiplica los resultados de tu equipo comercial.
          </p>
        </div>

        {/* Video wrapper */}
        <div
          className="video-wrapper relative overflow-hidden rounded-2xl shadow-2xl shadow-leadby-500/10"
          style={{ visibility: "hidden" }}
        >
          {/* 16:9 aspect ratio */}
          <div className="relative aspect-video w-full">
            <div className="video-inner absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-leadby-900/40">
              {/* Subtle grid lines */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                }}
              />

              {/* Watermark */}
              <div
                aria-hidden
                className="absolute right-8 top-6 select-none text-7xl font-bold uppercase tracking-widest text-white/[0.04]"
              >
                Demo
              </div>

              {/* Decorative corner accent */}
              <div
                aria-hidden
                className="absolute left-0 top-0 h-32 w-32 rounded-br-full bg-leadby-500/5"
              />
              <div
                aria-hidden
                className="absolute bottom-0 right-0 h-48 w-48 rounded-tl-full bg-leadby-400/5"
              />

              {/* Play button group (centered) */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Sonar rings */}
                <div
                  aria-hidden
                  className="play-ring-1 pointer-events-none absolute h-24 w-24 rounded-full border-2 border-leadby-500/50"
                />
                <div
                  aria-hidden
                  className="play-ring-2 pointer-events-none absolute h-24 w-24 rounded-full border-2 border-leadby-500/50"
                />

                {/* Play button */}
                <button
                  className="play-btn relative flex h-16 w-16 items-center justify-center rounded-full bg-leadby-500 shadow-leadby transition-transform hover:scale-110 hover:bg-leadby-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leadby-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
                  aria-label="Reproducir vídeo de demostración"
                  style={{ visibility: "hidden" }}
                >
                  <Play className="ml-1 h-6 w-6 fill-white text-white" />
                </button>
              </div>

              {/* Bottom gradient fade */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-950/60 to-transparent" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="video-progress-bar-fill h-full w-[65%] rounded-full bg-gradient-to-r from-leadby-500 to-leadby-400"
            style={{ visibility: "hidden" }}
          />
        </div>

        {/* Video metadata row */}
        <div className="mt-3 flex items-center justify-between text-xs text-white/30">
          <span>LeadBy — Demo comercial</span>
          <span>3:42</span>
        </div>
      </div>
    </section>
  );
}
