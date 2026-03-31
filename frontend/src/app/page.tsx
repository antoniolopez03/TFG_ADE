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

          <div className="rounded-2xl bg-white/70 p-2 shadow-lg shadow-black/5 backdrop-blur dark:bg-white/5">
            {/* TODO: Actualizar este vídeo con la versión final. Asegurar que el archivo video-corpoartivo-leadby.mp4 esté en la carpeta /public */}
            <video
              src="/video-corpoartivo-leadby.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full rounded-xl border border-gray-200 object-cover shadow-lg dark:border-gray-800"
            />
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
                className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5"
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
    </>
  );
}
