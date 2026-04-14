import Link from "next/link";
import { Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Modelo de pricing híbrido de LeadBy: implementación inicial, licencia de mantenimiento y comisión por rendimiento para equipos comerciales B2B.",
  alternates: {
    canonical: "/precios",
  },
};

const PRICING_CARDS = [
  {
    title: "Cuota de Implementación",
    badge: "Fase Inicial",
    price: "6.000€ - 12.000€",
    frequency: "Pago único",
    description: "Auditoría, diseño y configuración a medida.",
    features: [
      "Integración total en el CRM de la empresa",
      "Personalización de arquitectura digital",
      "Formación del equipo comercial",
    ],
  },
  {
    title: "Licencia de Mantenimiento",
    badge: "El Core",
    price: "2.000€",
    frequency: "/ mes",
    description: "Operativa, evolución tecnológica y soporte.",
    features: [
      "Uso de la plataforma automatizada",
      "Gestión de directrices de Inteligencia Artificial",
      "Alojamiento de base de datos",
      "Soporte ininterrumpido",
    ],
    highlighted: true,
  },
  {
    title: "Comisión por Rendimiento",
    badge: "A Éxito",
    price: "1%",
    frequency: "de la venta final",
    description: "Asociación estratégica basada en resultados.",
    features: [
      "Minimiza el riesgo percibido",
      "Alineación total de intereses",
      "Pagas cuando el software te ayuda a cerrar contratos",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500">Precios</p>
          <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
            Inversión transparente, alineada con tu crecimiento.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-black/70 dark:text-white/70">
            No creemos en suscripciones vacías. Nuestro modelo híbrido garantiza una personalización absoluta de la
            infraestructura y escala únicamente cuando generamos valor real para tu equipo comercial.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-leadby-500">El Modelo Híbrido</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold md:text-4xl">
              Tres capas que alinean tecnología y rendimiento.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PRICING_CARDS.map((card) => (
              <article
                key={card.title}
                className={`flex h-full flex-col rounded-2xl border bg-white/80 p-6 shadow-sm shadow-black/5 backdrop-blur transition-transform dark:bg-white/5 ${
                  card.highlighted
                    ? "border-2 border-leadby-500/80 bg-white/90 shadow-leadby dark:border-leadby-500/70 dark:bg-white/10"
                    : "border-black/5 dark:border-white/10"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-leadby-500">{card.badge}</p>
                <h3 className="mt-3 text-xl font-semibold">{card.title}</h3>
                <div className="mt-4 flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-semibold">{card.price}</span>
                  <span className="text-sm font-semibold text-black/60 dark:text-white/60">{card.frequency}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-black/70 dark:text-white/70">{card.description}</p>

                <ul className="mt-6 space-y-3 text-sm text-black/70 dark:text-white/70">
                  {card.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-leadby-500/15 text-leadby-500">
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

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-leadby-500/20 bg-leadby-400/10 px-8 py-12 text-center shadow-sm shadow-black/5 dark:bg-leadby-400/15">
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
    </>
  );
}
