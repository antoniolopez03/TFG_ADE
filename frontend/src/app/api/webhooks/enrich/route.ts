import {
  generateProspectEmailDraft,
  type TenantIaPreferences,
} from "@/lib/services/gemini";
import { createClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

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
 * API Route: Trigger de enriquecimiento con IA.
 * Genera asunto + borrador con Gemini para un lead en estado nuevo o pendiente_aprobacion.
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

  let body: { lead_id: string; organizacion_id: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { lead_id, organizacion_id } = body;

  if (!lead_id || !organizacion_id) {
    return NextResponse.json(
      { error: "Faltan campos: lead_id, organizacion_id" },
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

  const { data: config } = await supabase
    .from("configuracion_tenant")
    .select("preferencias_ia")
    .eq("organizacion_id", organizacion_id)
    .maybeSingle();

  const preferenciasIa = (config?.preferencias_ia ?? null) as TenantIaPreferences | null;

  const { data: lead } = await supabase
    .from("leads")
    .select(
      `
      id,
      estado,
      metadata,
      empresa_nombre,
      empresa_sector,
      empresa_ciudad,
      empresa_pais,
      empresa_dominio,
      empresa_linkedin_url,
      empresa_descripcion,
      contacto_nombre_completo,
      contacto_cargo,
      contacto_email,
      contacto_linkedin_url,
      contacto_departamento
    `
    )
    .eq("id", lead_id)
    .eq("organizacion_id", organizacion_id)
    .single();

  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  if (lead.estado !== "nuevo" && lead.estado !== "pendiente_aprobacion") {
    return NextResponse.json(
      { error: `No se puede enriquecer un lead con estado '${lead.estado}'` },
      { status: 409 }
    );
  }

  if (!lead.empresa_nombre) {
    return NextResponse.json(
      { error: "El lead no tiene empresa vinculada para enriquecer el email" },
      { status: 409 }
    );
  }

  const contactoNombre = splitFullName(lead.contacto_nombre_completo);

  const draft = await generateProspectEmailDraft({
    empresa: {
      nombre: lead.empresa_nombre,
      sector: lead.empresa_sector,
      ciudad: lead.empresa_ciudad,
      pais: lead.empresa_pais,
      dominio: lead.empresa_dominio,
      linkedinUrl: lead.empresa_linkedin_url,
      tecnologias: null,
      descripcion: lead.empresa_descripcion,
    },
    contacto:
      lead.contacto_nombre_completo || lead.contacto_email || lead.contacto_cargo
        ? {
            nombre: contactoNombre.nombre,
            apellidos: contactoNombre.apellidos,
            cargo: lead.contacto_cargo,
            email: lead.contacto_email,
            linkedinUrl: lead.contacto_linkedin_url,
            seniority: null,
            departamento: lead.contacto_departamento,
          }
        : null,
    preferenciasIa,
    maxWords: 150,
  });

  const metadataActual = toRecord(lead.metadata);
  const { error: updateError } = await supabase
    .from("leads")
    .update({
      estado: "pendiente_aprobacion",
      email_borrador: draft.body,
      email_asunto: draft.subject,
      metadata: {
        ...metadataActual,
        enrich: {
          fallback_used: draft.fallbackUsed,
          word_count: draft.wordCount,
          generated_at: new Date().toISOString(),
        },
      },
    })
    .eq("id", lead_id)
    .eq("organizacion_id", organizacion_id);

  if (updateError) {
    return NextResponse.json(
      { error: `No se pudo guardar el borrador generado: ${updateError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      mensaje: "Borrador generado correctamente",
      lead_id,
      word_count: draft.wordCount,
      fallback_used: draft.fallbackUsed,
      email_asunto: draft.subject,
      email_borrador: draft.body,
    },
    { status: 200 }
  );
}
