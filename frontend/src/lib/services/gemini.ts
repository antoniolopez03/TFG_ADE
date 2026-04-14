import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_FLASH_MODEL = "gemini-2.0-flash";

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
 * Obtiene el modelo Flash de Gemini usado en el MVP.
 */
export function createGeminiFlashModel() {
  return createGeminiClient().getGenerativeModel({ model: GEMINI_FLASH_MODEL });
}
