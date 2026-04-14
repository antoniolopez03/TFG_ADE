import { sendEmailViaResend } from "@/lib/services/resend";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactFormSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(120),
  empresa: z.string().trim().min(2, "La empresa es obligatoria").max(160),
  email: z.string().trim().email("Email inválido").max(254),
  telefono: z.string().trim().max(40).optional(),
  cargo: z.string().trim().max(100).optional(),
  mensaje: z.string().trim().min(10, "El mensaje es demasiado corto").max(2000),
  website: z.string().trim().max(200).optional(),
});

type ContactFormPayload = z.infer<typeof contactFormSchema>;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getDestinationEmail(): string | null {
  const explicitTo = process.env.CONTACT_FORM_TO_EMAIL?.trim();
  if (explicitTo) {
    return explicitTo;
  }

  const testTo = process.env.RESEND_TEST_TO?.trim();
  if (testTo) {
    return testTo;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  if (!fromEmail) {
    return null;
  }

  const match = fromEmail.match(/<([^>]+)>/);
  if (match?.[1]) {
    return match[1].trim();
  }

  return fromEmail.includes("@") ? fromEmail : null;
}

function buildContactHtml(payload: ContactFormPayload): string {
  const telefono = payload.telefono?.trim() || "No informado";
  const cargo = payload.cargo?.trim() || "No informado";

  return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nueva solicitud de contacto</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;color:#111827;">
    <div style="max-width:640px;margin:24px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
      <div style="background:#111827;color:#ffffff;padding:18px 22px;">
        <h1 style="margin:0;font-size:19px;">Nueva solicitud desde la landing de LeadBy</h1>
      </div>
      <div style="padding:22px;line-height:1.6;font-size:14px;">
        <p style="margin:0 0 10px;"><strong>Nombre:</strong> ${escapeHtml(payload.nombre)}</p>
        <p style="margin:0 0 10px;"><strong>Empresa:</strong> ${escapeHtml(payload.empresa)}</p>
        <p style="margin:0 0 10px;"><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p style="margin:0 0 10px;"><strong>Teléfono:</strong> ${escapeHtml(telefono)}</p>
        <p style="margin:0 0 14px;"><strong>Cargo / Departamento:</strong> ${escapeHtml(cargo)}</p>
        <div style="margin-top:14px;padding:14px;border-radius:10px;background:#fff8f4;border:1px solid #ffd1b5;">
          <p style="margin:0 0 8px;"><strong>Mensaje:</strong></p>
          <p style="margin:0;white-space:pre-wrap;">${escapeHtml(payload.mensaje)}</p>
        </div>
      </div>
    </div>
  </body>
</html>
  `;
}

function buildContactText(payload: ContactFormPayload): string {
  const telefono = payload.telefono?.trim() || "No informado";
  const cargo = payload.cargo?.trim() || "No informado";

  return [
    "Nueva solicitud desde la landing de LeadBy",
    "",
    `Nombre: ${payload.nombre}`,
    `Empresa: ${payload.empresa}`,
    `Email: ${payload.email}`,
    `Teléfono: ${telefono}`,
    `Cargo / Departamento: ${cargo}`,
    "",
    "Mensaje:",
    payload.mensaje,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Datos de formulario inválidos";
    return NextResponse.json({ error: firstIssue }, { status: 400 });
  }

  const payload: ContactFormPayload = {
    ...parsed.data,
    telefono: parsed.data.telefono?.trim() ?? "",
    cargo: parsed.data.cargo?.trim() ?? "",
    website: parsed.data.website?.trim() ?? "",
  };

  // Honeypot anti-spam: si llega relleno, simulamos éxito sin procesar nada.
  if (payload.website) {
    return NextResponse.json({ ok: true, message: "Solicitud recibida correctamente." });
  }

  const destinationEmail = getDestinationEmail();
  if (!destinationEmail) {
    return NextResponse.json(
      {
        error:
          "No hay destinatario configurado para el formulario. Define CONTACT_FORM_TO_EMAIL o RESEND_FROM_EMAIL.",
      },
      { status: 500 }
    );
  }

  try {
    await sendEmailViaResend({
      to: destinationEmail,
      subject: `[LeadBy] Nueva solicitud de demo - ${payload.empresa}`,
      html: buildContactHtml(payload),
      text: buildContactText(payload),
      replyTo: payload.email,
    });

    return NextResponse.json({
      ok: true,
      message: "Solicitud enviada. Te contactaremos en menos de 48 horas.",
    });
  } catch (error) {
    console.error("Error enviando formulario de contacto", error);
    return NextResponse.json(
      { error: "No se pudo enviar la solicitud en este momento. Inténtalo de nuevo." },
      { status: 502 }
    );
  }
}
