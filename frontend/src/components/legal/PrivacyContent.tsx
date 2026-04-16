"use client";

/**
 * PrivacyContent
 *
 * Client component for /legal/privacy.
 * Defines section data (id, heading, content) and delegates all animation +
 * layout to LegalPageLayout.
 */

import { LegalPageLayout, type LegalSection } from "./LegalPageLayout";

const SECTIONS: LegalSection[] = [
  {
    id: "naturaleza",
    heading: "Naturaleza del Proyecto (TFG)",
    content: (
      <p>
        El presente sitio web, operando bajo la denominación &ldquo;LeadBy&rdquo;, constituye la
        plataforma práctica de un Trabajo de Fin de Grado (TFG) desarrollado en la Universidad
        Complutense de Madrid (UCM). Los servicios descritos tienen una finalidad exclusivamente
        académica y de investigación.
      </p>
    ),
  },
  {
    id: "rgpd",
    heading: "Cumplimiento del RGPD y LSSI-CE",
    content: (
      <p>
        La operativa técnica simulada en esta plataforma se fundamenta en la excepción B2B
        contemplada en la normativa vigente. El tratamiento de la información se ampara en el
        Interés Legítimo, limitándose exclusivamente a información corporativa y de contacto
        profesional, cumpliendo con los requisitos de la LSSI-CE para las comunicaciones
        comerciales entre empresas.
      </p>
    ),
  },
  {
    id: "transparencia-ia",
    heading: "Transparencia de la IA y Decisiones Automatizadas",
    content: (
      <p>
        En cumplimiento del Artículo 22 del RGPD, LeadBy garantiza el principio de supervisión
        humana (Human-in-the-Loop). La Inteligencia Artificial actúa exclusivamente como un
        asistente cognitivo (&ldquo;copiloto&rdquo;). Toda generación de contenido comercial se
        almacena en una &ldquo;Zona de Cuarentena&rdquo; y requiere de revisión, modificación y
        aprobación manual explícita antes de cualquier ejecución técnica.
      </p>
    ),
  },
  {
    id: "opt-out",
    heading: "Mecanismos de Opt-Out (Baja)",
    content: (
      <p>
        Para garantizar el derecho de oposición, la arquitectura del sistema exige técnicamente
        que todas las comunicaciones simuladas o reales generadas incluyan un enlace visible y
        funcional para cancelar la suscripción de forma automática.
      </p>
    ),
  },
  {
    id: "seguridad",
    heading: "Seguridad y Aislamiento de Datos",
    content: (
      <p>
        La plataforma implementa aislamiento criptográfico mediante Políticas de Seguridad a
        Nivel de Fila (RLS). Los datos corporativos de los clientes se encuentran aislados,
        cifrados en tránsito (TLS 1.3) y en reposo, garantizando el máximo nivel de
        confidencialidad.
      </p>
    ),
  },
];

export function PrivacyContent() {
  return (
    <LegalPageLayout
      title="Aviso Legal y Política de Privacidad"
      subtitle="Transparencia, seguridad y cumplimiento normativo en el tratamiento de datos B2B."
      lastUpdated="31 de marzo de 2026"
      backHref="/"
      sections={SECTIONS}
    />
  );
}
