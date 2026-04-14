const APOLLO_BASE_URL = "https://api.apollo.io/api/v1";
export const APOLLO_MAX_PER_PAGE = 10;

export class ApolloApiError extends Error {
  status: number;
  details: string;

  constructor(status: number, details: string) {
    super(`Apollo request failed (${status}): ${details}`);
    this.name = "ApolloApiError";
    this.status = status;
    this.details = details;
  }
}

export interface ApolloRequestOptions {
  path: string;
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
}

export interface ApolloOrganization {
  id?: string;
  name?: string;
  organization_name?: string;
  primary_domain?: string;
  domain?: string;
  website_url?: string;
  linkedin_url?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  estimated_num_employees?: number;
  estimated_num_employees_range?: string;
  annual_revenue_printed?: string;
  technologies?: Array<{ name?: string } | string>;
  short_description?: string;
  [key: string]: unknown;
}

export interface ApolloPerson {
  id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  title?: string;
  email?: string;
  email_status?: string;
  seniority?: string;
  departments?: string[];
  department?: string;
  linkedin_url?: string;
  organization_id?: string;
  organization_name?: string;
  organization?: ApolloOrganization;
  [key: string]: unknown;
}

export interface ApolloPeopleWithCompanySearchCriteria {
  titles: string[];
  seniorities?: string[];
  sector: string;
  location: string;
  perPage?: number;
}

export interface ApolloOrganizationEnrichCriteria {
  domain?: string;
  organizationId?: string;
}

interface ApolloPeopleResponse {
  people?: ApolloPerson[];
  contacts?: ApolloPerson[];
  results?: ApolloPerson[] | { people?: ApolloPerson[] };
  [key: string]: unknown;
}

interface ApolloOrganizationEnrichResponse {
  organization?: ApolloOrganization;
  account?: ApolloOrganization;
  [key: string]: unknown;
}

function getApolloApiKey(): string {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    throw new Error("APOLLO_API_KEY no configurada");
  }

  return apiKey;
}

/**
 * Ejecuta una peticion tipada contra Apollo.
 *
 * Se utiliza como base comun para Search, Enrich y futuros endpoints.
 */
export async function apolloRequest<T>(options: ApolloRequestOptions): Promise<T> {
  const response = await fetch(`${APOLLO_BASE_URL}${options.path}`, {
    method: options.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": getApolloApiKey(),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApolloApiError(response.status, errorText);
  }

  return (await response.json()) as T;
}

function normalizePerPage(perPage?: number): number {
  if (!perPage || Number.isNaN(perPage)) {
    return APOLLO_MAX_PER_PAGE;
  }

  return Math.min(Math.max(Math.trunc(perPage), 1), APOLLO_MAX_PER_PAGE);
}

function extractPeople(payload: ApolloPeopleResponse): ApolloPerson[] {
  if (Array.isArray(payload.people)) {
    return payload.people;
  }

  if (Array.isArray(payload.contacts)) {
    return payload.contacts;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (
    payload.results &&
    typeof payload.results === "object" &&
    Array.isArray(payload.results.people)
  ) {
    return payload.results.people;
  }

  return [];
}

/**
 * Busca personas en Apollo con empresa anidada en una única llamada.
 * Los parámetros van en query string, no en body (requisito de mixed_people/api_search).
 */
export async function searchPeopleWithCompany(
  criteria: ApolloPeopleWithCompanySearchCriteria
): Promise<ApolloPerson[]> {
  const perPage = normalizePerPage(criteria.perPage);

  const params = new URLSearchParams();

  criteria.titles.forEach(t => params.append("person_titles[]", t));
  (criteria.seniorities ?? []).forEach(s => params.append("person_seniorities[]", s));
  params.append("person_locations[]", criteria.location);
  params.append("q_organization_keyword_tags[]", criteria.sector);
  params.append("per_page", String(perPage));
  params.append("page", "1");

  const response = await fetch(
    `${APOLLO_BASE_URL}/mixed_people/api_search?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": getApolloApiKey(),
        "Cache-Control": "no-cache",
        "accept": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApolloApiError(response.status, errorText);
  }

  const payload = (await response.json()) as ApolloPeopleResponse;
  return extractPeople(payload).slice(0, APOLLO_MAX_PER_PAGE);
}

/**
 * Enriquece una organización concreta desde Apollo por dominio o id.
 */
export async function enrichOrganization(
  criteria: ApolloOrganizationEnrichCriteria
): Promise<ApolloOrganization | null> {
  const payload = await apolloRequest<ApolloOrganizationEnrichResponse>({
    path: "/organizations/enrich",
    body: {
      domain: criteria.domain,
      id: criteria.organizationId,
    },
  });

  return payload.organization ?? payload.account ?? null;
}
