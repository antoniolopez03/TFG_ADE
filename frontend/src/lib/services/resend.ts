import { Resend } from "resend";

export interface SendEmailViaResendOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailViaResendResult {
  id: string;
}

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

/**
 * Envia un correo transaccional con Resend y devuelve el message id.
 */
export async function sendEmailViaResend(
  options: SendEmailViaResendOptions
): Promise<SendEmailViaResendResult> {
  const client = createResendClient();

  const from =
    options.from?.trim() || process.env.RESEND_FROM_EMAIL?.trim() || "LeadBy <noreply@leadby.app>";

  const { data, error } = await client.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Resend no devolvio un message id");
  }

  return {
    id: data.id,
  };
}
