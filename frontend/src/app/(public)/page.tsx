import Link from "next/link";
import { ArrowRight, Database, Mail, Search } from "lucide-react";

const BENEFITS = [
  {
    icon: Search,
    title: "Prospección Automatizada.",
    description: "Encuentra a tu cliente ideal en el sector industrial sin búsquedas manuales.",
  },
  {
    icon: Mail,
    title: "Hiperpersonalización IA.",
    description: "Comunicaciones únicas y adaptadas redactadas cognitivamente a gran escala, erradicando el correo masivo.",
  },
  {
    icon: Database,
    title: "Sincronización Total.",
    description: "Registro automático de la actividad comercial, manteniendo tu CRM siempre actualizado sin carga administrativa.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500">LeadBy</p>
            <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
              Multiplica las ventas B2B de tu industria sin aumentar tu equipo comercial.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
              Automatiza la prospección y la redacción de correos con Inteligencia Artificial. Libera a tus agentes de
              la carga administrativa para que se enfoquen en lo que realmente importa: la interacción humana y el
              cierre de acuerdos.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/sobre-nosotros"
                className="inline-flex items-center gap-2 rounded-full bg-leadby-500 px-6 py-3 text-sm font-semibold text-foreground shadow-leadby transition-colors hover:bg-leadby-600"
              >
                Descubre cómo funciona
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="rounded-2xl bg-white/70 p-2 shadow-lg shadow-black/5 backdrop-blur dark:bg-white/5">
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
                    <div className={`h-2 ${card.label} rounded bg-gray-200 dark:bg-gray-700`} />
                    <div
                      className={`mt-2 h-5 ${card.value} rounded ${
                        card.accent ? "bg-leadby-500/20" : "bg-gray-200 dark:bg-gray-700"
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
                  { w: "flex-1", tag: "w-18" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-leadby-500/30" />
                    <div className={`h-2 ${row.w} rounded bg-gray-100 dark:bg-gray-800`} />
                    <div className={`h-2 ${row.tag} rounded bg-leadby-500/15`} />
                  </div>
                ))}
              </div>

              {/* Orange glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-leadby-500/5 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 py-20 dark:border-white/10">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-balance text-3xl font-semibold md:text-4xl">Tecnología que se adapta a ti, no al revés.</h2>
          <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
            Nuestra arquitectura se acopla directamente al CRM que tu empresa ya posee. Sin migraciones dolorosas, sin
            curvas de aprendizaje complejas y eliminando el rechazo al cambio tecnológico de las plantillas
            tradicionales.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.26em] text-leadby-500">Beneficios core</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-leadby-500/20 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-leadby-500/15 text-leadby-500">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/70 dark:text-white/70">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-leadby-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6">
          <h2 className="text-balance text-3xl font-semibold md:text-4xl">Especialistas en la Industria Española.</h2>
          <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
            Conocemos la complejidad del sector B2B. Nuestro software está diseñado pensando en las necesidades
            específicas de los fabricantes y distribuidores de maquinaria, adaptándonos a ciclos de venta largos y
            negociaciones de alto valor.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-leadby-500/20 bg-leadby-400/10 px-8 py-12 text-center shadow-sm shadow-black/5 dark:bg-leadby-400/15">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              ¿Listo para transformar tu operativa comercial?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
              Agenda una demostración personalizada y descubre cómo LeadBy puede multiplicar la productividad de tu
              equipo de ventas desde el primer mes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-leadby-500 px-6 py-3 text-sm font-semibold text-foreground shadow-leadby transition-colors hover:bg-leadby-600"
              >
                Agenda una demostración
              </Link>
              <Link
                href="/precios"
                className="inline-flex items-center justify-center rounded-full border border-leadby-500/40 px-6 py-3 text-sm font-semibold text-leadby-500 transition-colors hover:border-leadby-500 hover:bg-leadby-50/60 dark:hover:bg-white/5"
              >
                Ver precios
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
