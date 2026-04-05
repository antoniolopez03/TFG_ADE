"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Database, Mail, Search } from "lucide-react";

const BENEFITS = [
  {
    icon: Search,
    title: "Prospección Automatizada.",
    description:
      "Encuentra a tu cliente ideal en el sector industrial sin búsquedas manuales.",
  },
  {
    icon: Mail,
    title: "Hiperpersonalización IA.",
    description:
      "Comunicaciones únicas y adaptadas redactadas cognitivamente a gran escala, erradicando el correo masivo.",
  },
  {
    icon: Database,
    title: "Sincronización Total.",
    description:
      "Registro automático de la actividad comercial, manteniendo tu CRM siempre actualizado sin carga administrativa.",
  },
];

export function BenefitsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

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
            gsap.set([".benefits-label", ".benefit-card"], {
              autoAlpha: 1,
              clearProps: "transform",
            });
            return;
          }

          // Label slides in from left
          gsap.from(".benefits-label", {
            x: -20,
            autoAlpha: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".benefits-label",
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });

          // Set cards invisible before batch trigger
          gsap.set(".benefit-card", { autoAlpha: 0, y: 36 });

          ScrollTrigger.batch(".benefit-card", {
            start: "top 82%",
            once: true,
            onEnter: (elements) => {
              gsap.to(elements, {
                autoAlpha: 1,
                y: 0,
                duration: 0.65,
                stagger: 0.14,
                ease: "power3.out",
                overwrite: true,
              });
            },
          });

          // Hover: icon bounce (contextSafe required for event handlers)
          if (contextSafe) {
            const cards =
              containerRef.current?.querySelectorAll(".benefit-card") ?? [];

            const onMouseEnter = contextSafe((e: Event) => {
              const icon = (e.currentTarget as HTMLElement).querySelector(
                ".benefit-icon"
              );
              if (!icon) return;
              gsap.fromTo(
                icon,
                { scale: 1, rotation: 0 },
                {
                  scale: 1.18,
                  rotation: -8,
                  duration: 0.18,
                  ease: "power2.out",
                  yoyo: true,
                  repeat: 1,
                }
              );
            });

            cards.forEach((card) =>
              card.addEventListener("mouseenter", onMouseEnter)
            );

            return () => {
              cards.forEach((card) =>
                card.removeEventListener("mouseenter", onMouseEnter)
              );
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
    <div ref={containerRef}>
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2
            className="benefits-label text-sm font-semibold uppercase tracking-[0.26em] text-leadby-500"
            style={{ visibility: "hidden" }}
          >
            Beneficios core
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="benefit-card rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-leadby-500/20 hover:shadow-md dark:border-white/10 dark:bg-white/5"
                style={{ visibility: "hidden" }}
              >
                <div className="benefit-icon flex h-11 w-11 items-center justify-center rounded-full bg-leadby-500/15 text-leadby-500">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/70 dark:text-white/70">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
