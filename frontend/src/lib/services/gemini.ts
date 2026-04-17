import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_PRIMARY_MODEL = "gemini-2.5-pro";
export const GEMINI_FALLBACK_MODEL = "gemini-2.5-flash";
export const GEMINI_PRO_MODEL = GEMINI_PRIMARY_MODEL;
const LOOKALIKE_GENERATION_CONFIG = {
  temperature: 0.25,
  topP: 0.85,
 
};
const EMAIL_GENERATION_CONFIG = {
  temperature: 0.65,
  topP: 0.92,
};
const DEFAULT_LOOKALIKE_TERMS = [
  "saas b2b espana",
  "software ventas empresas medianas",
  "automatizacion comercial b2b",
  "plataforma crm para pymes",
  "tecnologia para equipos comerciales",
];
const DEFAULT_MAX_LOOKALIKE_TERMS = 5;
const DEFAULT_EMAIL_MAX_WORDS = 150;
const STRICT_SPANISH_PROMPT =
  "IMPORTANTE: Debes escribir siempre en español impecable, utilizando correctamente todas las tildes y la letra 'ñ' (por ejemplo, escribe 'tamaño' en lugar de 'tamano'). No utilices formatos de texto que omitan caracteres especiales del idioma español.";

export interface TenantIaPreferences {
  tono_voz?: string;
  idioma?: string;
  propuesta_valor?: string;
  sector_objetivo?: string;
}

export interface WonDealSignal {
  nombre: string;
  industria?: string | null;
  tamanoEmpresa?: string | null;
  pais?: string | null;
  descripcion?: string | null;
  importe?: number | null;
}

export interface GenerateLookalikeTermsInput {
  wonDeals: WonDealSignal[];
  preferenciasIa?: TenantIaPreferences | null;
  maxTerms?: number;
}

export interface GenerateLookalikeTermsResult {
  terms: string[];
  fallbackUsed: boolean;
}

export interface ProspectCompanyContext {
  nombre: string;
  sector?: string | null;
  ciudad?: string | null;
  pais?: string | null;
  dominio?: string | null;
  linkedinUrl?: string | null;
  tecnologias?: string[] | null;
  descripcion?: string | null;
}

export interface ProspectContactContext {
  nombre?: string | null;
  apellidos?: string | null;
  cargo?: string | null;
  email?: string | null;
  linkedinUrl?: string | null;
  seniority?: string | null;
  departamento?: string | null;
}

export interface GenerateEmailDraftInput {
  empresa: ProspectCompanyContext;
  contacto?: ProspectContactContext | null;
  preferenciasIa?: TenantIaPreferences | null;
  maxWords?: number;
}

export interface GenerateEmailDraftResult {
  subject: string;
  body: string;
  wordCount: number;
  fallbackUsed: boolean;
}

export interface GeminiGenerationConfig {
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
}

function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no configurada");
  }

  return apiKey;
}

/**
 * Crea un cliente Gemini listo para ejecutar prompts server-side.
 */
export function createGeminiClient(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(getGeminiApiKey());
}

/**
 * Obtiene el modelo Pro de Gemini para tareas de redaccion y clasificacion B2B.
 */
export function createGeminiProModel(generationConfig?: GeminiGenerationConfig) {
  return createGeminiClient().getGenerativeModel({
    model: GEMINI_PRO_MODEL,
    ...(generationConfig ? { generationConfig } : {}),
  });
}

function createGeminiModel(model: string, generationConfig?: GeminiGenerationConfig) {
  return createGeminiClient().getGenerativeModel({
    model,
    ...(generationConfig ? { generationConfig } : {}),
  });
}

async function callGemini(
  model: string,
  prompt: string,
  generationConfig?: GeminiGenerationConfig
): Promise<string> {
  const response = await createGeminiModel(model, generationConfig).generateContent(prompt);
  return response.response.text();
}

function toStatusNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function resolveGeminiErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const root = error as {
    status?: unknown;
    statusCode?: unknown;
    code?: unknown;
    response?: { status?: unknown; statusCode?: unknown; code?: unknown };
    error?: { status?: unknown; statusCode?: unknown; code?: unknown };
    cause?: unknown;
  };

  const candidates = [
    root.status,
    root.statusCode,
    root.code,
    root.response?.status,
    root.response?.statusCode,
    root.response?.code,
    root.error?.status,
    root.error?.statusCode,
    root.error?.code,
  ];

  if (root.cause && typeof root.cause === "object") {
    const cause = root.cause as { status?: unknown; statusCode?: unknown; code?: unknown };
    candidates.push(cause.status, cause.statusCode, cause.code);
  }

  for (const candidate of candidates) {
    const status = toStatusNumber(candidate);
    if (status !== null) {
      return status;
    }
  }

  return null;
}

function resolveGeminiErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (!error || typeof error !== "object") {
    return "";
  }

  const unknownError = error as {
    message?: unknown;
    details?: unknown;
    error?: { message?: unknown; details?: unknown };
    cause?: unknown;
  };

  if (typeof unknownError.message === "string") {
    return unknownError.message;
  }

  if (typeof unknownError.details === "string") {
    return unknownError.details;
  }

  if (typeof unknownError.error?.message === "string") {
    return unknownError.error.message;
  }

  if (typeof unknownError.error?.details === "string") {
    return unknownError.error.details;
  }

  if (unknownError.cause instanceof Error) {
    return unknownError.cause.message;
  }

  return "";
}

/**
 * Detecta errores de indisponibilidad transitoria para activar fallback de modelo.
 */
export function isGeminiServiceUnavailableError(error: unknown): boolean {
  const status = resolveGeminiErrorStatus(error);
  const normalizedMessage = resolveGeminiErrorMessage(error).toLowerCase();
  const message = normalizedMessage.replace(/[_-]+/g, " ");

  if (status === 503 || status === 429) {
    return true;
  }

  if (status === 500 && (message.includes("overloaded") || message.includes("unavailable"))) {
    return true;
  }

  return (
    message.includes("model is overloaded") ||
    message.includes("service unavailable") ||
    message.includes("quota exceeded") ||
    message.includes("resource exhausted")
  );
}

/**
 * Ejecuta Gemini con modelo primario y fallback automatico ante errores de disponibilidad.
 */
export async function callGeminiWithFallback(
  prompt: string,
  generationConfig?: GeminiGenerationConfig
): Promise<string> {
  try {
    return await callGemini(GEMINI_PRIMARY_MODEL, prompt, generationConfig);
  } catch (error) {
    if (!isGeminiServiceUnavailableError(error)) {
      throw error;
    }

    console.warn(
      `[Gemini] Modelo primario no disponible, usando fallback: ${GEMINI_FALLBACK_MODEL}`
    );

    return await callGemini(GEMINI_FALLBACK_MODEL, prompt, generationConfig);
  }
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeMaxTerms(value?: number): number {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_MAX_LOOKALIKE_TERMS;
  }

  return Math.min(Math.max(Math.trunc(value), 1), DEFAULT_MAX_LOOKALIKE_TERMS);
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function clampWords(text: string, maxWords: number): string {
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length <= maxWords) {
    return words.join(" ");
  }

  return words.slice(0, maxWords).join(" ");
}

function dedupeCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(value);
  }

  return output;
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  let cleaned = text.trim();
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start < 0 || end <= start) {
      return null;
    }

    const maybeJson = cleaned.slice(start, end + 1);
    try {
      const parsed = JSON.parse(maybeJson);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
}

function sanitizeSearchTerm(term: string): string | null {
  const normalized = term.replace(/\s+/g, " ").trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return normalized;
}

function normalizeTermArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const terms = value
    .map((item) => (typeof item === "string" ? sanitizeSearchTerm(item) : null))
    .filter((item): item is string => Boolean(item));

  return dedupeCaseInsensitive(terms);
}

function buildFallbackLookalikeTerms(input: GenerateLookalikeTermsInput, maxTerms: number): string[] {
  const suggested: string[] = [];

  const sector = toNonEmptyString(input.preferenciasIa?.sector_objetivo);
  if (sector) {
    suggested.push(`${sector.toLowerCase()} b2b`);
  }

  const propuestaValor = toNonEmptyString(input.preferenciasIa?.propuesta_valor);
  if (propuestaValor) {
    suggested.push(propuestaValor.toLowerCase());
  }

  for (const deal of input.wonDeals.slice(0, maxTerms)) {
    if (deal.industria) {
      suggested.push(`${deal.industria.toLowerCase()} espana`);
    }

    if (deal.tamanoEmpresa) {
      suggested.push(`empresas ${deal.tamanoEmpresa.toLowerCase()}`);
    }

    if (deal.pais) {
      suggested.push(`b2b ${deal.pais.toLowerCase()}`);
    }
  }

  const normalizedSuggested = dedupeCaseInsensitive(
    suggested
      .map((item) => sanitizeSearchTerm(item))
      .filter((item): item is string => Boolean(item))
  );

  const combined = dedupeCaseInsensitive([...normalizedSuggested, ...DEFAULT_LOOKALIKE_TERMS]);
  return combined.slice(0, maxTerms);
}

function resolvePromptLanguage(idioma?: string): string {
  const normalized = toNonEmptyString(idioma)?.toLowerCase();

  if (normalized === "en") {
    return "ingles";
  }

  if (normalized === "de") {
    return "aleman";
  }

  return "espanol";
}

function buildFallbackEmailDraft(
  input: GenerateEmailDraftInput,
  maxWords: number
): { subject: string; body: string } {
  const companyName = toNonEmptyString(input.empresa.nombre) ?? "tu empresa";
  const contactFirstName = toNonEmptyString(input.contacto?.nombre) ?? "equipo";
  const contactRole = toNonEmptyString(input.contacto?.cargo) ?? "responsable comercial";
  const valueProp = toNonEmptyString(input.preferenciasIa?.propuesta_valor);

  const subject = `Idea para ${companyName}`;

  const lines = [
    `Hola ${contactFirstName},`,
    `he visto que lideras ${contactRole} en ${companyName}.`,
    valueProp
      ? `En LeadBy ayudamos a equipos B2B con ${valueProp}.`
      : "En LeadBy ayudamos a equipos B2B a generar mas oportunidades comerciales con prospeccion asistida por IA.",
    "Si te encaja, puedo compartirte en una llamada corta como lo aplicamos en equipos similares al tuyo.",
    "Un saludo,",
    "Equipo LeadBy",
  ];

  const body = clampWords(lines.join(" "), maxWords);
  return { subject, body };
}

/**
 * Genera 5 terminos de busqueda lookalike en formato JSON usando Gemini.
 */
export async function generateLookalikeTerms(
  input: GenerateLookalikeTermsInput
): Promise<GenerateLookalikeTermsResult> {
  const maxTerms = normalizeMaxTerms(input.maxTerms);
  const fallbackTerms = buildFallbackLookalikeTerms(input, maxTerms);

  const prompt = [
    "Eres un estratega de prospeccion B2B.",
    "Objetivo: generar exactamente 5 terminos de busqueda para Apollo basados en clientes ganados.",
    "Devuelve SOLO JSON valido con este formato exacto:",
    '{"terminos":["termino 1","termino 2","termino 3","termino 4","termino 5"]}',
    "Reglas:",
    "- Sin texto extra fuera del JSON.",
    "- Terminos utiles para descubrir empresas similares.",
    "- Maximo 8 palabras por termino.",
    "- Evitar duplicados.",
    `Preferencias del tenant: ${JSON.stringify(input.preferenciasIa ?? {})}`,
    `Historial de clientes ganados: ${JSON.stringify(input.wonDeals.slice(0, 20))}`,
    STRICT_SPANISH_PROMPT,
  ].join("\n");

  const rawText = await callGeminiWithFallback(prompt, LOOKALIKE_GENERATION_CONFIG);
  const payload = parseJsonObject(rawText);

  if (!payload) {
    throw new Error("Gemini devolvio una respuesta mal formada para terminos lookalike");
  }

  const terms = normalizeTermArray(payload?.terminos ?? payload?.terms);

  const merged = dedupeCaseInsensitive([...terms, ...fallbackTerms]).slice(0, maxTerms);

  return {
    terms: merged,
    fallbackUsed: terms.length < maxTerms,
  };
}

/**
 * Genera asunto y borrador de email hiperpersonalizado para un lead.
 */
export async function generateProspectEmailDraft(
  input: GenerateEmailDraftInput
): Promise<GenerateEmailDraftResult> {
  const maxWords = Math.min(Math.max(Math.trunc(input.maxWords ?? DEFAULT_EMAIL_MAX_WORDS), 60), 180);
  const language = resolvePromptLanguage(input.preferenciasIa?.idioma);
  const fallbackDraft = buildFallbackEmailDraft(input, maxWords);

  const prompt = [
    "Eres un SDR senior B2B especializado en cold email personalizado.",
    `Idioma obligatorio: ${language}.`,
    "Devuelve SOLO JSON valido con este formato exacto:",
    '{"asunto":"...","cuerpo":"..."}',
    "Reglas obligatorias:",
    "- El cuerpo debe tener maximo 150 palabras.",
    "- Debe incluir una propuesta concreta y un CTA suave.",
    "- No inventes datos no proporcionados.",
    "- No uses lenguaje exagerado ni promesas absolutas.",
    `Preferencias del tenant: ${JSON.stringify(input.preferenciasIa ?? {})}`,
    `Contexto empresa: ${JSON.stringify(input.empresa)}`,
    `Contexto contacto: ${JSON.stringify(input.contacto ?? {})}`,
    STRICT_SPANISH_PROMPT,
  ].join("\n");

  const rawText = await callGeminiWithFallback(prompt, EMAIL_GENERATION_CONFIG);
  const payload = parseJsonObject(rawText);

  if (!payload) {
    throw new Error("Gemini devolvio una respuesta mal formada para borrador de email");
  }

  const subject =
    toNonEmptyString(payload?.asunto) ??
    toNonEmptyString(payload?.subject) ??
    fallbackDraft.subject;
  const bodyCandidate =
    toNonEmptyString(payload?.cuerpo) ??
    toNonEmptyString(payload?.body) ??
    fallbackDraft.body;
  const body = clampWords(bodyCandidate, maxWords);

  return {
    subject,
    body,
    wordCount: countWords(body),
    fallbackUsed: !toNonEmptyString(payload?.asunto) || !toNonEmptyString(payload?.cuerpo),
  };
}
