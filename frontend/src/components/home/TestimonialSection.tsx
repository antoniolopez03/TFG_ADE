"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Star } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote:
      "Pasamos de prospectar a ciegas a trabajar con oportunidades concretas cada semana. El equipo comercial llega a reunión mucho mejor preparado.",
    name: "Laura Campos",
    role: "Directora Comercial",
    company: "Induval Robotics",
    rating: 5,
  },
  {
    quote:
      "La calidad de los leads y el contexto de cada cuenta nos ayudaron a reducir tiempos internos de análisis y priorización.",
    name: "Mario Navas",
    role: "Responsable de Desarrollo de Negocio",
    company: "Mecaflow Systems",
    rating: 5,
  },
  {
    quote:
      "La integración con el CRM evitó doble trabajo administrativo. Ahora nos enfocamos más en cerrar y menos en registrar datos.",
    name: "Elena Prieto",
    role: "Sales Manager",
    company: "TecnoPack Iberia",
    rating: 4,
  },
  {
    quote:
      "En menos de un trimestre vimos un pipeline más saludable y una comunicación comercial mucho más personalizada.",
    name: "Javier Ortiz",
    role: "Director General",
    company: "Grupo Metalnova",
    rating: 5,
  },
  {
    quote:
      "Los correos generados por IA llegaron con un nivel de personalización que superó nuestras expectativas. La tasa de apertura subió más de un 40 %.",
    name: "Carlos Serrano",
    role: "Head of Sales",
    company: "BioTech Iberia",
    rating: 5,
  },
  {
    quote:
      "Antes tardábamos semanas en construir una lista cualificada. Ahora lo hacemos en horas y con mejor contexto comercial para cada cuenta.",
    name: "Ana Morillo",
    role: "VP de Ventas",
    company: "Ferromax Industrial",
    rating: 5,
  },
  {
    quote:
      "El flujo human-in-the-loop es clave para nosotros. Supervisamos cada mensaje antes de enviarlo sin perder velocidad comercial.",
    name: "Roberto Figueras",
    role: "CEO",
    company: "Logística Adriatic",
    rating: 4,
  },
  {
    quote:
      "Nuestro equipo de SDRs pasó de 50 contactos semanales a más de 200 manteniendo la calidad y personalización en cada mensaje.",
    name: "Marta Durán",
    role: "Directora de Expansión",
    company: "Construcciones Llinares",
    rating: 5,
  },
];

// Triple for seamless loop (same technique as LogoTicker)
const TRACK = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

// ─── Component ────────────────────────────────────────────────────────────────

export function TestimonialSection() {
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
            gsap.set([".ts-label", ".ts-headline", ".ts-rows"], {
              autoAlpha: 1,
              clearProps: "transform",
            });
            return;
          }

          // Initial states
          gsap.set(".ts-rows", { autoAlpha: 0 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 82%",
              once: true,
            },
            defaults: { ease: "power3.out" },
          });

          tl.from(".ts-label", { y: -10, autoAlpha: 0, duration: 0.35 })
            .from(".ts-headline", { y: 18, autoAlpha: 0, duration: 0.45 }, "-=0.15")
            .to(".ts-rows", { autoAlpha: 1, duration: 0.6 }, "-=0.1");
        }
      );

      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="relative overflow-hidden py-24">
      {/* Ambient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-leadby-500/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-cyan-500/8 blur-3xl"
      />

      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto mb-14 max-w-6xl px-6 text-center">
        <p
          className="ts-label mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500"
          style={{ visibility: "hidden" }}
        >
          Testimonios
        </p>
        <h2
          className="ts-headline text-3xl font-semibold text-balance md:text-4xl"
          style={{ visibility: "hidden" }}
        >
          Equipos comerciales que ya están acelerando su pipeline
        </h2>
      </div>

      {/* ─── Marquee rows (full-bleed) ────────────────────────────────────────── */}
      <div className="ts-rows relative" style={{ visibility: "hidden" }}>
        {/* Left fade mask */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-background to-transparent"
        />
        {/* Right fade mask */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"
        />

        {/* Single row */}
        <div className="flex" aria-hidden>
          <ul
            className="flex shrink-0 animate-ticker items-stretch gap-5"
            style={{ animationDuration: "35s", willChange: "transform" }}
          >
            {TRACK.map((t, i) => (
              <TestimonialCard key={`ra-${i}`} {...t} />
            ))}
          </ul>
          <ul
            className="flex shrink-0 animate-ticker items-stretch gap-5"
            style={{
              animationDuration: "35s",
              animationDelay: "-17.5s",
              willChange: "transform",
            }}
          >
            {TRACK.map((t, i) => (
              <TestimonialCard key={`rb-${i}`} {...t} />
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Accessible list (screen readers only) ───────────────────────────── */}
      <ul className="sr-only">
        {TESTIMONIALS.map((t) => (
          <li key={t.name}>
            <blockquote>{t.quote}</blockquote>
            <footer>
              {t.name}, {t.role}, {t.company}
            </footer>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

type TestimonialItem = (typeof TESTIMONIALS)[number];

function TestimonialCard({ quote, name, role, company, rating }: TestimonialItem) {
  return (
    <li className="w-[340px] shrink-0 rounded-2xl border border-black/8 bg-white/80 p-5 shadow-[0_6px_25px_rgba(0,0,0,0.05)] dark:border-white/8 dark:bg-white/[0.04]">
      {/* Stars */}
      <div className="mb-3 flex items-center gap-1 text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-3.5 w-3.5"
            fill={i < rating ? "currentColor" : "none"}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-sm leading-relaxed text-black/70 dark:text-white/70">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="mt-4 border-t border-black/8 pt-3 dark:border-white/10">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-black/55 dark:text-white/55">{role}</p>
        <p className="mt-0.5 text-xs font-medium text-leadby-600 dark:text-leadby-400">
          {company}
        </p>
      </div>
    </li>
  );
}
