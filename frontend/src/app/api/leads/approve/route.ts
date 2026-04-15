import {
  createHubSpotDeal,
  createOrUpdateHubSpotCompany,
  createOrUpdateHubSpotContact,
  getHubSpotTokenFromVault,
} from "@/lib/services/hubspot";
import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

type MaybeArray<T> = T | T[] | null | undefined;

interface ApproveLeadBody {
  lead_id?: unknown;
  organizacion_id?: unknown;
  email_aprobado?: unknown;
  email_asunto?: unknown;
}

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

/**
 * API Route: Aprobar lead para envÃ­o.
 *
 * Transiciona el lead de 'pendiente_aprobacion' a 'aprobado'.
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: ApproveLeadBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invÃ¡lido" }, { status: 400 });
  }

  const lead_id = typeof body.lead_id === "string" ? body.lead_id : "";
  const organizacion_id =
    typeof body.organizacion_id === "string" ? body.organizacion_id : "";
  const emailAprobadoNormalizado =
    typeof body.email_aprobado === "string" ? body.email_aprobado.trim() : null;
  const emailAsuntoNormalizado =
    typeof body.email_asunto === "string" ? body.email_asunto.trim() : null;

  if (!lead_id || !organizacion_id) {
    return NextResponse.json(
      { error: "Faltan campos: lead_id, organizacion_id" },
      { status: 400 }
    );
  }

  if (typeof body.email_aprobado === "string" && !emailAprobadoNormalizado) {
    return NextResponse.json(
      { error: "email_aprobado no puede estar vacÃ­o" },
      { status: 400 }
    );
  }

  if (typeof body.email_asunto === "string" && !emailAsuntoNormalizado) {
    return NextResponse.json(
      { error: "email_asunto no puede estar vacÃ­o" },
      { status: 400 }
    );
  }

  // Verificar membresÃ­a
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

  // Verificar que el lead existe y estÃ¡ en estado aprobable
  const { data: lead } = await supabase
    .from("leads_prospectados")
    .select(
      `
      id,
      estado,
      metadata,
      global_empresas (nombre, dominio, sector, ciudad, pais, telefono, descripcion),
      global_contactos (nombre, apellidos, email, cargo, telefono, departamento)
    `
    )
    .eq("id", lead_id)
    .eq("organizacion_id", organizacion_id)
    .single();

  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  if (lead.estado !== "pendiente_aprobacion") {
    return NextResponse.json(
      {
        error: `Estado invÃ¡lido: '${lead.estado}'. Solo se puede aprobar desde 'pendiente_aprobacion'.`,
      },
      { status: 409 }
    );
  }

  const empresa = normalizeOne(lead.global_empresas as MaybeArray<Record<string, unknown>>);
  if (!empresa) {
    return NextResponse.json(
      { error: "El lead no tiene empresa vinculada para sincronizar con HubSpot." },
      { status: 409 }
    );
  }

  const contacto = normalizeOne(lead.global_contactos as MaybeArray<Record<string, unknown>>);
  if (!contacto) {
    return NextResponse.json(
      { error: "El lead no tiene contacto vinculado para sincronizar con HubSpot." },
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
      { error: "No hay token HubSpot configurado para esta organizaciÃ³n." },
      { status: 409 }
    );
  }

  let hubSpotCompanyId = "";
  let hubSpotContactId = "";
  let hubSpotDealId = "";

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
        departamento:
          typeof contacto.departamento === "string" ? contacto.departamento : null,
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
    console.error("Error sincronizando lead aprobado con HubSpot", hubspotError);
    return NextResponse.json(
      {
        error:
          "No se pudo sincronizar el lead con HubSpot. Revisa el token, permisos y configuraciÃ³n del CRM.",
      },
      { status: 502 }
    );
  }

  // Actualizar estado a aprobado
  const metadataActual = toRecord(lead.metadata);
  const metadataHubSpot = toRecord(metadataActual.hubspot_sync);
  const payloadActualizacion: Record<string, unknown> = {
    estado: "aprobado",
    hubspot_contact_id: hubSpotContactId,
    hubspot_deal_id: hubSpotDealId,
    metadata: {
      ...metadataActual,
      hubspot_sync: {
        ...metadataHubSpot,
        company_id: hubSpotCompanyId,
        contact_id: hubSpotContactId,
        deal_id: hubSpotDealId,
        synced_at: new Date().toISOString(),
      },
    },
  };

  if (emailAprobadoNormalizado) {
    payloadActualizacion.email_aprobado = emailAprobadoNormalizado;
    payloadActualizacion.borrador_email = emailAprobadoNormalizado;
  }

  if (emailAsuntoNormalizado) {
    payloadActualizacion.email_asunto = emailAsuntoNormalizado;
  }

  const { error: updateError } = await supabase
    .from("leads_prospectados")
    .update(payloadActualizacion)
    .eq("id", lead_id);

  if (updateError) {
    return NextResponse.json(
      { error: "Error actualizando el lead" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      mensaje: "Lead aprobado correctamente.",
      lead_id,
      email_aprobado: emailAprobadoNormalizado,
      email_asunto: emailAsuntoNormalizado,
    },
    { status: 202 }
  );
}

