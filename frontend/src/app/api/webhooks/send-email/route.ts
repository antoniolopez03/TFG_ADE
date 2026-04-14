import { createHubSpotEmailEngagement, getHubSpotTokenFromVault } from "@/lib/services/hubspot";
import { sendEmailViaResend } from "@/lib/services/resend";
import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Envio de email aprobado.
 *
 * Este es el endpoint del HUMAN-IN-THE-LOOP.
 * Solo se activa cuando el comercial ha revisado el borrador,
 * posiblemente lo ha editado, y pulsa "Confirmar y Enviar".
 *
 * Validaciones criticas antes de ejecutar el envio real:
 * - El lead debe estar en estado 'aprobado'
 * - El email_aprobado debe estar presente y no vacio
 * - El usuario debe tener acceso a la organizacion
 */

type MaybeArray<T> = T | T[] | null | undefined;

function normalizeOne<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toSimpleHtmlEmail(text: string): string {
  const sanitized = escapeHtml(text.trim());
  const paragraphs = sanitized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, "<br />"))
    .filter((paragraph) => paragraph.trim().length > 0)
    .map((paragraph) => `<p style=\"margin:0 0 14px;\">${paragraph}</p>`)
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; font-size: 15px;">
      ${paragraphs}
      <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">
        Si prefieres no recibir mas comunicaciones, responde a este correo indicando "baja".
      </p>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: {
    lead_id: string;
    organizacion_id: string;
    email_aprobado: string;
    email_asunto: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalido" }, { status: 400 });
  }

  const { lead_id, organizacion_id, email_aprobado, email_asunto } = body;

  if (!lead_id || !organizacion_id || !email_aprobado || !email_asunto) {
    return NextResponse.json(
      { error: "Faltan campos: lead_id, organizacion_id, email_aprobado, email_asunto" },
      { status: 400 }
    );
  }

  if (email_aprobado.trim().length < 10) {
    return NextResponse.json(
      { error: "El email aprobado esta vacio o es demasiado corto" },
      { status: 400 }
    );
  }

  // Verificar membresia
  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("id")
    .eq("user_id", user.id)
    .eq("organizacion_id", organizacion_id)
    .eq("activo", true)
    .single();

  if (!membresia) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  // Verificar estado del lead - DEBE estar en 'aprobado'.
  // Esta validacion previene doble-envio aunque el frontend sea manipulado.
  const { data: lead } = await supabase
    .from("leads_prospectados")
    .select(
      `
      id,
      estado,
      metadata,
      hubspot_contact_id,
      global_contactos (email, nombre, apellidos)
    `
    )
    .eq("id", lead_id)
    .eq("organizacion_id", organizacion_id)
    .single();

  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  if (lead.estado !== "aprobado") {
    return NextResponse.json(
      {
        error: `Estado invalido para envio: '${lead.estado}'. Solo se puede enviar desde 'aprobado'.`,
      },
      { status: 409 }
    );
  }

  const contacto = normalizeOne(lead.global_contactos as MaybeArray<Record<string, unknown>>);
  const contactoEmail = typeof contacto?.email === "string" ? contacto.email.trim() : "";

  if (!contactoEmail) {
    return NextResponse.json(
      { error: "El lead no tiene email de contacto para poder enviar." },
      { status: 409 }
    );
  }

  const hubSpotContactId =
    typeof lead.hubspot_contact_id === "string" ? lead.hubspot_contact_id.trim() : "";

  if (!hubSpotContactId) {
    return NextResponse.json(
      { error: "El lead no tiene hubspot_contact_id. Aprueba y sincroniza de nuevo antes de enviar." },
      { status: 409 }
    );
  }

  const serviceClient = createServiceClient();
  let hubSpotToken: string | null = null;

  try {
    hubSpotToken = await getHubSpotTokenFromVault(serviceClient, organizacion_id);
  } catch (error) {
    console.error("Error recuperando token HubSpot desde Vault", error);
    return NextResponse.json(
      { error: "No se pudo recuperar el token de HubSpot desde Vault." },
      { status: 500 }
    );
  }

  if (!hubSpotToken) {
    return NextResponse.json(
      { error: "No hay token HubSpot configurado para esta organizacion." },
      { status: 409 }
    );
  }

  let resendMessageId = "";

  try {
    const resendResult = await sendEmailViaResend({
      to: contactoEmail,
      subject: email_asunto.trim(),
      html: toSimpleHtmlEmail(email_aprobado),
      text: email_aprobado.trim(),
    });

    resendMessageId = resendResult.id;
  } catch (error) {
    console.error("Error enviando email con Resend", error);
    return NextResponse.json(
      { error: "No se pudo enviar el email via Resend." },
      { status: 502 }
    );
  }

  let timelineSyncOk = true;
  let timelineSyncError: string | null = null;
  let hubSpotEngagementId: string | null = null;

  try {
    const engagement = await createHubSpotEmailEngagement({
      accessToken: hubSpotToken,
      contactId: hubSpotContactId,
      subject: email_asunto.trim(),
      body: email_aprobado.trim(),
      recipientEmail: contactoEmail,
      sentAt: new Date().toISOString(),
    });

    hubSpotEngagementId = engagement.id;
  } catch (error) {
    timelineSyncOk = false;
    timelineSyncError = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error registrando timeline en HubSpot", error);
  }

  const metadataActual = toRecord(lead.metadata);
  const metadataHubSpot = toRecord(metadataActual.hubspot_sync);
  const metadataSendEmail = toRecord(metadataActual.send_email);

  const { error: updateError } = await supabase
    .from("leads_prospectados")
    .update({
      estado: "enviado",
      email_aprobado: email_aprobado.trim(),
      email_asunto: email_asunto.trim(),
      email_enviado_at: new Date().toISOString(),
      resend_message_id: resendMessageId,
      metadata: {
        ...metadataActual,
        send_email: {
          ...metadataSendEmail,
          sent_at: new Date().toISOString(),
          resend_message_id: resendMessageId,
        },
        hubspot_sync: {
          ...metadataHubSpot,
          timeline_synced: timelineSyncOk,
          timeline_error: timelineSyncError,
          timeline_engagement_id: hubSpotEngagementId,
          timeline_synced_at: new Date().toISOString(),
        },
      },
    })
    .eq("id", lead_id)
    .eq("organizacion_id", organizacion_id);

  if (updateError) {
    return NextResponse.json(
      { error: "El correo se envio pero no se pudo actualizar el estado del lead." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message: timelineSyncOk
        ? "Email enviado y registrado en HubSpot correctamente."
        : "Email enviado. HubSpot timeline no pudo registrarse en este intento.",
      lead_id,
      organizacion_id,
      resend_message_id: resendMessageId,
      hubspot_timeline_synced: timelineSyncOk,
      hubspot_engagement_id: hubSpotEngagementId,
      hubspot_timeline_error: timelineSyncError,
    },
    { status: 202 }
  );
}

