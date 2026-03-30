/**
 * Tipos de nivel de aplicación (UI).
 * Los tipos de base de datos se generan con: npx supabase gen types typescript
 * y se guardan en database.types.ts (no editar manualmente).
 */

export type LeadEstado =
  | "nuevo"
  | "enriqueciendo"
  | "pendiente_aprobacion"
  | "aprobado"
  | "enviado"
  | "descartado";

export type UserRol = "admin" | "miembro";

export type PlanSuscripcion = "free" | "starter" | "pro";

export type TipoScraping = "google_maps" | "google_dorks";

export type EstadoTrabajo =
  | "pendiente"
  | "ejecutando"
  | "completado"
  | "error";

// Lead enriquecido con datos de empresa y contacto para mostrar en la UI
export interface LeadCompleto {
  id: string;
  organizacion_id: string;
  estado: LeadEstado;
  email_borrador: string | null;
  email_aprobado: string | null;
  email_asunto: string | null;
  email_enviado_at: string | null;
  asignado_a: string | null;
  notas: string | null;
  created_at: string;
  empresa: {
    id: string;
    nombre: string;
    dominio: string | null;
    ciudad: string | null;
    sector: string | null;
    google_maps_url: string | null;
  };
  contacto: {
    id: string;
    nombre: string | null;
    apellidos: string | null;
    cargo: string | null;
    email: string | null;
    linkedin_url: string | null;
  } | null;
}

// Respuesta de la API al crear un job de scraping
export interface ScrapeJobCreado {
  job_id: string;
  organizacion_id: string;
  mensaje: string;
}

// Configuración del tenant para mostrar en Settings
export interface ConfiguracionTenant {
  organizacion_id: string;
  crm_proveedor: string;
  preferencias_ia: {
    tono_voz?: string;           // formal | cercano | agresivo
    propuesta_valor?: string;
    sector_objetivo?: string;
  };
  scraper_config: {
    max_results?: number;
    delay_ms?: number;
  };
  tiene_hubspot: boolean;
  tiene_resend: boolean;
}

// Métricas del dashboard (obtenidas de HubSpot via n8n)
export interface MetricasDashboard {
  prospectos_semana: number;
  correos_enviados: number;
  tasa_respuesta: number;
  leads_pendientes: number;
}
