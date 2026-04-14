/**
 * Tipos de nivel de aplicación (UI).
 * Los tipos de base de datos se generan con: npx supabase gen types typescript
 * y se guardan en database.types.ts (no editar manualmente).
 */

export type LeadEstado =
  | "pendiente_aprobacion"
  | "aprobado"
  | "enviado"
  | "descartado";

export type EmailStatusApollo =
  | "verified"
  | "unverified"
  | "catch_all"
  | "unknown"
  | "invalid";

export type SeniorityApollo =
  | "owner"
  | "founder"
  | "c_suite"
  | "vp"
  | "director"
  | "manager"
  | "senior"
  | "entry"
  | "unknown";

export type IngresosRangoApollo = "0-1M" | "1-10M" | "10-100M" | "100M+";

export interface EmpresaResumen {
  nombre: string | null;
  dominio: string | null;
  ciudad: string | null;
  sector: string | null;
  apollo_org_id?: string | null;
  linkedin_url?: string | null;
  tecnologias?: string[] | null;
  ingresos_rango?: IngresosRangoApollo | null;
}

export interface ContactoResumen {
  nombre: string | null;
  apellidos: string | null;
  cargo: string | null;
  email: string | null;
  linkedin_url: string | null;
  apollo_contact_id?: string | null;
  email_status?: EmailStatusApollo | null;
  seniority?: SeniorityApollo | null;
  departamento?: string | null;
}

export interface LeadListado {
  id: string;
  organizacion_id: string;
  estado: LeadEstado;
  borrador_email: string | null;
  email_enviado_at: string | null;
  created_at: string;
  asignado_a: string | null;
  global_empresas: EmpresaResumen | null;
  global_contactos: ContactoResumen | null;
}

export interface LeadConRelaciones {
  id: string;
  organizacion_id: string;
  estado: LeadEstado;
  borrador_email: string | null;
  email_aprobado: string | null;
  email_asunto: string | null;
  email_enviado_at: string | null;
  created_at: string;
  global_empresas: {
    nombre: string | null;
    sector: string | null;
    dominio?: string | null;
    ciudad?: string | null;
    provincia?: string | null;
    linkedin_url?: string | null;
    apollo_org_id?: string | null;
    ingresos_rango?: IngresosRangoApollo | null;
    tecnologias?: string[] | null;
  } | null;
  global_contactos: {
    nombre: string | null;
    apellidos: string | null;
    cargo: string | null;
    email: string | null;
    linkedin_url: string | null;
    apollo_contact_id?: string | null;
    email_status?: EmailStatusApollo | null;
    seniority?: SeniorityApollo | null;
    departamento?: string | null;
  } | null;
}

export type UserRol = "admin" | "miembro";

export type PlanSuscripcion = "free" | "starter" | "pro";

export type TipoScraping = "apollo_search" | "apollo_lookalike";

export type EstadoTrabajo = "completado" | "error";

// Lead enriquecido con datos de empresa y contacto para mostrar en la UI
export interface LeadCompleto {
  id: string;
  organizacion_id: string;
  estado: LeadEstado;
  borrador_email: string | null;
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
    linkedin_url?: string | null;
    apollo_org_id?: string | null;
    ingresos_rango?: IngresosRangoApollo | null;
  };
  contacto: {
    id: string;
    nombre: string | null;
    apellidos: string | null;
    cargo: string | null;
    email: string | null;
    linkedin_url: string | null;
    apollo_contact_id?: string | null;
    email_status?: EmailStatusApollo | null;
    seniority?: SeniorityApollo | null;
    departamento?: string | null;
  } | null;
}

// Respuesta de la API al crear un trabajo de busqueda
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
    tono_voz?: string; // formal | cercano | agresivo
    propuesta_valor?: string;
    sector_objetivo?: string;
  };
  tiene_hubspot?: boolean;
  tiene_resend?: boolean;
}

// Metricas del dashboard
export interface MetricasDashboard {
  prospectos_semana: number;
  correos_enviados: number;
  tasa_respuesta: number;
  leads_pendientes: number;
}
