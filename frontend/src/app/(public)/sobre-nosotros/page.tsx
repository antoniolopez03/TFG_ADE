import type { Metadata } from "next";
import { BannerPortal } from "@/components/layout/BannerPortal";
import { Reveal } from "@/lib/animations/reveal";
import { TextSplit } from "@/lib/animations/text-split";
import { TechStackSection } from "@/components/about/TechStackSection";
import { DifferentiatorsSection } from "@/components/about/DifferentiatorsSection";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description:
    "LeadBy es un proyecto académico de la UCM para validar la automatización de prospección B2B con IA y supervisión humana.",
  alternates: {
    canonical: "/sobre-nosotros",
  },
};

export default function AboutPage() {
  return (
    <>
      {/* ── Academic banner ────────────────────────────────────────────── */}
      <BannerPortal>
        <div className="bg-leadby-500 text-white">
          <p className="mx-auto max-w-6xl px-6 py-2 text-center text-[11px] font-semibold leading-relaxed sm:text-xs">
            PROYECTO ACADÉMICO: Este sitio web es parte de un Trabajo de Fin de Grado y no tiene fines comerciales reales.
          </p>
        </div>
      </BannerPortal>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Float orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="glow-orb animate-float absolute -top-24 left-1/2 -translate-x-1/2"
            style={{
              "--size": "480px",
              "--color": "rgba(255,117,31,0.15)",
              "--blur": "100px",
            } as React.CSSProperties}
          />
          <div
            className="glow-orb animate-float absolute bottom-0 right-0"
            style={{
              "--size": "320px",
              "--color": "rgba(255,145,77,0.10)",
              "--blur": "80px",
              animationDelay: "-2.5s",
            } as React.CSSProperties}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal direction="down" delay={0.05}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500">
              Sobre Nosotros
            </p>
          </Reveal>

          <TextSplit
            type="words"
            stagger={0.04}
            delay={0.15}
            className="text-balance text-4xl font-semibold leading-tight md:text-5xl"
          >
            Innovación aplicada: El futuro de la venta industrial.
          </TextSplit>

          <Reveal direction="up" delay={0.45} threshold={0.05}>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-black/70 dark:text-white/70">
              LeadBy nace como una propuesta de investigación para transformar equipos comerciales
              tradicionales mediante la automatización y la IA, desarrollada en el marco de la
              Universidad Complutense de Madrid.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Investigación y Desarrollo ──────────────────────────────────── */}
      <section className="border-y border-black/5 py-20 dark:border-white/10">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal direction="up" threshold={0.1}>
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              Investigación y Desarrollo Académico
            </h2>
          </Reveal>

          <Reveal direction="up" delay={0.1} threshold={0.1}>
            <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
              Este proyecto constituye la vertiente práctica de un Trabajo de Fin de Grado (TFG)
              para el curso 2025-2026. El objetivo primordial es demostrar la viabilidad técnica y
              económica de automatizar procesos de prospección B2B en sectores de alta complejidad
              técnica.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.2} threshold={0.1}>
            <p className="mt-4 text-base leading-relaxed text-black/70 dark:text-white/70">
              La metodología combina investigación cuantitativa (métricas de conversión, tiempo de
              ciclo de ventas) con desarrollo de software de producción, creando un prototipo
              funcional que valida las hipótesis planteadas en el marco teórico.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Tech Stack ──────────────────────────────────────────────────── */}
      <TechStackSection />

      {/* ── Diferenciadores ──────────────────────────────────────────────── */}
      <DifferentiatorsSection />

      {/* ── El Autor ────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-4xl px-6">
          {/* Copy */}
          <div>
              <Reveal direction="left" threshold={0.1}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-leadby-500">
                  El Autor
                </p>
              </Reveal>

              <Reveal direction="left" delay={0.1} threshold={0.1}>
                <h2 className="text-balance text-3xl font-semibold md:text-4xl">
                  Perfil Híbrido
                </h2>
              </Reveal>

              <Reveal direction="up" delay={0.2} threshold={0.1}>
                <div className="mt-6 space-y-5 text-base leading-relaxed text-black/70 dark:text-white/70">
                  <p>
                    Antonio López Belinchón, estudiante del Doble Grado en Ingeniería Informática y
                    ADE en la Facultad de Ciencias Económicas y Empresariales de la UCM.
                  </p>
                </div>
              </Reveal>

              {/* Highlight badges */}
              <Reveal direction="up" delay={0.35} threshold={0.05}>
                <div className="mt-8 flex flex-wrap gap-2">
                  {[
                    "Ingeniería Informática",
                    "ADE",
                    "UCM · 2025-2026",
                    "Full-Stack",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-leadby-500/30 bg-leadby-500/6 px-3 py-1 text-xs font-medium text-leadby-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
        </div>
      </section>

      {/* ── Compliance / RGPD ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-black/5 pt-10 pb-20 dark:border-white/8">
        <div
          aria-hidden
          className="glow-orb pointer-events-none absolute left-0 top-0"
          style={{
            "--size": "300px",
            "--color": "rgba(255,117,31,0.08)",
            "--blur": "80px",
          } as React.CSSProperties}
        />

        <Reveal direction="up" threshold={0.1}>
          <div className="relative mx-auto max-w-4xl px-6">
            <h3 className="text-balance text-2xl font-semibold md:text-3xl">
              Tratamiento de Datos y Cumplimiento
            </h3>
            <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
              Como plataforma de experimentación, LeadBy aplica rigurosamente el RGPD y la
              LSSI-CE. Todas las funcionalidades están diseñadas para operar en entornos seguros,
              garantizando que el uso de la IA sea siempre asistencial y supervisado por
              humanos (Human-in-the-loop).
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
