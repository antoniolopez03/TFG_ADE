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

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const DEFAULT_PER_PAGE = 10;

function normalizePerPage(perPage?: number): number {
  if (!perPage || Number.isNaN(perPage)) {
    return DEFAULT_PER_PAGE;
  }

  return Math.min(Math.max(Math.trunc(perPage), 1), DEFAULT_PER_PAGE);
}

function buildPrompt(criteria: MockSearchCriteria, perPage: number): string {
  return `Eres un generador de datos de prospección B2B para demos y testing. 
Genera exactamente ${perPage} contactos decisores ficticios pero completamente realistas y verosímiles.

Parámetros de búsqueda:
- Sector: ${criteria.sector}
- Ubicación: ${criteria.ubicacion}
- Tamaño de empresa: ${criteria.tamano ?? "cualquiera"}

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

function extractGeminiText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const candidates = (payload as { candidates?: unknown[] }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return "";
  }

  const firstCandidate = candidates[0] as {
    content?: { parts?: Array<{ text?: string }> };
  };

  const parts = firstCandidate.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
}

/**
 * Genera un listado ficticio de contactos + empresa usando Gemini.
 * Si Gemini falla o no devuelve JSON válido, retorna array vacío.
 */
export async function searchPeopleWithCompany(
  criteria: MockSearchCriteria
): Promise<ApolloPerson[]> {
  const perPage = normalizePerPage(criteria.perPage);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY no configurada para apollo-mock");
    return [];
  }

  const prompt = buildPrompt(criteria, perPage);

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error llamando a Gemini en apollo-mock", {
        status: response.status,
        body: errorText,
      });
      return [];
    }

    const payload = (await response.json()) as unknown;
    const generatedText = extractGeminiText(payload);
    const cleaned = cleanJsonText(generatedText);

    let parsed: unknown;

    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      const extractedArray = extractArrayPayload(cleaned);

      if (!extractedArray) {
        console.error("No se pudo extraer un array JSON válido de Gemini", error);
        return [];
      }

      try {
        parsed = JSON.parse(extractedArray);
      } catch (arrayError) {
        console.error("Parse JSON fallido en apollo-mock", arrayError);
        return [];
      }
    }

    if (!Array.isArray(parsed)) {
      console.error("Gemini no devolvió un array en apollo-mock", parsed);
      return [];
    }

    const validPeople = parsed.filter(
      (item): item is ApolloPerson => Boolean(item) && typeof item === "object"
    );

    return validPeople.slice(0, Math.min(validPeople.length, perPage));
  } catch (error) {
    console.error("Error inesperado en apollo-mock", error);
    return [];
  }
}

export async function enrichOrganization(): Promise<null> {
  return null;
}
