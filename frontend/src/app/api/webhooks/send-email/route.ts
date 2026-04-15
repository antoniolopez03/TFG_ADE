import {
  createHubSpotDeal,
  createHubSpotEmailEngagement,
  createOrUpdateHubSpotCompany,
  createOrUpdateHubSpotContact,
  getHubSpotTokenFromVault,
} from "@/lib/services/hubspot";
import { buildLeadByEmailHtml } from "@/lib/services/email-template";
import { sendEmailViaResend } from "@/lib/services/resend";
import { createUnsubscribeToken } from "@/lib/services/unsubscribe";
import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Envio de email revisado.
 *
 * Este es el endpoint del HUMAN-IN-THE-LOOP.
 * Solo se activa cuando el comercial ha revisado el borrador,
 * posiblemente lo ha editado, y pulsa "Confirmar y Enviar".
 *
 * Validaciones criticas antes de ejecutar el envio real:
 * - El lead debe estar en estado 'pendiente_aprobacion' (o 'aprobado' legacy)
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

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
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
      hubspot_deal_id,
      global_contactos (email, nombre, apellidos, cargo, telefono, departamento),
      global_empresas (nombre, dominio, sector, ciudad, pais, telefono, descripcion)
    `
    )
    .eq("id", lead_id)
    .eq("organizacion_id", organizacion_id)
    .single();

  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  if (lead.estado !== "pendiente_aprobacion" && lead.estado !== "aprobado") {
    return NextResponse.json(
      {
        error:
          `Estado invalido para envio: '${lead.estado}'. ` +
          "Solo se puede enviar desde 'pendiente_aprobacion'.",
      },
      { status: 409 }
    );
  }

  const contacto = normalizeOne(lead.global_contactos as MaybeArray<Record<string, unknown>>);
  const empresa = normalizeOne(lead.global_empresas as MaybeArray<Record<string, unknown>>);

  const contactoEmail = typeof contacto?.email === "string" ? normalizeEmail(contacto.email) : "";

  if (!contactoEmail) {
    return NextResponse.json(
      { error: "El lead no tiene email de contacto para poder enviar." },
      { status: 409 }
    );
  }

  const serviceClient = createServiceClient();

  const { data: optOutData, error: optOutError } = await serviceClient
    .from("email_opt_outs")
    .select("id, unsubscribed_at")
    .eq("organizacion_id", organizacion_id)
    .eq("email", contactoEmail)
    .maybeSingle();

  if (optOutError) {
    return NextResponse.json(
      {
        error:
          "No se pudo verificar el estado de baja RGPD. Ejecuta el script database/05_email_opt_outs.sql y reintenta.",
      },
      { status: 500 }
    );
  }

  if (optOutData) {
    return NextResponse.json(
      {
        error: "Este contacto ya se dio de baja y no puede recibir mas comunicaciones.",
      },
      { status: 409 }
    );
  }

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

  let hubSpotContactId =
    typeof lead.hubspot_contact_id === "string" ? lead.hubspot_contact_id.trim() : "";
  let hubSpotDealId =
    typeof lead.hubspot_deal_id === "string" ? lead.hubspot_deal_id.trim() : "";
  let hubSpotCompanyId = "";

  if (!hubSpotContactId) {
    if (!empresa || !contacto) {
      return NextResponse.json(
        {
          error:
            "No se puede sincronizar el lead con HubSpot porque faltan datos de empresa o contacto.",
        },
        { status: 409 }
      );
    }

    try {
      const company = await createOrUpdateHubSpotCompany({
        accessToken: hubSpotToken,
        empresa: {
          nombre: typeof empresa.nombre === "string" ? empresa.nombre : null,
          dominio: typeof empresa.dominio === "string" ? empresa.dominio : null,
          sector: typeof empresa.sector === "string" ? empresa.sector : null,
          ciudad: typeof empresa.ciudad === "string" ? empresa.ciudad : null,
          pais: typeof empresa.pais === "string" ? empresa.pais : null,
          telefono: typeof empresa.telefono === "string" ? empresa.telefono : null,
          descripcion: typeof empresa.descripcion === "string" ? empresa.descripcion : null,
        },
      });

      const contact = await createOrUpdateHubSpotContact({
        accessToken: hubSpotToken,
        companyId: company.id,
        contacto: {
          nombre: typeof contacto.nombre === "string" ? contacto.nombre : null,
          apellidos: typeof contacto.apellidos === "string" ? contacto.apellidos : null,
          email: typeof contacto.email === "string" ? contacto.email : null,
          cargo: typeof contacto.cargo === "string" ? contacto.cargo : null,
          telefono: typeof contacto.telefono === "string" ? contacto.telefono : null,
          departamento: typeof contacto.departamento === "string" ? contacto.departamento : null,
        },
      });

      const companyName =
        (typeof empresa.nombre === "string" && empresa.nombre.trim()) ||
        (typeof empresa.dominio === "string" && empresa.dominio.trim()) ||
        "Empresa";

      const contactName =
        [contacto.nombre, contacto.apellidos]
          .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
          .join(" ") || "Contacto";

      const deal = await createHubSpotDeal({
        accessToken: hubSpotToken,
        companyId: company.id,
        contactId: contact.id,
        dealName: `LeadBy: ${companyName} - ${contactName}`,
      });

      hubSpotCompanyId = company.id;
      hubSpotContactId = contact.id;
      hubSpotDealId = deal.id;
    } catch (hubspotError) {
      console.error("Error sincronizando lead con HubSpot antes del envio", hubspotError);
      return NextResponse.json(
        {
          error:
            "No se pudo sincronizar el lead con HubSpot antes del envio. Revisa credenciales y permisos.",
        },
        { status: 502 }
      );
    }
  }

  let resendMessageId = "";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(request.url).origin;
  const appBaseUrl = appUrl.replace(/\/$/, "");

  let unsubscribeToken = "";
  try {
    unsubscribeToken = createUnsubscribeToken({
      orgId: organizacion_id,
      leadId: lead_id,
      email: contactoEmail,
    });
  } catch {
    return NextResponse.json(
      { error: "Falta configurar EMAIL_UNSUBSCRIBE_SECRET para habilitar el opt-out RGPD." },
      { status: 500 }
    );
  }

  const unsubscribeUrl = `${appBaseUrl}/api/webhooks/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

  try {
    const resendResult = await sendEmailViaResend({
      to: contactoEmail,
      subject: email_asunto.trim(),
      html: buildLeadByEmailHtml({
        bodyText: email_aprobado,
        unsubscribeUrl,
        recipientName:
          [contacto?.nombre, contacto?.apellidos]
            .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
            .join(" ") || null,
        companyName: typeof empresa?.nombre === "string" ? empresa.nombre : null,
      }),
      text: `${email_aprobado.trim()}\n\nBaja: ${unsubscribeUrl}`,
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
      hubspot_contact_id: hubSpotContactId,
      hubspot_deal_id: hubSpotDealId || null,
      metadata: {
        ...metadataActual,
        send_email: {
          ...metadataSendEmail,
          sent_at: new Date().toISOString(),
          resend_message_id: resendMessageId,
          unsubscribe_url: unsubscribeUrl,
          email_to: contactoEmail,
        },
        hubspot_sync: {
          ...metadataHubSpot,
          ...(hubSpotCompanyId ? { company_id: hubSpotCompanyId } : {}),
          ...(hubSpotContactId ? { contact_id: hubSpotContactId } : {}),
          ...(hubSpotDealId ? { deal_id: hubSpotDealId } : {}),
          ...(hubSpotCompanyId || hubSpotDealId ? { synced_at: new Date().toISOString() } : {}),
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

