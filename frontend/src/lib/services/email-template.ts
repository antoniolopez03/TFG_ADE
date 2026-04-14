interface BuildLeadByEmailHtmlOptions {
  bodyText: string;
  unsubscribeUrl: string;
  recipientName?: string | null;
  companyName?: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toBodyHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => `<p style=\"margin:0 0 14px;\">${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

/**
 * Plantilla HTML base para emails transaccionales en LeadBy.
 * Incluye footer legal y enlace opt-out funcional.
 */
export function buildLeadByEmailHtml(options: BuildLeadByEmailHtmlOptions): string {
  const recipient = options.recipientName?.trim() || "hola";
  const company = options.companyName?.trim() || "tu empresa";
  const body = toBodyHtml(options.bodyText);
  const unsubscribeUrl = options.unsubscribeUrl.trim();

  return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LeadBy</title>
    <style>
      body { margin: 0; padding: 0; background: #f4f6fb; font-family: Arial, sans-serif; color: #111827; }
      .wrapper { width: 100%; background: #f4f6fb; padding: 24px 12px; }
      .card { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e5e7eb; }
      .header { background: linear-gradient(120deg, #0f172a, #1f2937); color: #ffffff; padding: 20px 24px; }
      .title { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.3px; }
      .subtitle { margin: 8px 0 0; font-size: 13px; opacity: 0.85; }
      .content { padding: 24px; font-size: 15px; line-height: 1.65; }
      .footer { border-top: 1px solid #e5e7eb; padding: 18px 24px 22px; font-size: 12px; line-height: 1.5; color: #4b5563; background: #fafafa; }
      .unsubscribe { margin-top: 12px; }
      .unsubscribe a { color: #0f766e; text-decoration: underline; }
      @media (max-width: 640px) {
        .wrapper { padding: 10px; }
        .header { padding: 16px; }
        .content { padding: 18px 16px; font-size: 14px; }
        .footer { padding: 14px 16px 18px; }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="header">
          <h1 class="title">LeadBy</h1>
          <p class="subtitle">Prospeccion comercial asistida por IA</p>
        </div>
        <div class="content">
          <p style="margin:0 0 14px;">Hola ${escapeHtml(recipient)},</p>
          ${body}
          <p style="margin:18px 0 0;">Gracias por tu tiempo.</p>
          <p style="margin:8px 0 0;">Equipo LeadBy · ${escapeHtml(company)}</p>
        </div>
        <div class="footer">
          <div>Este mensaje se envia en contexto B2B y bajo interes legitimo.</div>
          <div class="unsubscribe">
            Si no deseas recibir mas comunicaciones, puedes darte de baja aqui:
            <a href="${escapeHtml(unsubscribeUrl)}" target="_blank" rel="noopener noreferrer">Cancelar suscripcion</a>
          </div>
          <div style="margin-top:8px;">Tambien puedes consultar nuestra politica de privacidad en leadby.app/legal/privacy.</div>
        </div>
      </div>
    </div>
  </body>
</html>
  `;
}
