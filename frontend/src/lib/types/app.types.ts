/**
 * Tipos de nivel de aplicación (UI).
 * El modelo actual usa la tabla plana `leads`.
 */

export type LeadEstado =
  | "nuevo"
  | "pendiente_aprobacion"
  | "aprobado"
  | "enviado"
  | "descartado";

export type LeadFuente = "prospeccion" | "lookalike";

export interface Lead {
  id: string;
  organizacion_id: string;
  estado: LeadEstado;
  fuente: LeadFuente;
  empresa_nombre: string;
  empresa_dominio: string | null;
  empresa_sector: string | null;
  empresa_empleados_rango: string | null;
  empresa_facturacion_rango: string | null;
  empresa_ciudad: string | null;
  empresa_pais: string | null;
  empresa_telefono: string | null;
  empresa_linkedin_url: string | null;
  empresa_descripcion: string | null;
  contacto_nombre_completo: string | null;
  contacto_cargo: string | null;
  contacto_departamento: string | null;
  contacto_email: string | null;
  contacto_telefono: string | null;
  contacto_linkedin_url: string | null;
  email_borrador: string | null;
  email_aprobado: string | null;
  email_asunto: string | null;
  email_enviado_at: string | null;
  asignado_a: string | null;
  notas: string | null;
  created_at: string;
}

export type LeadListado = Lead;
export type LeadConRelaciones = Lead;
export type LeadCompleto = Lead;

export type UserRol = "admin" | "miembro";

export type PlanSuscripcion = "free" | "starter" | "pro";

// Respuesta histórica de API de prospección (se mantiene para compatibilidad UI)
export interface ScrapeJobCreado {
  job_id: string | null;
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
