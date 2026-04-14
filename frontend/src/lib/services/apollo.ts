const APOLLO_BASE_URL = "https://api.apollo.io/api/v1";

export interface ApolloRequestOptions {
  path: string;
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
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
    throw new Error(`Apollo request failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as T;
}
