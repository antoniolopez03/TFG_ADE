import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies · LeadBy",
  description:
    "Información sobre el uso de cookies y tecnologías equivalentes en la web pública de LeadBy.",
  alternates: { canonical: "/legal/cookies" },
};

export default function CookiesPage() {
  return (
    <section className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl">
        <article className="prose prose-neutral max-w-none leading-relaxed dark:prose-invert prose-headings:text-foreground prose-p:text-black/70 dark:prose-p:text-white/70 prose-li:text-black/70 dark:prose-li:text-white/70 prose-a:text-leadby-500 dark:prose-a:text-leadby-400">
          <h1>Política de Cookies</h1>
          <p className="text-sm text-black/60 dark:text-white/60">Última actualización: abril de 2026</p>

          <h2>1. Qué son las cookies</h2>
          <p>
            Las cookies son pequeños archivos que se almacenan en tu navegador para recordar información sobre tu
            visita. En LeadBy se usan únicamente para mejorar la experiencia de navegación y el funcionamiento básico
            de la interfaz pública.
          </p>

          <h2>2. Cookies utilizadas en esta web</h2>
          <ul>
            <li>
              <strong>Preferencias de interfaz:</strong> guardan la elección de tema claro/oscuro para mantener la
              consistencia visual entre sesiones.
            </li>
            <li>
              <strong>Cookies técnicas:</strong> necesarias para el funcionamiento de la web y para proteger el envío de
              formularios.
            </li>
          </ul>

          <h2>3. Qué no hacemos</h2>
          <p>
            No utilizamos cookies de publicidad comportamental ni vendemos información de navegación a terceros.
            Cualquier incorporación futura de herramientas analíticas o de marketing se notificará y se actualizará esta
            política.
          </p>

          <h2>4. Cómo gestionar tus cookies</h2>
          <p>
            Puedes permitir, bloquear o eliminar cookies desde la configuración de tu navegador. Al desactivar cookies
            técnicas, algunas funcionalidades de la web podrían no estar disponibles.
          </p>

          <h2>5. Contacto</h2>
          <p>
            Para dudas sobre privacidad o cookies puedes escribirnos a través del formulario de contacto de la web.
          </p>
        </article>
      </div>
    </section>
  );
}
