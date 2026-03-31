import Link from "next/link";

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "cases", label: "Casos de Éxito" },
  { id: "guides", label: "Guías de Ventas B2B" },
  { id: "ai", label: "Inteligencia Artificial" },
];

const ARTICLES = [
  {
    slug: "reduccion-tiempo-prospeccion-maquinaria",
    category: "Casos de Éxito",
    dateLabel: "18 marzo 2026",
    dateTime: "2026-03-18",
    title: "Cómo reducir un 80% el tiempo de prospección en la venta de maquinaria.",
    excerpt:
      "Análisis de rentabilidad sobre cómo la automatización de la búsqueda de clientes libera a los comerciales para centrarse en la negociación presencial.",
  },
  {
    slug: "hiperpersonalizacion-correo-b2b",
    category: "Guías de Ventas B2B",
    dateLabel: "09 marzo 2026",
    dateTime: "2026-03-09",
    title: "El fin del correo en frío masivo: Por qué la hiperpersonalización es el único camino.",
    excerpt:
      "Aprende cómo utilizar modelos de lenguaje generativo para analizar el contexto de cada prospecto y redactar mensajes únicos a gran escala.",
  },
  {
    slug: "automatizacion-crm-post-reunion",
    category: "Inteligencia Artificial",
    dateLabel: "27 febrero 2026",
    dateTime: "2026-02-27",
    title: "Automatización del CRM: El fin de las ineficiencias tras las reuniones comerciales.",
    excerpt:
      "Evita la pérdida de información clave. Descubre sistemas capaces de volcar los datos de tus reuniones directamente a tu CRM sin carga administrativa.",
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
          <div className="absolute left-0 top-12 h-28 w-28 rounded-full border border-leadby-500/20" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500">
            Blog de Noticias / Recursos
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
            Recursos, Guías y Casos de Éxito B2B.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-black/70 dark:text-white/70">
            Descubre cómo la inteligencia artificial y la automatización están redefiniendo las ventas en el sector
            industrial español. Estrategias reales para directores comerciales.
          </p>
        </div>
      </section>

      <section className="border-y border-black/5 py-10 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6">
          {CATEGORIES.map((category) => {
            const isActive = category.id === "all";
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-colors ${
                  isActive
                    ? "bg-leadby-500 text-white shadow-leadby-sm"
                    : "border border-leadby-500/30 text-leadby-600 hover:border-leadby-500/60 hover:bg-leadby-50 dark:text-leadby-200 dark:hover:bg-white/5"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ARTICLES.map((article) => (
              <article
                key={article.slug}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-leadby-500/20 bg-gradient-to-br from-leadby-500/20 via-leadby-400/10 to-white/70 dark:from-leadby-500/20 dark:via-leadby-400/10 dark:to-black/30">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,117,31,0.35),_transparent_60%)]" />
                  <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-leadby-600 backdrop-blur dark:bg-black/40 dark:text-leadby-200">
                    LeadBy Insight
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">
                  <span className="rounded-full bg-leadby-500/10 px-3 py-1 text-leadby-600 dark:text-leadby-200">
                    {article.category}
                  </span>
                  <time dateTime={article.dateTime}>{article.dateLabel}</time>
                </div>

                <h3 className="mt-4 text-lg font-semibold leading-snug md:text-xl">{article.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/70 dark:text-white/70">{article.excerpt}</p>

                <Link
                  href={`/blog?articulo=${article.slug}`}
                  className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-leadby-600 transition-colors hover:text-leadby-500"
                >
                  Leer artículo
                  <span aria-hidden className="text-lg">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-leadby-500/20 bg-leadby-400/10 px-8 py-12 text-center shadow-sm shadow-black/5 dark:bg-leadby-400/15">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              ¿Quieres aplicar estas estrategias en tu empresa?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
              Agenda una demostración y descubre cómo adaptar LeadBy a tu equipo comercial con un plan técnico a medida.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-leadby-500 px-6 py-3 text-sm font-semibold text-foreground shadow-leadby transition-colors hover:bg-leadby-600"
              >
                Agenda una demostración
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
