import { Check } from "lucide-react";
import { ContactForm } from "@/components/public/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Solicita una demostración personalizada de LeadBy y recibe una hoja de ruta técnica para automatizar tu pipeline comercial B2B.",
  alternates: {
    canonical: "/contact",
  },
};

const HIGHLIGHTS = [
  "Diagnóstico inicial de tu proceso comercial.",
  "Mapa de automatizaciones con impacto inmediato.",
  "Propuesta técnica alineada con tu CRM actual.",
  "Plan de adopción para equipos industriales.",
];

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500">Contacto</p>
          <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
            Agenda una demostración personalizada con LeadBy.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-black/70 dark:text-white/70">
            Cuéntanos el contexto de tu empresa y evaluaremos el potencial de automatización en tu pipeline de ventas
            B2B. Nuestro equipo técnico te devolverá un plan accionable en menos de 48 horas.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-leadby-500">Qué obtendrás</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold md:text-4xl">
              Una hoja de ruta realista para tu equipo comercial.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
              No enviamos respuestas genéricas. Analizamos tu nivel de madurez digital, el volumen de cuentas y los
              puntos de fricción para proponer la automatización más rentable.
            </p>

            <div className="mt-8 space-y-4">
              {HIGHLIGHTS.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-leadby-500/15 text-leadby-500">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
