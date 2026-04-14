import { Resend } from "resend";

function getResendApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY no configurada");
  }

  return apiKey;
}

/**
 * Devuelve una instancia de Resend para envio transaccional.
 */
export function createResendClient(): Resend {
  return new Resend(getResendApiKey());
}
