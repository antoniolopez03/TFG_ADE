export const metadata = {
  title: "Aviso Legal y Política de Privacidad · LeadBy",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-3xl font-semibold leading-tight md:text-4xl">
            Aviso Legal y Política de Privacidad
          </h1>
          <p className="mt-5 text-base leading-relaxed text-black/70 dark:text-white/70">
            Transparencia, seguridad y cumplimiento normativo en el tratamiento de datos B2B.
          </p>
          <div className="mx-auto mt-8 h-px w-16 bg-leadby-500/70" aria-hidden />
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <article className="prose prose-neutral max-w-none leading-relaxed dark:prose-invert prose-headings:text-foreground prose-p:text-black/70 dark:prose-p:text-white/70 prose-li:text-black/70 dark:prose-li:text-white/70 prose-a:text-leadby-500 dark:prose-a:text-leadby-400">
            <p className="text-sm text-black/60 dark:text-white/60">Última actualización: 31 de marzo de 2026</p>

            <h2>Naturaleza del Proyecto (TFG)</h2>
            <p>
              El presente sitio web, operando bajo la denominación &quot;LeadBy&quot;, constituye la plataforma práctica de un
              Trabajo de Fin de Grado (TFG) desarrollado en la Universidad Complutense de Madrid (UCM). Los servicios
              descritos tienen una finalidad exclusivamente académica y de investigación.
            </p>

            <h2>Cumplimiento del RGPD y LSSI-CE</h2>
            <p>
              La operativa técnica simulada en esta plataforma se fundamenta en la excepción B2B contemplada en la normativa
              vigente. El tratamiento de la información se ampara en el Interés Legítimo, limitándose exclusivamente a
              información corporativa y de contacto profesional, cumpliendo con los requisitos de la LSSI-CE para las
              comunicaciones comerciales entre empresas.
            </p>

            <h2>Transparencia de la IA y Decisiones Automatizadas</h2>
            <p>
              En cumplimiento del Artículo 22 del RGPD, LeadBy garantiza el principio de supervisión humana
              (Human-in-the-Loop). La Inteligencia Artificial actúa exclusivamente como un asistente cognitivo
              (&quot;copiloto&quot;). Toda generación de contenido comercial se almacena en una &quot;Zona de Cuarentena&quot; y requiere
              de revisión, modificación y aprobación manual explícita antes de cualquier ejecución técnica.
            </p>

            <h2>Mecanismos de Opt-Out (Baja)</h2>
            <p>
              Para garantizar el derecho de oposición, la arquitectura del sistema exige técnicamente que todas las
              comunicaciones simuladas o reales generadas incluyan un enlace visible y funcional para cancelar la
              suscripción de forma automática.
            </p>

            <h2>Seguridad y Aislamiento de Datos</h2>
            <p>
              La plataforma implementa aislamiento criptográfico mediante Políticas de Seguridad a Nivel de Fila (RLS).
              Los datos corporativos de los clientes se encuentran aislados, cifrados en tránsito (TLS 1.3) y en reposo,
              garantizando el máximo nivel de confidencialidad.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
