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
  [key: string]: unknown;
}

export interface ApolloOrganizationSearchCriteria {
  query?: string;
  location?: string;
  sector?: string;
  ubicacion?: string;
  tamano?: string;
  perPage?: number;
}

export interface ApolloPeopleSearchCriteria {
  organizationId?: string;
  organizationDomain?: string;
  organizationName?: string;
  titles?: string[];
  seniorities?: string[];
  perPage?: number;
}

export interface ApolloOrganizationEnrichCriteria {
  domain?: string;
  organizationId?: string;
}

interface ApolloOrganizationsResponse {
  organizations?: ApolloOrganization[];
  accounts?: ApolloOrganization[];
  results?: ApolloOrganization[] | { organizations?: ApolloOrganization[] };
  [key: string]: unknown;
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

function extractOrganizations(payload: ApolloOrganizationsResponse): ApolloOrganization[] {
  if (Array.isArray(payload.organizations)) {
    return payload.organizations;
  }

  if (Array.isArray(payload.accounts)) {
    return payload.accounts;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (
    payload.results &&
    typeof payload.results === "object" &&
    Array.isArray(payload.results.organizations)
  ) {
    return payload.results.organizations;
  }

  return [];
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
 * Busca organizaciones en Apollo con límite estricto de 10 resultados para el MVP.
 */
export async function searchOrganizations(
  criteria: ApolloOrganizationSearchCriteria
): Promise<ApolloOrganization[]> {
  const perPage = normalizePerPage(criteria.perPage);

  const body: Record<string, unknown> = {
    q_organization_name: criteria.query,
    q_organization_keyword_tags: criteria.sector ? [criteria.sector] : undefined,
    organization_locations: criteria.location
      ? [criteria.location]
      : criteria.ubicacion
      ? [criteria.ubicacion]
      : undefined,
    organization_num_employees_ranges: criteria.tamano ? [criteria.tamano] : undefined,
    per_page: perPage,
    page: 1,
  };

  try {
    const payload = await apolloRequest<ApolloOrganizationsResponse>({
      path: "/mixed_companies/search",
      body,
    });
    return extractOrganizations(payload).slice(0, APOLLO_MAX_PER_PAGE);
  } catch (error) {
    if (!(error instanceof ApolloApiError) || error.status !== 404) {
      throw error;
    }

    const fallbackPayload = await apolloRequest<ApolloOrganizationsResponse>({
      path: "/organizations/search",
      body,
    });

    return extractOrganizations(fallbackPayload).slice(0, APOLLO_MAX_PER_PAGE);
  }
}

/**
 * Busca contactos decisores en Apollo para una organización concreta.
 */
export async function searchPeople(
  criteria: ApolloPeopleSearchCriteria
): Promise<ApolloPerson[]> {
  const perPage = normalizePerPage(criteria.perPage);

  const body: Record<string, unknown> = {
    q_organization_ids: criteria.organizationId ? [criteria.organizationId] : undefined,
    q_organization_domains: criteria.organizationDomain
      ? [criteria.organizationDomain]
      : undefined,
    q_organization_name: criteria.organizationName,
    person_titles: criteria.titles,
    person_seniorities: criteria.seniorities,
    per_page: perPage,
    page: 1,
  };

  try {
    const payload = await apolloRequest<ApolloPeopleResponse>({
      path: "/mixed_people/search",
      body,
    });
    return extractPeople(payload).slice(0, APOLLO_MAX_PER_PAGE);
  } catch (error) {
    if (!(error instanceof ApolloApiError) || error.status !== 404) {
      throw error;
    }

    const fallbackPayload = await apolloRequest<ApolloPeopleResponse>({
      path: "/people/search",
      body,
    });
    return extractPeople(fallbackPayload).slice(0, APOLLO_MAX_PER_PAGE);
  }
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
