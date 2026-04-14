import { Client as HubSpotClient } from "@hubspot/api-client";
import type { SupabaseClient } from "@supabase/supabase-js";

const HUBSPOT_API_BASE_URL = "https://api.hubapi.com";

interface HubSpotSearchRequest {
  filterGroups?: Array<{
    filters: Array<{
      propertyName: string;
      operator: string;
      value: string;
    }>;
  }>;
  sorts?: Array<{
    propertyName: string;
    direction: "ASCENDING" | "DESCENDING";
  }>;
  properties?: string[];
  limit?: number;
}

interface HubSpotSearchResultRecord {
  id: string;
  properties?: Record<string, string | null | undefined>;
}

interface HubSpotSearchResponse {
  results?: HubSpotSearchResultRecord[];
}

interface HubSpotObjectUpsertResponse {
  id: string;
  properties?: Record<string, string | null | undefined>;
}

interface HubSpotLegacyEngagementResponse {
  engagement?: {
    id?: number;
  };
}

export interface HubSpotClientOptions {
  accessToken: string;
}

export interface HubSpotWonDeal {
  id: string;
  name: string;
  stage: string | null;
  amount: number | null;
  closeDate: string | null;
  pipeline: string | null;
}

export interface ListHubSpotWonDealsOptions {
  accessToken: string;
  limit?: number;
}

export interface HubSpotCompanyInput {
  nombre: string | null;
  dominio: string | null;
  sector?: string | null;
  ciudad?: string | null;
  pais?: string | null;
  telefono?: string | null;
  descripcion?: string | null;
}

export interface HubSpotContactInput {
  nombre: string | null;
  apellidos?: string | null;
  email?: string | null;
  cargo?: string | null;
  telefono?: string | null;
  departamento?: string | null;
}

export interface CreateOrUpdateHubSpotCompanyOptions {
  accessToken: string;
  empresa: HubSpotCompanyInput;
}

export interface CreateOrUpdateHubSpotContactOptions {
  accessToken: string;
  contacto: HubSpotContactInput;
  companyId: string;
}

export interface CreateHubSpotDealOptions {
  accessToken: string;
  companyId: string;
  contactId?: string | null;
  dealName: string;
  dealStage?: string;
  pipeline?: string;
}

export interface CreateHubSpotEmailEngagementOptions {
  accessToken: string;
  contactId: string;
  subject: string;
  body: string;
  recipientEmail?: string | null;
  sentAt?: string;
}

export interface HubSpotCompanyRecord {
  id: string;
  name: string | null;
  domain: string | null;
}

export interface HubSpotContactRecord {
  id: string;
  email: string | null;
}

export interface HubSpotDealRecord {
  id: string;
}

export interface HubSpotEngagementRecord {
  id: string;
}

/**
 * Construye un cliente tipado de HubSpot API v3.
 * El token debe obtenerse desde Supabase Vault por tenant.
 */
export function createHubSpotClient(options: HubSpotClientOptions): HubSpotClient {
  if (!options.accessToken) {
    throw new Error("HubSpot access token no configurado");
  }

  return new HubSpotClient({ accessToken: options.accessToken });
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit)) {
    return 20;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), 100);
}

function parseAmount(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

async function hubspotRequest<T>(options: {
  accessToken: string;
  path: string;
  method?: "GET" | "POST" | "PATCH" | "PUT";
  body?: unknown;
}): Promise<T> {
  if (!options.accessToken) {
    throw new Error("Token HubSpot no configurado");
  }

  const response = await fetch(`${HUBSPOT_API_BASE_URL}${options.path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`HubSpot request failed (${response.status}): ${details}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text.trim()) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

function normalizeDomain(value: string | null | undefined): string | null {
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

function cleanProperties(
  properties: Record<string, string | null | undefined>
): Record<string, string> {
  const output: Record<string, string> = {};

  for (const [key, value] of Object.entries(properties)) {
    const parsed = toNonEmptyString(value);
    if (parsed) {
      output[key] = parsed;
    }
  }

  return output;
}

function parseHubSpotRecordId(recordId: unknown): string {
  const parsed =
    typeof recordId === "number"
      ? String(recordId)
      : typeof recordId === "string"
        ? recordId.trim()
        : "";

  if (!parsed) {
    throw new Error("HubSpot no devolvió un ID válido");
  }

  return parsed;
}

function buildCompanyProperties(empresa: HubSpotCompanyInput): Record<string, string> {
  const domain = normalizeDomain(empresa.dominio);

  return cleanProperties({
    name: toNonEmptyString(empresa.nombre) ?? domain ?? "Empresa LeadBy",
    domain,
    industry: toNonEmptyString(empresa.sector),
    city: toNonEmptyString(empresa.ciudad),
    country: toNonEmptyString(empresa.pais),
    phone: toNonEmptyString(empresa.telefono),
    description: toNonEmptyString(empresa.descripcion),
  });
}

function buildContactProperties(contacto: HubSpotContactInput): Record<string, string> {
  return cleanProperties({
    firstname: toNonEmptyString(contacto.nombre) ?? "Contacto",
    lastname: toNonEmptyString(contacto.apellidos),
    email: toNonEmptyString(contacto.email),
    jobtitle: toNonEmptyString(contacto.cargo),
    phone: toNonEmptyString(contacto.telefono),
    department: toNonEmptyString(contacto.departamento),
  });
}

async function findCompanyByDomain(
  accessToken: string,
  domain: string
): Promise<HubSpotSearchResultRecord | null> {
  const payload = await hubspotRequest<HubSpotSearchResponse>({
    accessToken,
    path: "/crm/v3/objects/companies/search",
    method: "POST",
    body: {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "domain",
              operator: "EQ",
              value: domain,
            },
          ],
        },
      ],
      properties: ["name", "domain"],
      limit: 1,
    } satisfies HubSpotSearchRequest,
  });

  return payload.results?.[0] ?? null;
}

async function findContactByEmail(
  accessToken: string,
  email: string
): Promise<HubSpotSearchResultRecord | null> {
  const payload = await hubspotRequest<HubSpotSearchResponse>({
    accessToken,
    path: "/crm/v3/objects/contacts/search",
    method: "POST",
    body: {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email,
            },
          ],
        },
      ],
      properties: ["firstname", "lastname", "email"],
      limit: 1,
    } satisfies HubSpotSearchRequest,
  });

  return payload.results?.[0] ?? null;
}

async function associateHubSpotObjects(options: {
  accessToken: string;
  fromType: "contacts" | "deals";
  fromId: string;
  toType: "companies" | "contacts";
  toId: string;
  associationType: "contact_to_company" | "deal_to_company" | "deal_to_contact";
}): Promise<void> {
  await hubspotRequest<unknown>({
    accessToken: options.accessToken,
    path: `/crm/v3/objects/${options.fromType}/${options.fromId}/associations/${options.toType}/${options.toId}/${options.associationType}`,
    method: "PUT",
  });
}

/**
 * Recupera los deals ganados (closed won) para usar como senales del ICP.
 */
export async function listHubSpotWonDeals(
  options: ListHubSpotWonDealsOptions
): Promise<HubSpotWonDeal[]> {
  const payload = await hubspotRequest<HubSpotSearchResponse>({
    accessToken: options.accessToken,
    path: "/crm/v3/objects/deals/search",
    method: "POST",
    body: {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "dealstage",
              operator: "EQ",
              value: "closedwon",
            },
          ],
        },
      ],
      sorts: [
        {
          propertyName: "closedate",
          direction: "DESCENDING",
        },
      ],
      properties: ["dealname", "dealstage", "amount", "closedate", "pipeline"],
      limit: normalizeLimit(options.limit),
    },
  });

  const deals = payload.results ?? [];

  return deals.map((deal) => {
    const properties = deal.properties ?? {};
    return {
      id: deal.id,
      name: toNonEmptyString(properties.dealname) ?? `Deal ${deal.id}`,
      stage: toNonEmptyString(properties.dealstage),
      amount: parseAmount(properties.amount),
      closeDate: toNonEmptyString(properties.closedate),
      pipeline: toNonEmptyString(properties.pipeline),
    };
  });
}

/**
 * Obtiene el token de HubSpot desde Supabase Vault para una organizacion.
 */
export async function getHubSpotTokenFromVault(
  serviceClient: SupabaseClient,
  organizacionId: string
): Promise<string | null> {
  const { data, error } = await serviceClient.rpc("obtener_hubspot_token", {
    p_organizacion_id: organizacionId,
  });

  if (error) {
    throw new Error(`Error recuperando token HubSpot desde Vault: ${error.message}`);
  }

  return toNonEmptyString(data);
}

/**
 * Verifica conectividad básica contra la API de HubSpot sin exponer secretos.
 */
export async function verifyHubSpotConnection(accessToken: string): Promise<void> {
  await hubspotRequest<{ results?: unknown[] }>({
    accessToken,
    path: "/crm/v3/objects/contacts?limit=1",
    method: "GET",
  });
}

/**
 * Crea o actualiza una Company en HubSpot, deduplicando por dominio cuando existe.
 */
export async function createOrUpdateHubSpotCompany(
  options: CreateOrUpdateHubSpotCompanyOptions
): Promise<HubSpotCompanyRecord> {
  const domain = normalizeDomain(options.empresa.dominio);
  const properties = buildCompanyProperties(options.empresa);

  let response: HubSpotObjectUpsertResponse;

  if (domain) {
    const existing = await findCompanyByDomain(options.accessToken, domain);

    if (existing) {
      response = await hubspotRequest<HubSpotObjectUpsertResponse>({
        accessToken: options.accessToken,
        path: `/crm/v3/objects/companies/${existing.id}`,
        method: "PATCH",
        body: { properties },
      });
    } else {
      response = await hubspotRequest<HubSpotObjectUpsertResponse>({
        accessToken: options.accessToken,
        path: "/crm/v3/objects/companies",
        method: "POST",
        body: { properties },
      });
    }
  } else {
    response = await hubspotRequest<HubSpotObjectUpsertResponse>({
      accessToken: options.accessToken,
      path: "/crm/v3/objects/companies",
      method: "POST",
      body: { properties },
    });
  }

  return {
    id: parseHubSpotRecordId(response.id),
    name: toNonEmptyString(response.properties?.name),
    domain: toNonEmptyString(response.properties?.domain) ?? domain,
  };
}

/**
 * Crea o actualiza un Contact en HubSpot, deduplicando por email cuando existe.
 */
export async function createOrUpdateHubSpotContact(
  options: CreateOrUpdateHubSpotContactOptions
): Promise<HubSpotContactRecord> {
  const normalizedCompanyId = toNonEmptyString(options.companyId);
  if (!normalizedCompanyId) {
    throw new Error("HubSpot companyId es obligatorio para sincronizar el contacto");
  }

  const email = toNonEmptyString(options.contacto.email);
  const properties = buildContactProperties(options.contacto);

  let response: HubSpotObjectUpsertResponse;

  if (email) {
    const existing = await findContactByEmail(options.accessToken, email);

    if (existing) {
      response = await hubspotRequest<HubSpotObjectUpsertResponse>({
        accessToken: options.accessToken,
        path: `/crm/v3/objects/contacts/${existing.id}`,
        method: "PATCH",
        body: { properties },
      });
    } else {
      response = await hubspotRequest<HubSpotObjectUpsertResponse>({
        accessToken: options.accessToken,
        path: "/crm/v3/objects/contacts",
        method: "POST",
        body: { properties },
      });
    }
  } else {
    response = await hubspotRequest<HubSpotObjectUpsertResponse>({
      accessToken: options.accessToken,
      path: "/crm/v3/objects/contacts",
      method: "POST",
      body: { properties },
    });
  }

  const contactId = parseHubSpotRecordId(response.id);

  await associateHubSpotObjects({
    accessToken: options.accessToken,
    fromType: "contacts",
    fromId: contactId,
    toType: "companies",
    toId: normalizedCompanyId,
    associationType: "contact_to_company",
  });

  return {
    id: contactId,
    email: toNonEmptyString(response.properties?.email) ?? email,
  };
}

/**
 * Crea un Deal en etapa inicial del pipeline comercial.
 */
export async function createHubSpotDeal(
  options: CreateHubSpotDealOptions
): Promise<HubSpotDealRecord> {
  const normalizedCompanyId = toNonEmptyString(options.companyId);
  if (!normalizedCompanyId) {
    throw new Error("HubSpot companyId es obligatorio para crear el deal");
  }

  const normalizedContactId = toNonEmptyString(options.contactId);
  if (options.contactId && !normalizedContactId) {
    throw new Error("HubSpot contactId inválido para crear el deal");
  }

  const response = await hubspotRequest<HubSpotObjectUpsertResponse>({
    accessToken: options.accessToken,
    path: "/crm/v3/objects/deals",
    method: "POST",
    body: {
      properties: cleanProperties({
        dealname: options.dealName,
        dealstage: toNonEmptyString(options.dealStage) ?? "qualifiedtobuy",
        pipeline: toNonEmptyString(options.pipeline) ?? "default",
      }),
    },
  });

  const dealId = parseHubSpotRecordId(response.id);

  await associateHubSpotObjects({
    accessToken: options.accessToken,
    fromType: "deals",
    fromId: dealId,
    toType: "companies",
    toId: normalizedCompanyId,
    associationType: "deal_to_company",
  });

  if (normalizedContactId) {
    await associateHubSpotObjects({
      accessToken: options.accessToken,
      fromType: "deals",
      fromId: dealId,
      toType: "contacts",
      toId: normalizedContactId,
      associationType: "deal_to_contact",
    });
  }

  return {
    id: dealId,
  };
}

/**
 * Registra un engagement de tipo email en el timeline del contacto.
 */
export async function createHubSpotEmailEngagement(
  options: CreateHubSpotEmailEngagementOptions
): Promise<HubSpotEngagementRecord> {
  const contactId = Number(options.contactId);

  if (!Number.isFinite(contactId) || contactId <= 0) {
    throw new Error("HubSpot contactId inválido para registrar engagement");
  }

  const response = await hubspotRequest<HubSpotLegacyEngagementResponse>({
    accessToken: options.accessToken,
    path: "/engagements/v1/engagements",
    method: "POST",
    body: {
      engagement: {
        active: true,
        type: "EMAIL",
        timestamp: new Date(options.sentAt ?? new Date().toISOString()).getTime(),
      },
      associations: {
        contactIds: [contactId],
      },
      metadata: {
        subject: options.subject,
        text: options.body,
        from: { email: "noreply@leadby.app" },
        to: options.recipientEmail ? [{ email: options.recipientEmail }] : [],
      },
    },
  });

  return {
    id: parseHubSpotRecordId(response.engagement?.id),
  };
}
