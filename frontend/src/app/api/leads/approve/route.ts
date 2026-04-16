import {
  createHubSpotDeal,
  createOrUpdateHubSpotCompany,
  createOrUpdateHubSpotContact,
  getHubSpotTokenFromVault,
} from "@/lib/services/hubspot";
import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

interface ApproveLeadBody {
  lead_id?: unknown;
  organizacion_id?: unknown;
  email_aprobado?: unknown;
  email_asunto?: unknown;
}

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function splitFullName(fullName: string | null): { nombre: string | null; apellidos: string | null } {
  if (!fullName || fullName.trim().length === 0) {
    return { nombre: null, apellidos: null };
  }

  const parts = fullName.trim().split(" ").filter(Boolean);
  if (parts.length === 0) {
    return { nombre: null, apellidos: null };
  }

  if (parts.length === 1) {
    return { nombre: parts[0], apellidos: null };
  }

  return {
    nombre: parts[0],
    apellidos: parts.slice(1).join(" "),
  };
}

/**
 * API Route: Aprobar lead para envío.
 * Transiciona el lead de pendiente_aprobacion a aprobado y sincroniza Company/Contact/Deal en HubSpot.
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
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
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
      { error: "email_aprobado no puede estar vacío" },
      { status: 400 }
    );
  }

  if (typeof body.email_asunto === "string" && !emailAsuntoNormalizado) {
    return NextResponse.json(
      { error: "email_asunto no puede estar vacío" },
      { status: 400 }
    );
  }

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

  const { data: lead } = await supabase
    .from("leads")
    .select(
      `
      id,
      estado,
      metadata,
      empresa_nombre,
      empresa_dominio,
      empresa_sector,
      empresa_ciudad,
      empresa_pais,
      empresa_telefono,
      empresa_descripcion,
      contacto_nombre_completo,
      contacto_email,
      contacto_cargo,
      contacto_telefono,
      contacto_departamento,
      contacto_linkedin_url
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
        error: `Estado inválido: '${lead.estado}'. Solo se puede aprobar desde 'pendiente_aprobacion'.`,
      },
      { status: 409 }
    );
  }

  if (!lead.empresa_nombre) {
    return NextResponse.json(
      { error: "El lead no tiene empresa para sincronizar con HubSpot." },
      { status: 409 }
    );
  }

  if (!lead.contacto_nombre_completo && !lead.contacto_email) {
    return NextResponse.json(
      { error: "El lead no tiene contacto para sincronizar con HubSpot." },
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
      { error: "No hay token HubSpot configurado para esta organización." },
      { status: 409 }
    );
  }

  const nombreContacto = splitFullName(lead.contacto_nombre_completo);

  let hubSpotCompanyId = "";
  let hubSpotContactId = "";
  let hubSpotDealId = "";

  try {
    const company = await createOrUpdateHubSpotCompany({
      accessToken: hubSpotToken,
      empresa: {
        nombre: lead.empresa_nombre,
        dominio: lead.empresa_dominio,
        sector: lead.empresa_sector,
        ciudad: lead.empresa_ciudad,
        pais: lead.empresa_pais,
        telefono: lead.empresa_telefono,
        descripcion: lead.empresa_descripcion,
      },
    });

    const contact = await createOrUpdateHubSpotContact({
      accessToken: hubSpotToken,
      companyId: company.id,
      contacto: {
        nombre: nombreContacto.nombre,
        apellidos: nombreContacto.apellidos,
        email: lead.contacto_email,
        cargo: lead.contacto_cargo,
        telefono: lead.contacto_telefono,
        departamento: lead.contacto_departamento,
        linkedinUrl: lead.contacto_linkedin_url,
      },
    });

    const companyName = lead.empresa_nombre || lead.empresa_dominio || "Empresa";

    const contactName =
      lead.contacto_nombre_completo || lead.contacto_email || "Contacto";

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
          "No se pudo sincronizar el lead con HubSpot. Revisa el token, permisos y configuración del CRM.",
      },
      { status: 502 }
    );
  }

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
    payloadActualizacion.email_borrador = emailAprobadoNormalizado;
  }

  if (emailAsuntoNormalizado) {
    payloadActualizacion.email_asunto = emailAsuntoNormalizado;
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update(payloadActualizacion)
    .eq("id", lead_id)
    .eq("organizacion_id", organizacion_id);

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
