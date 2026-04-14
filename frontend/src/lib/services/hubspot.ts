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
  method?: "GET" | "POST";
  body?: HubSpotSearchRequest;
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

  return (await response.json()) as T;
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
