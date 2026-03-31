import { Check } from "lucide-react";

const HIGHLIGHTS = [
  "Diagnóstico inicial de tu proceso comercial.",
  "Mapa de automatizaciones con impacto inmediato.",
  "Propuesta técnica alineada con tu CRM actual.",
  "Plan de adopción para equipos industriales.",
];

export default function ContactPage() {
  const inputClasses =
    "mt-1 w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-sm text-black shadow-sm placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:border-leadby-500 ring-leadby dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40";

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
          <div className="absolute left-0 top-12 h-28 w-28 rounded-full border border-leadby-500/20" />
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

          <form
            action="/contact"
            method="get"
            className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="text-sm font-medium text-black/70 dark:text-white/70">
                  Nombre y apellidos
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Antonio López"
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label htmlFor="empresa" className="text-sm font-medium text-black/70 dark:text-white/70">
                  Empresa
                </label>
                <input
                  id="empresa"
                  name="empresa"
                  type="text"
                  placeholder="Empresa Industrial"
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium text-black/70 dark:text-white/70">
                  Email corporativo
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label htmlFor="telefono" className="text-sm font-medium text-black/70 dark:text-white/70">
                  Teléfono
                </label>
                <input id="telefono" name="telefono" type="tel" placeholder="+34 600 000 000" className={inputClasses} />
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="cargo" className="text-sm font-medium text-black/70 dark:text-white/70">
                Cargo / Departamento
              </label>
              <input id="cargo" name="cargo" type="text" placeholder="Dirección Comercial" className={inputClasses} />
            </div>

            <div className="mt-5">
              <label htmlFor="mensaje" className="text-sm font-medium text-black/70 dark:text-white/70">
                Mensaje
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={5}
                placeholder="Describe tu objetivo comercial y el volumen de cuentas que gestionas."
                className={inputClasses}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-black/50 dark:text-white/50">
                Al enviar aceptas nuestra Política de Privacidad y el tratamiento de datos conforme a RGPD.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-leadby-500 px-6 py-3 text-sm font-semibold text-foreground shadow-leadby transition-colors hover:bg-leadby-600"
              >
                Enviar solicitud
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
