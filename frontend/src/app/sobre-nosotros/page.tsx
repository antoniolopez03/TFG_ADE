import Image from "next/image";
import { BannerPortal } from "@/components/layout/BannerPortal";

export default function AboutPage() {
  return (
    <>
      <BannerPortal>
        <div className="bg-leadby-500 text-white">
          <p className="mx-auto max-w-6xl px-6 py-2 text-center text-[11px] font-semibold leading-relaxed sm:text-xs">
            PROYECTO ACADÉMICO: Este sitio web es parte de un Trabajo de Fin de Grado y no tiene fines comerciales reales.
          </p>
        </div>
      </BannerPortal>

      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
          <div className="absolute left-0 top-12 h-36 w-36 rounded-full border border-leadby-500/20" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500">Sobre Nosotros</p>
          <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
            Innovación aplicada: El futuro de la venta industrial.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-black/70 dark:text-white/70">
            LeadBy nace como una propuesta de investigación para transformar equipos comerciales tradicionales mediante
            la automatización y la IA, desarrollada en el marco de la Universidad Complutense de Madrid.
          </p>
        </div>
      </section>

      <section className="border-y border-black/5 py-20 dark:border-white/10">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-balance text-3xl font-semibold md:text-4xl">Investigación y Desarrollo Académico</h2>
          <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
            Este proyecto constituye la vertiente práctica de un Trabajo de Fin de Grado (TFG) para el curso 2025-2026.
            El objetivo primordial es demostrar la viabilidad técnica y económica de automatizar procesos de
            prospección B2B en sectores de alta complejidad técnica.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-leadby-500">El Autor</p>
              <h2 className="text-balance text-3xl font-semibold md:text-4xl">Perfil Híbrido</h2>
              <div className="mt-6 space-y-5 text-base leading-relaxed text-black/70 dark:text-white/70">
                <p>
                  Antonio López Belinchón, estudiante del Doble Grado en Ingeniería Informática y ADE en la Facultad
                  de Ciencias Económicas y Empresariales de la UCM.
                </p>
                <p>
                  Bajo la dirección de Javier Sanz Viejo, este proyecto busca ser un puente entre la teoría académica y
                  la optimización de procesos en el tejido industrial español.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-leadby-500/60 bg-white/70 p-3 shadow-leadby backdrop-blur dark:bg-white/5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-leadby-500/40">
                <Image
                  src="/Foto-Antonio.jpeg"
                  alt="Antonio Lopez Belinchon"
                  fill
                  className="object-cover grayscale"
                  sizes="(min-width: 768px) 40vw, 90vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-leadby-500/10 blur-3xl" />
          <div className="absolute right-12 top-10 h-24 w-24 rounded-full border border-leadby-500/20" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6">
          <h3 className="text-balance text-2xl font-semibold md:text-3xl">Tratamiento de Datos y Cumplimiento</h3>
          <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
            Como plataforma de experimentación, LeadBy aplica rigurosamente el RGPD y la LSSI-CE. Todas las
            funcionalidades están diseñadas para operar en entornos seguros, garantizando que el uso de la IA sea
            siempre asistencial y supervisado por humanos (Human-in-the-loop).
          </p>
        </div>
      </section>
    </>
  );
}
