"use client";

/**
 * TermsContent
 *
 * Client component for /legal/terms.
 * Defines section data (id, heading, content) and delegates all animation +
 * layout to LegalPageLayout.
 */

import { LegalPageLayout, type LegalSection } from "./LegalPageLayout";

const SECTIONS: LegalSection[] = [
  {
    id: "objeto",
    heading: "1. Objeto",
    content: (
      <p>
        Los presentes Términos regulan el acceso y uso de la plataforma LeadBy,
        desarrollada como Trabajo de Fin de Grado en la Universidad Complutense de Madrid.
      </p>
    ),
  },
  {
    id: "uso-permitido",
    heading: "2. Uso permitido",
    content: (
      <p>
        La plataforma está diseñada exclusivamente para prospección comercial B2B legítima.
        El usuario se compromete a utilizar el servicio de conformidad con la legislación vigente,
        incluyendo el RGPD y la LSSI-CE.
      </p>
    ),
  },
  {
    id: "uso-prohibido",
    heading: "3. Uso prohibido",
    content: (
      <ul>
        <li>
          Envío de spam masivo o comunicaciones no relacionadas con la actividad profesional
          del destinatario.
        </li>
        <li>
          Extracción de datos de personas físicas con fines ajenos a la prospección B2B.
        </li>
        <li>
          Uso de la plataforma para actividades ilegales o que vulneren derechos de terceros.
        </li>
        <li>
          Intento de acceder a datos de otras organizaciones (tenants).
        </li>
      </ul>
    ),
  },
  {
    id: "responsabilidad",
    heading: "4. Responsabilidad",
    content: (
      <p>
        El titular de la plataforma no es responsable del uso que el usuario haga de los leads
        generados ni del contenido de los emails enviados a través del servicio. La responsabilidad
        de las comunicaciones comerciales recae íntegramente en el Tenant emisor.
      </p>
    ),
  },
  {
    id: "disponibilidad",
    heading: "5. Disponibilidad del servicio",
    content: (
      <p>
        La plataforma se ofrece &ldquo;tal cual&rdquo; durante la fase de MVP. El nivel de servicio
        no incluye garantías de disponibilidad en el plan gratuito.
      </p>
    ),
  },
  {
    id: "modificaciones",
    heading: "6. Modificaciones",
    content: (
      <p>
        Nos reservamos el derecho de modificar estos Términos con un preaviso de 30 días
        comunicado por email.
      </p>
    ),
  },
];

export function TermsContent() {
  return (
    <LegalPageLayout
      title="Términos de Servicio"
      lastUpdated="abril de 2026"
      backHref="/"
      sections={SECTIONS}
    />
  );
}
