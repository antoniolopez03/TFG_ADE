import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isApolloMockAiError,
  type ApolloOrganization,
  type ApolloPerson,
  searchPeopleWithCompany,
} from "@/lib/services/apollo-mock";
import {
  lookupContactoEnCache,
  lookupEmpresaEnCache,
  normalizeDomain,
  upsertContactoEnCache,
  upsertEmpresaEnCache,
  type ContactoGlobal,
  type EmpresaGlobal,
} from "@/lib/services/data-moat";

const MAX_PROSPECTS_PER_SEARCH = 10;

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
}

export interface LeadCreado {
  id: string;
  empresaId: string;
  contactoId: string | null;
}

export interface ExecuteApolloProspectingResult {
  jobId: string;
  totalResultados: number;
  leadsCreados: number;
  cacheHits: number;
  cacheMisses: number;
  leads: LeadCreado[];
}

export interface ExecuteApolloLookalikeJobInput {
  userClient: SupabaseClient;
  serviceClient: SupabaseClient;
  organizacionId: string;
  createdBy: string;
  parametros: Record<string, unknown>;
  searchTerms: string[];
  maxResults?: number;
}

export interface ExecuteApolloLookalikeJobResult extends ExecuteApolloProspectingResult {
  searchTermsUsed: string[];
}

function normalizePerPage(perPage?: number): number {
  if (!perPage || Number.isNaN(perPage)) {
    return MAX_PROSPECTS_PER_SEARCH;
  }

  return Math.min(Math.max(Math.trunc(perPage), 1), MAX_PROSPECTS_PER_SEARCH);
}

function normalizeSearchTerms(searchTerms: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const term of searchTerms) {
    const trimmed = toStringOrNull(term)?.toLowerCase();
    if (!trimmed) {
      continue;
    }

    if (seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized.slice(0, MAX_PROSPECTS_PER_SEARCH);
}

function toStringOrNull(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeEmail(email: string | null): string | null {
  if (!email) {
    return null;
  }

  return email.trim().toLowerCase() || null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function resolveLocationFromParametros(parametros: Record<string, unknown>): string | null {
  return toStringOrNull(parametros.ubicacion) ?? toStringOrNull(parametros.location);
}

function resolveTamanoFromParametros(parametros: Record<string, unknown>): string | null {
  return toStringOrNull(parametros.tamano);
}

function resolveDominiosExcluidosFromParametros(parametros: Record<string, unknown>): string[] {
  const normalized = toStringArray(parametros.dominiosExcluidos)
    .map((dominio) => dominio.trim().toLowerCase())
    .filter((dominio) => dominio.length > 0);

  return Array.from(new Set(normalized));
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

  const size = org.estimated_num_employees;
  if (typeof size !== "number" || size <= 0) {
    return null;
  }

  if (size <= 10) {
    return "1-10";
  }

  if (size <= 50) {
    return "11-50";
  }

  if (size <= 200) {
    return "51-200";
  }

  if (size <= 500) {
    return "201-500";
  }

  return "500+";
}

function extractOrganizationName(org: ApolloOrganization): string | null {
  return toStringOrNull(org.name) ?? toStringOrNull(org.organization_name);
}

function extractOrganizationDomain(org: ApolloOrganization): string | null {
  const fromPrimary = normalizeDomain(toStringOrNull(org.primary_domain));
  if (fromPrimary) {
    return fromPrimary;
  }

  const fromDomain = normalizeDomain(toStringOrNull(org.domain));
  if (fromDomain) {
    return fromDomain;
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

function extractTelefonoFromOrganization(org: ApolloOrganization): string | null {
  return toStringOrNull(org.telefono) ?? toStringOrNull(org.phone);
}

function extractTelefonoFromPerson(person: ApolloPerson): string | null {
  return toStringOrNull(person.telefono) ?? toStringOrNull(person.phone);
}

function normalizePersonaNombre(person: ApolloPerson): { nombre: string | null; apellidos: string | null } {
  const nombre = toStringOrNull(person.first_name);
  const apellidos = toStringOrNull(person.last_name);

  if (nombre || apellidos) {
    return { nombre, apellidos };
  }

  return splitFullName(toStringOrNull(person.name));
}

function extractOrganizationFromPerson(person: ApolloPerson): ApolloOrganization | null {
  if (person.organization && typeof person.organization === "object") {
    return person.organization as ApolloOrganization;
  }

  const fallbackName = toStringOrNull(person.organization_name);
  const fallbackId = toStringOrNull(person.organization_id);

  if (!fallbackName && !fallbackId) {
    return null;
  }

  return {
    id: fallbackId ?? undefined,
    name: fallbackName ?? undefined,
  };
}

function buildPersonKey(person: ApolloPerson, organization: ApolloOrganization | null): string {
  const personId = toStringOrNull(person.id);
  if (personId) {
    return `person:${personId}`;
  }

  const email = toStringOrNull(person.email)?.toLowerCase();
  if (email) {
    return `email:${email}`;
  }

  const linkedin = toStringOrNull(person.linkedin_url)?.toLowerCase();
  if (linkedin) {
    return `linkedin:${linkedin}`;
  }

  const orgId = organization ? toStringOrNull(organization.id) : null;
  if (orgId) {
    return `org:${orgId}:${toStringOrNull(person.name) ?? "sin_nombre"}`;
  }

  return JSON.stringify(person);
}

function isPostgrestErrorLike(error: unknown): error is PostgrestErrorLike {
  return typeof error === "object" && error !== null;
}

function isMissingRelationError(error: unknown): boolean {
  return isPostgrestErrorLike(error) && error.code === "42P01";
}

async function isContactoOptedOut(options: {
  userClient: SupabaseClient;
  organizacionId: string;
  email: string | null;
}): Promise<boolean> {
  const normalizedEmail = normalizeEmail(options.email);
  if (!normalizedEmail) {
    return false;
  }

  const { data, error } = await options.userClient
    .from("email_opt_outs")
    .select("id")
    .eq("organizacion_id", options.organizacionId)
    .eq("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (!error) {
    return Boolean(data);
  }

  // Permite compatibilidad mientras el script SQL de opt-out no esté desplegado.
  if (isMissingRelationError(error)) {
    return false;
  }

  throw new Error(`Error verificando opt-out del contacto: ${error.message}`);
}

async function ensureLead(
  userClient: SupabaseClient,
  payload: {
    organizacionId: string;
    empresaId: string;
    contactoId: string | null;
    trabajoBusquedaId: string;
  }
): Promise<LeadCreado | null> {
  let query = userClient
    .from("leads_prospectados")
    .select("id, empresa_id, contacto_id")
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
    return null;
  }

  const { data, error: insertError } = await userClient
    .from("leads_prospectados")
    .insert({
      organizacion_id: payload.organizacionId,
      empresa_id: payload.empresaId,
      contacto_id: payload.contactoId,
      trabajo_busqueda_id: payload.trabajoBusquedaId,
      estado: "pendiente_aprobacion",
      metadata: {
        fuente: "apollo",
        human_in_the_loop: true,
      },
    })
    .select("id, empresa_id, contacto_id")
    .single();

  if (!insertError && data) {
    return {
      id: String(data.id),
      empresaId: String(data.empresa_id),
      contactoId: data.contacto_id ? String(data.contacto_id) : null,
    };
  }

  if (isPostgrestErrorLike(insertError) && insertError.code === "23505") {
    return null;
  }

  throw new Error(`Error insertando lead prospectado: ${insertError?.message ?? "desconocido"}`);
}

async function resolveEmpresa(
  userClient: SupabaseClient,
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

  const empresa = await upsertEmpresaEnCache({
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
    telefono: extractTelefonoFromOrganization(organization),
    fuente: "apollo",
    ultimaVerificacion: new Date().toISOString(),
  });

  return { empresa, cacheHit: false };
}

async function resolveContactoDesdePersona(
  userClient: SupabaseClient,
  person: ApolloPerson,
  empresaId: string
): Promise<ContactoGlobal> {
  const contactoCache = await lookupContactoEnCache(userClient, {
    empresaId,
    apolloContactId: toStringOrNull(person.id),
    email: toStringOrNull(person.email),
    linkedinUrl: toStringOrNull(person.linkedin_url),
  });

  if (contactoCache.hit && contactoCache.data) {
    return contactoCache.data;
  }

  const nombre = normalizePersonaNombre(person);

  return upsertContactoEnCache({
    empresaId,
    apolloContactId: toStringOrNull(person.id),
    nombre: nombre.nombre,
    apellidos: nombre.apellidos,
    cargo: toStringOrNull(person.title),
    email: toStringOrNull(person.email),
    linkedinUrl: toStringOrNull(person.linkedin_url),
    telefono: extractTelefonoFromPerson(person),
    fuente: "apollo",
    emailStatus: toStringOrNull(person.email_status),
    seniority: toStringOrNull(person.seniority),
    departamento: extractDepartamento(person),
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

async function processApolloPerson(
  input: {
    userClient: SupabaseClient;
    organizacionId: string;
    trabajoBusquedaId: string;
    person: ApolloPerson;
  }
): Promise<{ lead: LeadCreado | null; cacheHit: boolean; cacheMiss: boolean }> {
  const organization = extractOrganizationFromPerson(input.person);
  if (!organization) {
    return { lead: null, cacheHit: false, cacheMiss: false };
  }

  const { empresa, cacheHit } = await resolveEmpresa(input.userClient, organization);
  const contacto = await resolveContactoDesdePersona(input.userClient, input.person, empresa.id);

  const isOptedOut = await isContactoOptedOut({
    userClient: input.userClient,
    organizacionId: input.organizacionId,
    email: contacto.email,
  });

  if (isOptedOut) {
    return {
      lead: null,
      cacheHit,
      cacheMiss: false,
    };
  }

  const lead = await ensureLead(input.userClient, {
    organizacionId: input.organizacionId,
    empresaId: empresa.id,
    contactoId: contacto.id,
    trabajoBusquedaId: input.trabajoBusquedaId,
  });

  return {
    lead,
    cacheHit,
    cacheMiss: !cacheHit,
  };
}

/**
 * Ejecuta una prospección síncrona Apollo + Data Moat y crea leads para revisión humana.
 */
export async function executeApolloProspectingJob(
  input: ExecuteApolloProspectingInput
): Promise<ExecuteApolloProspectingResult> {
  const perPage = MAX_PROSPECTS_PER_SEARCH;

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
  const leads: LeadCreado[] = [];
  let cacheHits = 0;
  let cacheMisses = 0;

  try {
    const sector = toStringOrNull(input.parametros.sector);
    const ubicacion = resolveLocationFromParametros(input.parametros);
    const tamano = resolveTamanoFromParametros(input.parametros);
    const dominiosExcluidos = resolveDominiosExcluidosFromParametros(input.parametros);

    if (!sector || !ubicacion) {
      throw new Error("Parámetros inválidos para prospección: sector y ubicación son obligatorios");
    }

    const people = await searchPeopleWithCompany({
      sector,
      ubicacion,
      tamano: tamano ?? undefined,
      perPage,
    }, dominiosExcluidos);

    for (const person of people) {
      const result = await processApolloPerson({
        userClient: input.userClient,
        organizacionId: input.organizacionId,
        trabajoBusquedaId: jobId,
        person,
      });

      if (result.cacheHit) {
        cacheHits += 1;
      }

      if (result.cacheMiss) {
        cacheMisses += 1;
      }

      if (result.lead) {
        leads.push(result.lead);
      }
    }

    await updateJobAsCompleted(input.serviceClient, jobId, leads.length);

    return {
      jobId,
      totalResultados: leads.length,
      leadsCreados: leads.length,
      cacheHits,
      cacheMisses,
      leads,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado durante prospección";
    await updateJobAsError(input.serviceClient, jobId, message);
    throw error;
  }
}

/**
 * Ejecuta una prospección lookalike con varios términos y límite global de resultados.
 */
export async function executeApolloLookalikeJob(
  input: ExecuteApolloLookalikeJobInput
): Promise<ExecuteApolloLookalikeJobResult> {
  const normalizedTerms = normalizeSearchTerms(input.searchTerms);
  const maxResults = normalizePerPage(input.maxResults);

  if (normalizedTerms.length === 0) {
    throw new Error("No hay términos lookalike válidos para ejecutar la búsqueda");
  }

  const { data: job, error: jobError } = await input.userClient
    .from("trabajos_busqueda")
    .insert({
      organizacion_id: input.organizacionId,
      tipo: "apollo_lookalike",
      parametros: {
        ...input.parametros,
        search_terms: normalizedTerms,
        max_results: maxResults,
      },
      estado: "completado",
      total_resultados: 0,
      created_by: input.createdBy,
    })
    .select("id")
    .single();

  if (jobError || !job) {
    throw new Error(`Error creando trabajo lookalike: ${jobError?.message ?? "sin datos"}`);
  }

  const jobId = String(job.id);
  const leads: LeadCreado[] = [];
  let cacheHits = 0;
  let cacheMisses = 0;

  const location = resolveLocationFromParametros(input.parametros) ?? "España";
  const tamano = resolveTamanoFromParametros(input.parametros);
  const seenPeople = new Set<string>();

  try {
    for (const term of normalizedTerms) {
      if (leads.length >= maxResults) {
        break;
      }

      const remaining = maxResults - leads.length;
      const people = await searchPeopleWithCompany({
        sector: term,
        ubicacion: location,
        tamano: tamano ?? undefined,
        perPage: remaining,
      });

      for (const person of people) {
        if (leads.length >= maxResults) {
          break;
        }

        const org = extractOrganizationFromPerson(person);
        const personKey = buildPersonKey(person, org);

        if (seenPeople.has(personKey)) {
          continue;
        }
        seenPeople.add(personKey);

        const result = await processApolloPerson({
          userClient: input.userClient,
          organizacionId: input.organizacionId,
          trabajoBusquedaId: jobId,
          person,
        });

        if (result.cacheHit) {
          cacheHits += 1;
        }

        if (result.cacheMiss) {
          cacheMisses += 1;
        }

        if (result.lead) {
          leads.push(result.lead);
        }
      }
    }

    await updateJobAsCompleted(input.serviceClient, jobId, leads.length);

    return {
      jobId,
      totalResultados: leads.length,
      leadsCreados: leads.length,
      cacheHits,
      cacheMisses,
      leads,
      searchTermsUsed: normalizedTerms,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado en lookalike";
    await updateJobAsError(input.serviceClient, jobId, message);
    throw error;
  }
}

export function resolveProspectingErrorStatus(error: unknown): number {
  if (isApolloMockAiError(error)) {
    return error.status;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("gemini saturado") || message.includes("high demand")) {
      return 503;
    }

    if (message.includes("límite de peticiones") || message.includes("rate limit")) {
      return 429;
    }
  }

  return 500;
}

export function resolveProspectingErrorMessage(error: unknown): string {
  if (isApolloMockAiError(error)) {
    return error.publicMessage;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("gemini saturado") || message.includes("high demand")) {
      return "Estamos recibiendo una alta demanda en estaos momentos, pruebe más tarde";
    }

    if (message.includes("límite de peticiones") || message.includes("rate limit")) {
      return "Se alcanzó el límite de peticiones de IA. Espera unos segundos y vuelve a intentarlo.";
    }

    return error.message;
  }

  return "Error interno al ejecutar la prospección";
}
