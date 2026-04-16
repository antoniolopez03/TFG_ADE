"use client";

// NOTE: Static `metadata` export is incompatible with "use client" in Next.js App Router.
// If SEO metadata is needed for this route, move it to a parent layout.tsx or a server
// wrapper component in a separate file.

import Link from "next/link";
import { Check } from "lucide-react";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PRICING_CARDS = [
  {
    title: "Cuota de Implementación",
    badge: "Fase Inicial",
    price: "6.000€ – 12.000€",
    frequency: "Pago único",
    description:
      "Auditoría de procesos, diseño, configuración e integración del sistema en el CRM de la empresa.",
    features: [
      "Integración total en el CRM de la empresa",
      "Personalización de arquitectura digital",
      "Formación del equipo comercial",
      "Compromiso y garantía desde el primer día",
    ],
    highlighted: false,
  },
  {
    title: "Licencia de Mantenimiento",
    badge: "El Core",
    price: "2.000€",
    frequency: "/ mes",
    description: "Operativa continua, evolución tecnológica y soporte ininterrumpido.",
    features: [
      "Uso de la plataforma automatizada",
      "Gestión de directrices de IA",
      "Alojamiento de base de datos",
      "Soporte técnico ininterrumpido",
      "Actualizaciones continuas",
    ],
    highlighted: true,
  },
];

export default function PricingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Respect prefers-reduced-motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // ── Hero: badge → h1 → paragraph, staggered timeline ──────────────
      gsap.timeline().from(".hero-badge", {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
      }).from(".hero-title", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power2.out",
      }, "-=0.35").from(".hero-desc", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power2.out",
      }, "-=0.35");

      // ── Cards: ScrollTrigger fade-in + translateY + scale ───────────────
      gsap.from(".pricing-card", {
        opacity: 0,
        y: 50,
        scale: 0.96,
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: ".cards-section",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      // ── Highlighted card: continuous border glow ────────────────────────
      gsap.to(".card-glow-border", {
        opacity: 0.35,
        duration: 1.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // ── CTA block: ScrollTrigger scale-in ──────────────────────────────
      gsap.from(".cta-block", {
        opacity: 0,
        scale: 0.97,
        duration: 0.75,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".cta-block",
          start: "top 82%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 py-10 text-center md:py-16">
          <p className="hero-badge will-change-transform mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500">
            Precios
          </p>
          <h1 className="hero-title will-change-transform text-balance text-4xl font-semibold leading-tight md:text-5xl">
            Inversión transparente, alineada con tu crecimiento.
          </h1>
          <p className="hero-desc will-change-transform mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
            No creemos en suscripciones vacías. Nuestro modelo híbrido garantiza una personalización absoluta de la
            infraestructura y escala generando valor real para tu equipo comercial.
          </p>
        </div>
      </section>

      {/* ── Pricing cards ─────────────────────────────────────────────────── */}
      <section className="cards-section pb-20 pt-4">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-leadby-500">El Modelo Híbrido</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold md:text-4xl">
              Dos fases que garantizan personalización y continuidad.
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl grid gap-6 md:grid-cols-2">
            {PRICING_CARDS.map((card) => (
              <article
                key={card.title}
                className={`pricing-card will-change-transform relative flex h-full flex-col rounded-2xl border bg-white/80 p-6 shadow-sm shadow-black/5 backdrop-blur dark:bg-white/5 ${
                  card.highlighted
                    ? "border-2 border-leadby-500/80 bg-white/90 shadow-leadby dark:border-leadby-500/70 dark:bg-white/10"
                    : "border-black/5 dark:border-white/10"
                }`}
              >
                {/* Animated glow overlay on highlighted card border */}
                {card.highlighted && (
                  <span
                    aria-hidden
                    className="card-glow-border pointer-events-none absolute inset-[-2px] rounded-2xl border-2 border-leadby-500 opacity-80"
                  />
                )}

                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-leadby-500">{card.badge}</p>
                <h3 className="mt-3 text-xl font-semibold">{card.title}</h3>
                <div className="mt-4 flex flex-wrap items-baseline justify-center gap-3">
                  <span className="text-3xl font-semibold">{card.price}</span>
                  <span className="text-sm font-semibold text-black/60 dark:text-white/60">{card.frequency}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-black/70 dark:text-white/70">{card.description}</p>

                <ul className="mt-6 space-y-3 text-sm text-black/70 dark:text-white/70">
                  {card.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-leadby-500/15 text-leadby-500">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why it's profitable ───────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="cta-block will-change-transform rounded-3xl border border-leadby-500/20 bg-leadby-400/10 px-8 py-12 text-center shadow-sm shadow-black/5 dark:bg-leadby-400/15">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              ¿Por qué es rentable para el sector industrial?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
              En el mercado de la maquinaria pesada y bienes de equipo, los importes superan frecuentemente las seis
              cifras. Optimizar el embudo de ventas y conseguir un solo contrato adicional gracias a la automatización
              amortiza de forma inmediata toda la inversión tecnológica.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-balance text-3xl font-semibold md:text-4xl">Transforma tu departamento de ventas hoy.</h2>
          <div className="mt-8 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-leadby-500 px-6 py-3 text-sm font-semibold text-foreground shadow-leadby transition-colors hover:bg-leadby-600"
            >
              Solicitar auditoría técnica
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
