import { createGeminiProModel } from "@/lib/services/gemini";

export interface ApolloOrganization {
  id?: string;
  name?: string;
  primary_domain?: string;
  website_url?: string;
  linkedin_url?: string;
  industry?: string;
  city?: string;
  country?: string;
  phone?: string;
  estimated_num_employees?: number;
  annual_revenue_printed?: string;
  short_description?: string;
  [key: string]: unknown;
}

export interface ApolloPerson {
  id?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  email?: string;
  email_status?: string;
  seniority?: string;
  departments?: string[];
  linkedin_url?: string;
  organization?: ApolloOrganization;
  [key: string]: unknown;
}

export interface MockSearchCriteria {
  sector: string;
  ubicacion: string;
  tamano?: string;
  perPage?: number;
}

const DEFAULT_PER_PAGE = 10;

export type ApolloMockAiErrorCode = "SERVIDOR_SATURADO" | "LIMITE_PETICIONES" | "FALLO_IA";

export class ApolloMockAiError extends Error {
  readonly code: ApolloMockAiErrorCode;
  readonly status: 503 | 429 | 500;
  readonly publicMessage: string;

  constructor(options: {
    code: ApolloMockAiErrorCode;
    status: 503 | 429 | 500;
    message: string;
    publicMessage: string;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = "ApolloMockAiError";
    this.code = options.code;
    this.status = options.status;
    this.publicMessage = options.publicMessage;
  }
}

export function isApolloMockAiError(error: unknown): error is ApolloMockAiError {
  return error instanceof ApolloMockAiError;
}

function normalizePerPage(perPage?: number): number {
  if (!perPage || Number.isNaN(perPage)) {
    return DEFAULT_PER_PAGE;
  }

  return Math.min(Math.max(Math.trunc(perPage), 1), DEFAULT_PER_PAGE);
}

function resolveErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const unknownError = error as {
    status?: unknown;
    statusCode?: unknown;
    code?: unknown;
  };

  const fromStatus =
    typeof unknownError.status === "number" ? unknownError.status : Number(unknownError.status);
  if (Number.isFinite(fromStatus)) {
    return Number(fromStatus);
  }

  const fromStatusCode =
    typeof unknownError.statusCode === "number"
      ? unknownError.statusCode
      : Number(unknownError.statusCode);
  if (Number.isFinite(fromStatusCode)) {
    return Number(fromStatusCode);
  }

  const fromCode = typeof unknownError.code === "number" ? unknownError.code : Number(unknownError.code);
  if (Number.isFinite(fromCode)) {
    return Number(fromCode);
  }

  return null;
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Error desconocido al generar contenido con Gemini";
}

function buildGenericAiError(message: string, cause?: unknown): ApolloMockAiError {
  return new ApolloMockAiError({
    code: "FALLO_IA",
    status: 500,
    message,
    publicMessage:
      "No se pudo completar la generación con IA en este momento. Por favor, vuelve a intentarlo en unos minutos.",
    cause,
  });
}

function classifyGeminiError(error: unknown): ApolloMockAiError {
  if (isApolloMockAiError(error)) {
    return error;
  }

  const status = resolveErrorStatus(error);
  const message = resolveErrorMessage(error);
  const normalizedMessage = message.toLowerCase();

  const isServerSaturated =
    status === 503 ||
    normalizedMessage.includes("experiencing high demand") ||
    normalizedMessage.includes("high demand") ||
    normalizedMessage.includes("service unavailable") ||
    normalizedMessage.includes("unavailable");

  if (isServerSaturated) {
    return new ApolloMockAiError({
      code: "SERVIDOR_SATURADO",
      status: 503,
      message: `Gemini saturado: ${message}`,
      publicMessage:
        "Los servidores de IA están experimentando alta demanda. Por favor, espera 30 segundos y vuelve a intentarlo.",
      cause: error,
    });
  }

  const isRateLimited =
    status === 429 ||
    normalizedMessage.includes("too many requests") ||
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("quota");

  if (isRateLimited) {
    return new ApolloMockAiError({
      code: "LIMITE_PETICIONES",
      status: 429,
      message: `Gemini con límite de peticiones: ${message}`,
      publicMessage:
        "Se alcanzó el límite de peticiones de IA. Espera unos segundos y vuelve a intentarlo.",
      cause: error,
    });
  }

  return buildGenericAiError(`Fallo inesperado en Gemini: ${message}`, error);
}

function normalizeExcludedDomains(dominiosExcluidos?: string[]): string[] {
  if (!Array.isArray(dominiosExcluidos)) {
    return [];
  }

  const normalized = dominiosExcluidos
    .filter((dominio): dominio is string => typeof dominio === "string")
    .map((dominio) => dominio.trim().toLowerCase())
    .filter((dominio) => dominio.length > 0);

  return Array.from(new Set(normalized));
}

function buildPrompt(
  criteria: MockSearchCriteria,
  perPage: number,
  dominiosExcluidos: string[]
): string {
  const exclusionRule =
    dominiosExcluidos.length > 0
      ? `\nCRÍTICO: NO puedes generar, bajo ninguna circunstancia, empresas cuyo dominio esté en la siguiente lista, ya que el usuario ya las ha prospectado: ${dominiosExcluidos.join(", ")}. Inventa o busca otras alternativas válidas.`
      : "";

  return `Eres un generador de datos de prospección B2B para demos y testing. 
Genera exactamente ${perPage} contactos decisores ficticios pero completamente realistas y verosímiles.

Parámetros de búsqueda:
- Sector: ${criteria.sector}
- Ubicación: ${criteria.ubicacion}
- Tamaño de empresa: ${criteria.tamano ?? "cualquiera"}
${exclusionRule}

Devuelve ÚNICAMENTE un array JSON válido, sin texto adicional, sin markdown, sin bloques de código.
Cada elemento debe tener esta estructura exacta:
{
  "id": "mock_[uuid_v4_simulado]",
  "first_name": "nombre real español",
  "last_name": "apellido real español",
  "title": "cargo relevante para el sector indicado",
  "email": "nombre.apellido@dominio-empresa.es",
  "email_status": "verified",
  "seniority": "director|manager|vp|c_suite",
  "departments": ["department_name"],
  "linkedin_url": "https://www.linkedin.com/in/nombre-apellido-empresa",
  "organization": {
    "id": "org_mock_[uuid_v4_simulado]",
    "name": "nombre empresa española realista del sector",
    "primary_domain": "dominio-empresa.es",
    "website_url": "https://www.dominio-empresa.es",
    "linkedin_url": "https://www.linkedin.com/company/nombre-empresa",
    "industry": "${criteria.sector}",
    "city": "ciudad real de ${criteria.ubicacion}",
    "country": "Spain",
    "phone": "+34 9XX XXX XXX",
    "estimated_num_employees": número entero realista,
    "annual_revenue_printed": "Xm€ - Ym€",
    "short_description": "descripción de 1 frase de la empresa"
  }
}

Requisitos de calidad:
- Los nombres y apellidos deben ser españoles reales y variados
- Los cargos deben ser apropiados para el sector indicado (ej: sector metalurgia → Director de Producción, Responsable de Compras, Director de Operaciones)
- Los dominios de empresa deben ser coherentes con el nombre de la empresa
- Las ciudades deben ser reales y estar en la zona geográfica indicada
- Los emails deben seguir el patrón nombre.apellido@dominio
- No repitas empresas: cada contacto debe pertenecer a una empresa diferente
- Los números de empleados deben ser coherentes con el tamaño indicado`;
}

function cleanJsonText(rawText: string): string {
  let cleaned = rawText.trim();

  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  if (cleaned.toLowerCase().startsWith("json")) {
    cleaned = cleaned.slice(4).trim();
  }

  return cleaned;
}

function extractArrayPayload(rawText: string): string | null {
  const start = rawText.indexOf("[");
  const end = rawText.lastIndexOf("]");

  if (start < 0 || end <= start) {
    return null;
  }

  return rawText.slice(start, end + 1);
}

/**
 * Genera un listado ficticio de contactos + empresa usando Gemini.
 * Si Gemini falla, lanza un error tipado para que la API responda con status semántico.
 */
export async function searchPeopleWithCompany(
  criteria: MockSearchCriteria,
  dominiosExcluidos?: string[]
): Promise<ApolloPerson[]> {
  const perPage = normalizePerPage(criteria.perPage);
  const normalizedExcludedDomains = normalizeExcludedDomains(dominiosExcluidos);
  const prompt = buildPrompt(criteria, perPage, normalizedExcludedDomains);

  let generatedText = "";

  try {
    const model = createGeminiProModel({
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 4096,
    });

    const generation = await model.generateContent(prompt);
    generatedText = generation.response.text();
  } catch (error) {
    throw classifyGeminiError(error);
  }

  const cleaned = cleanJsonText(generatedText);
  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    const extractedArray = extractArrayPayload(cleaned);

    if (!extractedArray) {
      throw buildGenericAiError("Gemini devolvió una respuesta no parseable (sin array JSON).", error);
    }

    try {
      parsed = JSON.parse(extractedArray);
    } catch (arrayError) {
      throw buildGenericAiError("Gemini devolvió un JSON inválido para la prospección mock.", arrayError);
    }
  }

  if (!Array.isArray(parsed)) {
    throw buildGenericAiError("Gemini no devolvió un array de resultados para la prospección mock.");
  }

  const validPeople = parsed.filter(
    (item): item is ApolloPerson => Boolean(item) && typeof item === "object"
  );

  return validPeople.slice(0, Math.min(validPeople.length, perPage));
}

export async function enrichOrganization(): Promise<null> {
  return null;
}
