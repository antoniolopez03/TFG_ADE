function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function hasHtmlTags(value: string): boolean {
  return /<\/?[a-z][^>]*>/i.test(value);
}

function toPreviewHtmlBody(text: string): string {
  const trimmed = text.trim();

  if (!trimmed) {
    return "";
  }

  if (hasHtmlTags(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style=\"margin:0 0 16px; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.6; color:#374151;\">${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`
    )
    .join("");
}

/**
 * Construye un documento HTML aislado para previsualizar el borrador.
 * Usa allow-scripts únicamente para reenviar mousemove al parent vía postMessage,
 * lo que permite que el cursor personalizado del parent siga funcionando dentro del iframe.
 */
export function buildEmailPreviewDocument(content: string): string {
  const body = toPreviewHtmlBody(content);

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        cursor: none !important;
      }

      body {
        font-family: Arial, Helvetica, sans-serif;
        color: #374151;
        padding: 16px;
      }

      p, ul, ol {
        margin: 0 0 14px;
      }

      a {
        color: #0f766e;
        cursor: none !important;
      }
    </style>
  </head>
  <body>${body}<script>
    (function () {
      document.addEventListener('mousemove', function (e) {
        parent.postMessage({ type: 'iframe-mm', x: e.clientX, y: e.clientY }, '*');
      }, { passive: true });
      document.addEventListener('mouseleave', function () {
        parent.postMessage({ type: 'iframe-ml' }, '*');
      });
      document.addEventListener('mouseenter', function () {
        parent.postMessage({ type: 'iframe-me' }, '*');
      });
    })();
  </script></body>
</html>`;
}