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
    .map(
      (paragraph) =>
        `<p style=\"margin:0 0 16px; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.6; color:#374151;\">${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`
    )
    .join("");
}

/**
 * Plantilla HTML base para emails transaccionales en LeadBy.
 * Incluye footer legal y enlace opt-out funcional.
 */
export function buildLeadByEmailHtml(options: BuildLeadByEmailHtmlOptions): string {
  const recipient = options.recipientName?.trim() || "equipo";
  const company = options.companyName?.trim() || "tu empresa";
  const body = toBodyHtml(options.bodyText);
  const unsubscribeUrl = options.unsubscribeUrl.trim();
  const escapedUnsubscribeUrl = escapeHtml(unsubscribeUrl);

  return `
<!doctype html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
    <title>LeadBy</title>
    <style>
      body,
      table,
      td,
      p,
      a {
        font-family: Arial, Helvetica, sans-serif !important;
      }
      @media only screen and (max-width: 620px) {
        .outer-padding {
          padding: 16px 10px !important;
        }
        .card-padding {
          padding: 24px 18px 20px !important;
        }
        .footer-padding {
          padding: 16px 18px 20px !important;
        }
        .brand-title {
          font-size: 19px !important;
        }
        .content-copy {
          font-size: 16px !important;
          line-height: 1.6 !important;
        }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#f3f4f6;">
    <div style="display:none; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px;">
      Mensaje comercial de LeadBy para ${escapeHtml(company)}.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; border-collapse:collapse; background-color:#f3f4f6;">
      <tr>
        <td align="center" class="outer-padding" style="padding:28px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:640px; border-collapse:separate; background-color:#ffffff; border:1px solid #e5e7eb; border-radius:14px; box-shadow:0 8px 24px rgba(15, 23, 42, 0.06);">
            <tr>
              <td style="padding:22px 28px; border-bottom:1px solid #eceff3; border-top-left-radius:14px; border-top-right-radius:14px; background-color:#ffffff;">
                <p class="brand-title" style="margin:0; font-size:21px; line-height:1.2; font-weight:700; color:#111827; letter-spacing:0.2px;">LeadBy</p>
                <p style="margin:6px 0 0; font-size:13px; line-height:1.4; color:#6b7280;">Prospeccion comercial asistida por IA</p>
              </td>
            </tr>

            <tr>
              <td class="card-padding" style="padding:30px 28px 22px;">
                <p class="content-copy" style="margin:0 0 16px; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.6; color:#374151;">
                  Hola ${escapeHtml(recipient)},
                </p>

                ${body}

                <p class="content-copy" style="margin:18px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.6; color:#374151;">
                  Un saludo,
                </p>
                <p class="content-copy" style="margin:4px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.6; color:#374151;">
                  Equipo LeadBy
                </p>
              </td>
            </tr>

            <tr>
              <td class="footer-padding" style="padding:18px 28px 22px; border-top:1px solid #eceff3; border-bottom-left-radius:14px; border-bottom-right-radius:14px; background-color:#f9fafb;">
                <p style="margin:0 0 8px; font-size:12px; line-height:1.5; color:#6b7280;">
                  LeadBy · Comunicacion profesional B2B para ${escapeHtml(company)}.
                </p>
                <p style="margin:0 0 8px; font-size:12px; line-height:1.5; color:#6b7280;">
                  Este mensaje se envia bajo interes legitimo comercial en entorno B2B y cumple criterios de RGPD para comunicaciones profesionales.
                </p>
                <p style="margin:0; font-size:12px; line-height:1.5; color:#6b7280;">
                  Si no deseas recibir mas correos, puedes
                  <a href="${escapedUnsubscribeUrl}" target="_blank" rel="noopener noreferrer" style="color:#0f766e; text-decoration:underline;">darte de baja aqui</a>.
                </p>
                <p style="margin:8px 0 0; font-size:12px; line-height:1.5; color:#6b7280;">
                  Politica de privacidad: <a href="https://leadby.app/legal/privacy" target="_blank" rel="noopener noreferrer" style="color:#0f766e; text-decoration:underline;">leadby.app/legal/privacy</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}
