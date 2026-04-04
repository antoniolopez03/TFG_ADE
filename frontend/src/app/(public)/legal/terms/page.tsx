import Link from "next/link";

export const metadata = { title: "Términos de Servicio · LeadBy" };

export default function TermsPage() {
  return (
    <section className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-leadby-500 transition-colors hover:text-leadby-600">
          ← Volver
        </Link>
        <article className="prose prose-neutral mt-8 max-w-none leading-relaxed dark:prose-invert prose-headings:text-foreground prose-p:text-black/70 dark:prose-p:text-white/70 prose-li:text-black/70 dark:prose-li:text-white/70 prose-a:text-leadby-500 dark:prose-a:text-leadby-400">
          <h1>Términos de Servicio</h1>
          <p className="text-sm text-black/60 dark:text-white/60">Última actualización: Enero 2025</p>

          <h2>1. Objeto</h2>
          <p>
            Los presentes Términos regulan el acceso y uso de la plataforma LeadBy,
            desarrollada como Trabajo de Fin de Grado en la Universidad Complutense de Madrid.
          </p>

          <h2>2. Uso permitido</h2>
          <p>
            La plataforma está diseñada exclusivamente para prospección comercial B2B legítima.
            El usuario se compromete a utilizar el servicio de conformidad con la legislación vigente,
            incluyendo el RGPD y la LSSI-CE.
          </p>

          <h2>3. Uso prohibido</h2>
          <ul>
            <li>Envío de spam masivo o comunicaciones no relacionadas con la actividad profesional del destinatario.</li>
            <li>Extracción de datos de personas físicas con fines ajenos a la prospección B2B.</li>
            <li>Uso de la plataforma para actividades ilegales o que vulneren derechos de terceros.</li>
            <li>Intento de acceder a datos de otras organizaciones (tenants).</li>
          </ul>

          <h2>4. Responsabilidad</h2>
          <p>
            El titular de la plataforma no es responsable del uso que el usuario haga de los leads
            generados ni del contenido de los emails enviados a través del servicio. La responsabilidad
            de las comunicaciones comerciales recae íntegramente en el Tenant emisor.
          </p>

          <h2>5. Disponibilidad del servicio</h2>
          <p>
            La plataforma se ofrece &quot;tal cual&quot; durante la fase de MVP. El nivel de servicio no
            incluye garantías de disponibilidad en el plan gratuito.
          </p>

          <h2>6. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos Términos con un preaviso de 30 días
            comunicado por email.
          </p>
        </article>
      </div>
    </section>
  );
}
