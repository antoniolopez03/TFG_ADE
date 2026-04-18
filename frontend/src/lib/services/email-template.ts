import sanitizeHtml from "sanitize-html";

interface BuildLeadByEmailHtmlOptions {
  bodyText: string;
  unsubscribeUrl: string;
  recipientName?: string | null;
  companyName?: string | null;
}

const EMAIL_BODY_ALLOWED_TAGS: sanitizeHtml.IOptions["allowedTags"] = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "ul",
  "ol",
  "li",
  "a",
  "span",
  "div",
];

const EMAIL_BODY_ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel", "style"],
  p: ["style"],
  ul: ["style"],
  ol: ["style"],
  li: ["style"],
  div: ["style"],
  span: ["style"],
  strong: ["style"],
  em: ["style"],
};

const EMAIL_BODY_ALLOWED_STYLES: sanitizeHtml.IOptions["allowedStyles"] = {
  "*": {
    "text-align": [/^(left|right|center|justify)$/i],
    color: [/^#[0-9a-f]{3,8}$/i, /^rgb\((?:\s*\d+\s*,){2}\s*\d+\s*\)$/i],
    "font-weight": [/^(normal|bold|[1-9]00)$/i],
  },
  p: {
    margin: [/^(?:\d+px|0)(?:\s+(?:\d+px|0)){0,3}$/i],
  },
  a: {
    "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb\((?:\s*\d+\s*,){2}\s*\d+\s*\)$/i],
    color: [/^#[0-9a-f]{3,8}$/i, /^rgb\((?:\s*\d+\s*,){2}\s*\d+\s*\)$/i],
    padding: [/^(?:\d+px|0)(?:\s+(?:\d+px|0)){0,3}$/i],
    "border-radius": [/^\d+px$/i],
    "text-decoration": [/^(none|underline)$/i],
    display: [/^(inline-block|inline)$/i],
    "font-size": [/^\d+px$/i],
    "line-height": [/^\d+(?:\.\d+)?(?:px|%)?$/i],
    border: [/^\d+px\s+(?:solid|dashed|none)\s+#[0-9a-f]{3,8}$/i],
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeBodyHtml(rawHtml: string): string {
  return sanitizeHtml(rawHtml, {
    allowedTags: EMAIL_BODY_ALLOWED_TAGS,
    allowedAttributes: EMAIL_BODY_ALLOWED_ATTRIBUTES,
    allowedStyles: EMAIL_BODY_ALLOWED_STYLES,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
    },
    transformTags: {
      a: (_tagName, attribs) => {
        const href = typeof attribs.href === "string" ? attribs.href.trim() : "";
        const safeHref = /^(https?:\/\/|mailto:)/i.test(href) ? href : "#";

        return {
          tagName: "a",
          attribs: {
            ...attribs,
            href: safeHref,
            target: "_blank",
            rel: "noopener noreferrer",
          },
        };
      },
    },
  }).trim();
}

function hasHtmlTags(value: string): boolean {
  return /<\/?[a-z][^>]*>/i.test(value);
}

function toLegacyParagraphHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 22px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:16px; line-height:1.85; color:#334155;">${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`
    )
    .join("");
}

function toBodyHtml(text: string): string {
  const trimmed = text.trim();

  if (!trimmed) {
    return "";
  }

  const rawBody = hasHtmlTags(trimmed) ? trimmed : toLegacyParagraphHtml(trimmed);
  return sanitizeBodyHtml(rawBody);
}

/**
 * Plantilla HTML base para emails transaccionales en LeadBy.
 * Incluye footer legal y enlace opt-out funcional.
 */
export function buildLeadByEmailHtml(options: BuildLeadByEmailHtmlOptions): string {
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
      body, table, td, p, a {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif !important;
      }
      @media only screen and (max-width: 600px) {
        .outer-wrap  { padding: 0 !important; }
        .header-cell { padding: 20px 22px !important; }
        .body-cell   { padding: 28px 22px 24px !important; }
        .footer-cell { padding: 16px 22px 20px !important; }
        .brand-name  { font-size: 19px !important; }
        .copy        { font-size: 15px !important; line-height: 1.85 !important; }
      }
    </style>
  </head>

  <body style="margin:0; padding:0; background-color:#edf1f7;">

    <!-- Preheader -->
    <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:transparent;">
      Mensaje de LeadBy para ${escapeHtml(company)}.&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;
    </div>

    <!-- Wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#edf1f7; width:100%;">
      <tr>
        <td align="center" class="outer-wrap" style="padding:36px 16px;">

          <!-- ── OUTER CARD SHELL con franja lateral izquierda ──────── -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; border-collapse:collapse; border-radius:16px; overflow:hidden; box-shadow:0 8px 30px rgba(15,23,42,0.09), 0 2px 6px rgba(15,23,42,0.05);">
            <tr>

              <!-- ── FRANJA IZQUIERDA TEAL ──────────────────────────── -->
              <td style="width:5px; min-width:5px; background-color:#0d9488; padding:0; font-size:0; line-height:0;">&nbsp;</td>

              <!-- ── CONTENIDO PRINCIPAL ────────────────────────────── -->
              <td style="padding:0; background-color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">

                  <!-- ── CABECERA ───────────────────────────────────── -->
                  <tr>
                    <td class="header-cell" style="background-color:#ffffff; padding:22px 32px 20px; border-bottom:1px solid #f1f5f9;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="vertical-align:middle;">
                            <p class="brand-name" style="margin:0; font-size:21px; font-weight:800; color:#0f172a; letter-spacing:-0.5px; line-height:1;">
                              Lead<span style="color:#0d9488;">By</span>
                            </p>
                          </td>
                          <!--[if !mso]><!-->
                          <td align="right" style="vertical-align:middle;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="background-color:#f0fdf9; border:1px solid #ccfbf1; border-radius:20px; padding:3px 10px;">
                                  <p style="margin:0; font-size:10px; font-weight:600; letter-spacing:0.8px; color:#0f766e; text-transform:uppercase; white-space:nowrap;">
                                    IA &middot; B2B
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                          <!--<![endif]-->
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- ── CUERPO ─────────────────────────────────────── -->
                  <tr>
                    <td class="body-cell" style="background-color:#ffffff; padding:36px 32px 30px;">

                      <!-- Cuerpo dinámico -->
                      ${body}

                      <!-- Separador decorativo · · · -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:30px 0 0;">
                        <tr>
                          <td style="padding-bottom:22px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="width:6px; height:6px; background-color:#0d9488; border-radius:50%; opacity:0.7;"></td>
                                <td style="width:8px;"></td>
                                <td style="width:6px; height:6px; background-color:#0d9488; border-radius:50%; opacity:0.4;"></td>
                                <td style="width:8px;"></td>
                                <td style="width:6px; height:6px; background-color:#0d9488; border-radius:50%; opacity:0.2;"></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Firma -->
                      <p style="margin:0 0 2px; font-size:13px; color:#94a3b8; line-height:1.5; font-style:italic;">Un saludo,</p>
                      <p style="margin:0 0 1px; font-size:15px; font-weight:700; color:#0f172a; line-height:1.4; letter-spacing:-0.1px;">Equipo LeadBy</p>
                      <p style="margin:0; font-size:12px; color:#0d9488; line-height:1.4; font-weight:600; letter-spacing:0.1px;">leadby.app</p>

                    </td>
                  </tr>

                  <!-- ── FOOTER ─────────────────────────────────────── -->
                  <tr>
                    <td class="footer-cell" style="background-color:#f8fafc; border-top:1px solid #f1f5f9; padding:16px 32px 20px;">
                      <p style="margin:0 0 7px; font-size:11px; line-height:1.6; color:#b0bac5;">
                        LeadBy &middot; Comunicacion B2B para <strong style="color:#94a3b8; font-weight:600;">${escapeHtml(company)}</strong> &middot; Interes legitimo (RGPD art.&nbsp;6.1.f)
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td>
                            <a href="${escapedUnsubscribeUrl}" target="_blank" rel="noopener noreferrer"
                               style="font-size:11px; color:#64748b; text-decoration:underline; font-weight:500;">
                              Darse de baja
                            </a>
                          </td>
                          <td style="padding:0 8px; font-size:11px; color:#dde3ea;">&middot;</td>
                          <td>
                            <a href="https://leadby.app/legal/privacy" target="_blank" rel="noopener noreferrer"
                               style="font-size:11px; color:#64748b; text-decoration:underline; font-weight:500;">
                              Politica de privacidad
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
              <!-- /Contenido principal -->

            </tr>
          </table>
          <!-- /Card -->

        </td>
      </tr>
    </table>

  </body>
</html>
  `;
}
