import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isApolloMockAiError,
  type ApolloOrganization,
  type ApolloPerson,
  searchPeopleWithCompany,
} from "@/lib/services/apollo-mock";

const MAX_PROSPECTS_PER_SEARCH = 3;

type ProspectingTipo = "apollo_search" | "apollo_lookalike";
type LeadFuente = "prospeccion" | "lookalike";

interface PostgrestErrorLike {
  code?: string;
  message?: string;
}

interface LeadInsertPayload {
  organizacionId: string;
  fuente: LeadFuente;
  tipo: ProspectingTipo;
  empresaNombre: string;
  empresaDominio: string | null;
  empresaSector: string | null;
  empresaEmpleadosRango: string | null;
  empresaFacturacionRango: string | null;
  empresaCiudad: string | null;
  empresaPais: string | null;
  empresaTelefono: string | null;
  empresaLinkedinUrl: string | null;
  empresaDescripcion: string | null;
  contactoNombreCompleto: string | null;
  contactoCargo: string | null;
  contactoDepartamento: string | null;
  contactoEmail: string | null;
  contactoTelefono: string | null;
  contactoLinkedinUrl: string | null;
}

export interface ExecuteApolloProspectingInput {
  userClient: SupabaseClient;
  serviceClient: SupabaseClient;
  organizacionId: string;
  createdBy: string;
  tipo: ProspectingTipo;
  parametros: Record<string, unknown>;
}

export interface LeadCreado {
  id: string;
  empresaNombre: string;
  contactoEmail: string | null;
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

  const normalized = email.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function normalizeDomain(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  const withoutProtocol = trimmed.replace(/^https?:\/\//, "").replace(/^www\./, "");
  const [host] = withoutProtocol.split("/");

  return host || null;
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

function resolveFuenteFromTipo(tipo: ProspectingTipo): LeadFuente {
  return tipo === "apollo_lookalike" ? "lookalike" : "prospeccion";
}

function buildContactoNombreCompleto(person: ApolloPerson): string | null {
  const nombre = toStringOrNull(person.first_name);
  const apellidos = toStringOrNull(person.last_name);

  if (nombre || apellidos) {
    return [nombre, apellidos].filter((value): value is string => Boolean(value)).join(" ");
  }

  return toStringOrNull(person.name);
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

function mapFacturacionRango(raw?: string | null): string | null {
  const value = toStringOrNull(raw);
  if (!value) {
    return null;
  }

  const directMap: Record<string, string> = {
    "0-1M": "<1M€",
    "1-10M": "1M-10M€",
    "10-100M": "10M-50M€",
    "100M+": ">100M€",
  };

  return directMap[value] ?? value;
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

function buildLeadPayloadFromPerson(
  organizacionId: string,
  fuente: LeadFuente,
  tipo: ProspectingTipo,
  person: ApolloPerson
): LeadInsertPayload | null {
  const organization = extractOrganizationFromPerson(person);
  if (!organization) {
    return null;
  }

  const empresaNombre = extractOrganizationName(organization);
  if (!empresaNombre) {
    return null;
  }

  const nombreCompleto = buildContactoNombreCompleto(person);

  return {
    organizacionId,
    fuente,
    tipo,
    empresaNombre,
    empresaDominio: extractOrganizationDomain(organization),
    empresaSector: toStringOrNull(organization.industry),
    empresaEmpleadosRango: mapEmpleadosRango(organization),
    empresaFacturacionRango: mapFacturacionRango(
      toStringOrNull(organization.annual_revenue_printed)
    ),
    empresaCiudad: toStringOrNull(organization.city),
    empresaPais: toStringOrNull(organization.country) ?? "ES",
    empresaTelefono: extractTelefonoFromOrganization(organization),
    empresaLinkedinUrl: toStringOrNull(organization.linkedin_url),
    empresaDescripcion: toStringOrNull(organization.short_description),
    contactoNombreCompleto: nombreCompleto,
    contactoCargo: toStringOrNull(person.title),
    contactoDepartamento: extractDepartamento(person),
    contactoEmail: normalizeEmail(toStringOrNull(person.email)),
    contactoTelefono: extractTelefonoFromPerson(person),
    contactoLinkedinUrl: toStringOrNull(person.linkedin_url),
  };
}

function isPostgrestErrorLike(error: unknown): error is PostgrestErrorLike {
  return typeof error === "object" && error !== null;
}

function isMissingRelationError(error: unknown): boolean {
  return isPostgrestErrorLike(error) && error.code === "42P01";
}

function buildLeadFromRow(row: {
  id: unknown;
  empresa_nombre: unknown;
  contacto_email: unknown;
}): LeadCreado {
  return {
    id: String(row.id),
    empresaNombre: String(row.empresa_nombre ?? "Empresa"),
    contactoEmail: normalizeEmail(
      typeof row.contacto_email === "string" ? row.contacto_email : null
    ),
  };
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

  if (isMissingRelationError(error)) {
    return false;
  }

  throw new Error(`Error verificando opt-out del contacto: ${error.message}`);
}

async function findExistingLeadByCompany(
  userClient: SupabaseClient,
  organizacionId: string,
  empresaNombre: string,
  empresaDominio: string | null
): Promise<LeadCreado | null> {
  let query = userClient
    .from("leads")
    .select("id, empresa_nombre, contacto_email")
    .eq("organizacion_id", organizacionId)
    .limit(1);

  if (empresaDominio) {
    query = query.eq("empresa_dominio", empresaDominio);
  } else {
    query = query.eq("empresa_nombre", empresaNombre);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Error verificando lead existente: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return buildLeadFromRow(data as { id: unknown; empresa_nombre: unknown; contacto_email: unknown });
}

async function ensureLead(
  userClient: SupabaseClient,
  payload: LeadInsertPayload
): Promise<{ lead: LeadCreado | null; cacheHit: boolean }> {
  const existing = await findExistingLeadByCompany(
    userClient,
    payload.organizacionId,
    payload.empresaNombre,
    payload.empresaDominio
  );

  if (existing) {
    return { lead: null, cacheHit: true };
  }

  const { data, error: insertError } = await userClient
    .from("leads")
    .insert({
      organizacion_id: payload.organizacionId,
      estado: "nuevo",
      fuente: payload.fuente,
      empresa_nombre: payload.empresaNombre,
      empresa_dominio: payload.empresaDominio,
      empresa_sector: payload.empresaSector,
      empresa_empleados_rango: payload.empresaEmpleadosRango,
      empresa_facturacion_rango: payload.empresaFacturacionRango,
      empresa_ciudad: payload.empresaCiudad,
      empresa_pais: payload.empresaPais ?? "ES",
      empresa_telefono: payload.empresaTelefono,
      empresa_linkedin_url: payload.empresaLinkedinUrl,
      empresa_descripcion: payload.empresaDescripcion,
      contacto_nombre_completo: payload.contactoNombreCompleto,
      contacto_cargo: payload.contactoCargo,
      contacto_departamento: payload.contactoDepartamento,
      contacto_email: payload.contactoEmail,
      contacto_telefono: payload.contactoTelefono,
      contacto_linkedin_url: payload.contactoLinkedinUrl,
      metadata: {
        fuente_original: "apollo_mock",
        tipo_prospeccion: payload.tipo,
        human_in_the_loop: true,
      },
    })
    .select("id, empresa_nombre, contacto_email")
    .single();

  if (!insertError && data) {
    return {
      lead: buildLeadFromRow(
        data as { id: unknown; empresa_nombre: unknown; contacto_email: unknown }
      ),
      cacheHit: false,
    };
  }

  if (isPostgrestErrorLike(insertError) && insertError.code === "23505") {
    return { lead: null, cacheHit: true };
  }

  throw new Error(`Error insertando lead: ${insertError?.message ?? "desconocido"}`);
}

async function processApolloPerson(input: {
  userClient: SupabaseClient;
  organizacionId: string;
  fuente: LeadFuente;
  tipo: ProspectingTipo;
  person: ApolloPerson;
}): Promise<{ lead: LeadCreado | null; cacheHit: boolean; cacheMiss: boolean }> {
  const payload = buildLeadPayloadFromPerson(
    input.organizacionId,
    input.fuente,
    input.tipo,
    input.person
  );

  if (!payload) {
    return { lead: null, cacheHit: false, cacheMiss: false };
  }

  const isOptedOut = await isContactoOptedOut({
    userClient: input.userClient,
    organizacionId: input.organizacionId,
    email: payload.contactoEmail,
  });

  if (isOptedOut) {
    return {
      lead: null,
      cacheHit: false,
      cacheMiss: false,
    };
  }

  const ensured = await ensureLead(input.userClient, payload);

  return {
    lead: ensured.lead,
    cacheHit: ensured.cacheHit,
    cacheMiss: Boolean(ensured.lead),
  };
}

function generateJobId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `job-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

/**
 * Ejecuta una prospección síncrona y crea leads planos para revisión humana.
 */
export async function executeApolloProspectingJob(
  input: ExecuteApolloProspectingInput
): Promise<ExecuteApolloProspectingResult> {
  const perPage = MAX_PROSPECTS_PER_SEARCH;
  const jobId = generateJobId();
  const leads: LeadCreado[] = [];
  let cacheHits = 0;
  let cacheMisses = 0;

  const sector = toStringOrNull(input.parametros.sector);
  const ubicacion = resolveLocationFromParametros(input.parametros);
  const tamano = resolveTamanoFromParametros(input.parametros);
  const dominiosExcluidos = resolveDominiosExcluidosFromParametros(input.parametros);

  if (!sector || !ubicacion) {
    throw new Error("Parámetros inválidos para prospección: sector y ubicación son obligatorios");
  }

  const people = await searchPeopleWithCompany(
    {
      sector,
      ubicacion,
      tamano: tamano ?? undefined,
      perPage,
    },
    dominiosExcluidos
  );

  const processPromises = people.map((person) =>
    processApolloPerson({
      userClient: input.userClient,
      organizacionId: input.organizacionId,
      fuente: resolveFuenteFromTipo(input.tipo),
      tipo: input.tipo,
      person,
    })
  );

  const processResults = await Promise.all(processPromises);

  for (const result of processResults) {
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

  return {
    jobId,
    totalResultados: leads.length,
    leadsCreados: leads.length,
    cacheHits,
    cacheMisses,
    leads,
  };
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

  const jobId = generateJobId();
  const leads: LeadCreado[] = [];
  let cacheHits = 0;
  let cacheMisses = 0;

  const location = resolveLocationFromParametros(input.parametros) ?? "España";
  const tamano = resolveTamanoFromParametros(input.parametros);
  const seenPeople = new Set<string>();

  const searchPromises = normalizedTerms.map((term) =>
    searchPeopleWithCompany({
      sector: term,
      ubicacion: location,
      tamano: tamano ?? undefined,
      perPage: maxResults,
    })
  );

  const peopleByTerm = await Promise.all(searchPromises);
  const allPeople = peopleByTerm.flat();

  const processPromises: Array<
    Promise<{ lead: LeadCreado | null; cacheHit: boolean; cacheMiss: boolean }>
  > = [];

  for (const person of allPeople) {
    if (processPromises.length >= maxResults) {
      break;
    }

    const personKey = [
      toStringOrNull(person.id),
      normalizeEmail(toStringOrNull(person.email)),
      toStringOrNull(person.linkedin_url),
      toStringOrNull(person.name),
    ]
      .filter((value): value is string => Boolean(value))
      .join("|");

    if (personKey && seenPeople.has(personKey)) {
      continue;
    }

    if (personKey) {
      seenPeople.add(personKey);
    }

    processPromises.push(
      processApolloPerson({
        userClient: input.userClient,
        organizacionId: input.organizacionId,
        fuente: "lookalike",
        tipo: "apollo_lookalike",
        person,
      })
    );
  }

  const processResults = await Promise.all(processPromises);

  for (const result of processResults) {
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

  return {
    jobId,
    totalResultados: leads.length,
    leadsCreados: leads.length,
    cacheHits,
    cacheMisses,
    leads,
    searchTermsUsed: normalizedTerms,
  };
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
