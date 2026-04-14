import type { SupabaseClient } from "@supabase/supabase-js";
import {
  APOLLO_MAX_PER_PAGE,
  ApolloApiError,
  type ApolloOrganization,
  type ApolloOrganizationSearchCriteria,
  type ApolloPerson,
  searchOrganizations,
  searchPeople,
} from "@/lib/services/apollo";
import {
  lookupContactoEnCache,
  lookupEmpresaEnCache,
  lookupPrimerContactoEmpresaEnCache,
  normalizeDomain,
  upsertContactoEnCache,
  upsertEmpresaEnCache,
  type ContactoGlobal,
  type EmpresaGlobal,
} from "@/lib/services/data-moat";

const DECISION_MAKER_TITLES = [
  "Director de Compras",
  "Head of Procurement",
  "Purchasing Director",
  "Chief Procurement Officer",
  "CEO",
  "Founder",
];

const DECISION_MAKER_SENIORITIES = ["c_suite", "vp", "director", "owner", "founder"];

interface PostgrestErrorLike {
  code?: string;
  message?: string;
}

export interface ExecuteApolloProspectingInput {
  userClient: SupabaseClient;
  serviceClient: SupabaseClient;
  organizacionId: string;
  createdBy: string;
  tipo: "apollo_search" | "apollo_lookalike";
  parametros: Record<string, unknown>;
  organizationCriteria: ApolloOrganizationSearchCriteria;
}

export interface ExecuteApolloProspectingResult {
  jobId: string;
  totalResultados: number;
  leadsCreados: number;
  cacheHits: number;
  cacheMisses: number;
}

function normalizePerPage(perPage?: number): number {
  if (!perPage || Number.isNaN(perPage)) {
    return APOLLO_MAX_PER_PAGE;
  }

  return Math.min(Math.max(Math.trunc(perPage), 1), APOLLO_MAX_PER_PAGE);
}

function toStringOrNull(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function splitFullName(fullName?: string | null): { nombre: string | null; apellidos: string | null } {
  const normalized = toStringOrNull(fullName);
  if (!normalized) {
    return { nombre: null, apellidos: null };
  }

  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length === 0) {
    return { nombre: null, apellidos: null };
  }

  if (parts.length === 1) {
    return { nombre: parts[0], apellidos: null };
  }

  return {
    nombre: parts[0],
    apellidos: parts.slice(1).join(" "),
  };
}

function mapIngresosRango(raw?: string | null): string | null {
  const value = toStringOrNull(raw);
  if (!value) {
    return null;
  }

  if (["0-1M", "1-10M", "10-100M", "100M+"].includes(value)) {
    return value;
  }

  return null;
}

function mapEmpleadosRango(org: ApolloOrganization): string | null {
  const rawRange = toStringOrNull(org.estimated_num_employees_range);
  if (rawRange) {
    return rawRange;
  }

  if (typeof org.estimated_num_employees === "number" && org.estimated_num_employees > 0) {
    return `${org.estimated_num_employees}`;
  }

  return null;
}

function extractOrganizationName(org: ApolloOrganization): string | null {
  return toStringOrNull(org.name) ?? toStringOrNull(org.organization_name);
}

function extractOrganizationDomain(org: ApolloOrganization): string | null {
  const fromDomain = normalizeDomain(toStringOrNull(org.domain));
  if (fromDomain) {
    return fromDomain;
  }

  const fromPrimary = normalizeDomain(toStringOrNull(org.primary_domain));
  if (fromPrimary) {
    return fromPrimary;
  }

  const fromWebsite = normalizeDomain(toStringOrNull(org.website_url));
  if (fromWebsite) {
    return fromWebsite;
  }

  return null;
}

function extractTecnologias(org: ApolloOrganization): string[] {
  if (!Array.isArray(org.technologies)) {
    return [];
  }

  const names = org.technologies
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object" && typeof item.name === "string") {
        return item.name;
      }

      return null;
    })
    .filter((item): item is string => Boolean(item));

  return Array.from(new Set(names));
}

function extractDepartamento(person: ApolloPerson): string | null {
  const fromArray = toStringArray(person.departments)[0] ?? null;
  if (fromArray) {
    return fromArray;
  }

  return toStringOrNull(person.department);
}

function normalizePersonaNombre(person: ApolloPerson): { nombre: string | null; apellidos: string | null } {
  const nombre = toStringOrNull(person.first_name);
  const apellidos = toStringOrNull(person.last_name);

  if (nombre || apellidos) {
    return { nombre, apellidos };
  }

  return splitFullName(toStringOrNull(person.name));
}

function isPostgrestErrorLike(error: unknown): error is PostgrestErrorLike {
  return typeof error === "object" && error !== null;
}

async function ensureLead(
  userClient: SupabaseClient,
  payload: {
    organizacionId: string;
    empresaId: string;
    contactoId: string | null;
    trabajoBusquedaId: string;
  }
): Promise<boolean> {
  let query = userClient
    .from("leads_prospectados")
    .select("id")
    .eq("organizacion_id", payload.organizacionId)
    .eq("empresa_id", payload.empresaId)
    .limit(1);

  if (payload.contactoId) {
    query = query.eq("contacto_id", payload.contactoId);
  } else {
    query = query.is("contacto_id", null);
  }

  const { data: existing, error: existingError } = await query.maybeSingle();

  if (existingError) {
    throw new Error(`Error verificando lead existente: ${existingError.message}`);
  }

  if (existing) {
    return false;
  }

  const { error: insertError } = await userClient.from("leads_prospectados").insert({
    organizacion_id: payload.organizacionId,
    empresa_id: payload.empresaId,
    contacto_id: payload.contactoId,
    trabajo_busqueda_id: payload.trabajoBusquedaId,
    estado: "pendiente_aprobacion",
    metadata: {
      fuente: "apollo",
      human_in_the_loop: true,
    },
  });

  if (!insertError) {
    return true;
  }

  if (isPostgrestErrorLike(insertError) && insertError.code === "23505") {
    return false;
  }

  throw new Error(`Error insertando lead prospectado: ${insertError.message ?? "desconocido"}`);
}

async function resolveEmpresa(
  userClient: SupabaseClient,
  serviceClient: SupabaseClient,
  organization: ApolloOrganization
): Promise<{ empresa: EmpresaGlobal; cacheHit: boolean }> {
  const domain = extractOrganizationDomain(organization);
  const apolloOrgId = toStringOrNull(organization.id);

  const cacheLookup = await lookupEmpresaEnCache(userClient, {
    dominio: domain,
    apolloOrgId,
    nombre: extractOrganizationName(organization),
  });

  if (cacheLookup.hit && cacheLookup.data) {
    return { empresa: cacheLookup.data, cacheHit: true };
  }

  const empresa = await upsertEmpresaEnCache(serviceClient, {
    nombre: extractOrganizationName(organization),
    dominio: domain,
    apolloOrgId,
    linkedinUrl: toStringOrNull(organization.linkedin_url),
    sector: toStringOrNull(organization.industry),
    empleadosRango: mapEmpleadosRango(organization),
    ingresosRango: mapIngresosRango(toStringOrNull(organization.annual_revenue_printed)),
    tecnologias: extractTecnologias(organization),
    descripcion: toStringOrNull(organization.short_description),
    ciudad: toStringOrNull(organization.city),
    provincia: toStringOrNull(organization.state),
    pais: toStringOrNull(organization.country) ?? "ES",
    telefono: toStringOrNull(organization.phone),
    fuente: "apollo",
    ultimaVerificacion: new Date().toISOString(),
  });

  return { empresa, cacheHit: false };
}

async function resolveContacto(
  userClient: SupabaseClient,
  serviceClient: SupabaseClient,
  organization: ApolloOrganization,
  empresa: EmpresaGlobal
): Promise<ContactoGlobal | null> {
  const cachedContacto = await lookupPrimerContactoEmpresaEnCache(userClient, empresa.id);
  if (cachedContacto) {
    return cachedContacto;
  }

  const people = await searchPeople({
    organizationId: toStringOrNull(organization.id) ?? undefined,
    organizationDomain: extractOrganizationDomain(organization) ?? undefined,
    organizationName: extractOrganizationName(organization) ?? undefined,
    titles: DECISION_MAKER_TITLES,
    seniorities: DECISION_MAKER_SENIORITIES,
    perPage: 1,
  });

  const firstPerson = people[0];
  if (!firstPerson) {
    return null;
  }

  const contactoCache = await lookupContactoEnCache(userClient, {
    empresaId: empresa.id,
    apolloContactId: toStringOrNull(firstPerson.id),
    email: toStringOrNull(firstPerson.email),
    linkedinUrl: toStringOrNull(firstPerson.linkedin_url),
  });

  if (contactoCache.hit && contactoCache.data) {
    return contactoCache.data;
  }

  const nombre = normalizePersonaNombre(firstPerson);

  return upsertContactoEnCache(serviceClient, {
    empresaId: empresa.id,
    apolloContactId: toStringOrNull(firstPerson.id),
    nombre: nombre.nombre,
    apellidos: nombre.apellidos,
    cargo: toStringOrNull(firstPerson.title),
    seniority: toStringOrNull(firstPerson.seniority),
    departamento: extractDepartamento(firstPerson),
    email: toStringOrNull(firstPerson.email),
    emailStatus: toStringOrNull(firstPerson.email_status),
    linkedinUrl: toStringOrNull(firstPerson.linkedin_url),
    fuente: "apollo",
  });
}

async function updateJobAsCompleted(
  serviceClient: SupabaseClient,
  jobId: string,
  totalResultados: number
): Promise<void> {
  const { error } = await serviceClient
    .from("trabajos_busqueda")
    .update({
      estado: "completado",
      total_resultados: totalResultados,
      error_mensaje: null,
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(`Error actualizando trabajo de búsqueda: ${error.message}`);
  }
}

async function updateJobAsError(
  serviceClient: SupabaseClient,
  jobId: string,
  errorMessage: string
): Promise<void> {
  const { error } = await serviceClient
    .from("trabajos_busqueda")
    .update({
      estado: "error",
      total_resultados: 0,
      error_mensaje: errorMessage,
    })
    .eq("id", jobId);

  if (error) {
    console.error("No se pudo actualizar el job a estado error", error);
  }
}

/**
 * Ejecuta una prospección síncrona Apollo + Data Moat y crea leads para revisión humana.
 */
export async function executeApolloProspectingJob(
  input: ExecuteApolloProspectingInput
): Promise<ExecuteApolloProspectingResult> {
  const perPage = normalizePerPage(input.organizationCriteria.perPage);

  const { data: job, error: jobError } = await input.userClient
    .from("trabajos_busqueda")
    .insert({
      organizacion_id: input.organizacionId,
      tipo: input.tipo,
      parametros: {
        ...input.parametros,
        per_page: perPage,
      },
      estado: "completado",
      total_resultados: 0,
      created_by: input.createdBy,
    })
    .select("id")
    .single();

  if (jobError || !job) {
    throw new Error(`Error creando trabajo de búsqueda: ${jobError?.message ?? "sin datos"}`);
  }

  const jobId = String(job.id);
  let leadsCreados = 0;
  let cacheHits = 0;
  let cacheMisses = 0;

  try {
    const organizations = await searchOrganizations({
      ...input.organizationCriteria,
      perPage,
    });

    for (const organization of organizations) {
      const { empresa, cacheHit } = await resolveEmpresa(
        input.userClient,
        input.serviceClient,
        organization
      );

      if (cacheHit) {
        cacheHits += 1;
      } else {
        cacheMisses += 1;
      }

      let contacto: ContactoGlobal | null = null;

      try {
        contacto = await resolveContacto(
          input.userClient,
          input.serviceClient,
          organization,
          empresa
        );
      } catch (contactError) {
        console.warn("No se pudo resolver contacto para empresa", {
          empresaId: empresa.id,
          error: contactError,
        });
      }

      const leadCreado = await ensureLead(input.userClient, {
        organizacionId: input.organizacionId,
        empresaId: empresa.id,
        contactoId: contacto?.id ?? null,
        trabajoBusquedaId: jobId,
      });

      if (leadCreado) {
        leadsCreados += 1;
      }
    }

    await updateJobAsCompleted(input.serviceClient, jobId, leadsCreados);

    return {
      jobId,
      totalResultados: leadsCreados,
      leadsCreados,
      cacheHits,
      cacheMisses,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado durante prospección";
    await updateJobAsError(input.serviceClient, jobId, message);
    throw error;
  }
}

export function resolveProspectingErrorStatus(error: unknown): number {
  if (error instanceof ApolloApiError) {
    return error.status === 429 ? 429 : 502;
  }

  return 500;
}

export function resolveProspectingErrorMessage(error: unknown): string {
  if (error instanceof ApolloApiError) {
    if (error.status === 401 || error.status === 403) {
      return "Apollo rechazó la autenticación. Revisa APOLLO_API_KEY.";
    }

    if (error.status === 429) {
      return "Apollo alcanzó el límite de peticiones. Inténtalo en unos minutos.";
    }

    return "Apollo devolvió un error al procesar la búsqueda.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Error interno al ejecutar la prospección";
}
