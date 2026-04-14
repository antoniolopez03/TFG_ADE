import {
  generateProspectEmailDraft,
  type TenantIaPreferences,
} from "@/lib/services/gemini";
import { createClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Trigger de enriquecimiento con IA.
 * Genera asunto + borrador con Gemini para un lead en pendiente_aprobacion.
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
    return NextResponse.json({ error: "Body JSON invÃ¡lido" }, { status: 400 });
  }

  const { lead_id, organizacion_id } = body;

  if (!lead_id || !organizacion_id) {
    return NextResponse.json(
      { error: "Faltan campos: lead_id, organizacion_id" },
      { status: 400 }
    );
  }

  // Verificar que el lead pertenece a la organizaciÃ³n del usuario (RLS lo harÃ­a tambiÃ©n,
  // pero validamos aquÃ­ para devolver errores HTTP descriptivos)
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

  function normalizeOne<T>(value: T | T[] | null | undefined): T | null {
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

  // Verificar que el lead existe y estÃ¡ pendiente de aprobaciÃ³n
  const { data: lead } = await supabase
    .from("leads_prospectados")
    .select(
      `
      id,
      estado,
      metadata,
      global_empresas (nombre, sector, ciudad, pais, dominio, linkedin_url, tecnologias, descripcion),
      global_contactos (nombre, apellidos, cargo, email, linkedin_url, seniority, departamento)
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
      { error: `No se puede enriquecer un lead con estado '${lead.estado}'` },
      { status: 409 }
    );
  }

  const empresa = normalizeOne(lead.global_empresas);
  if (!empresa) {
    return NextResponse.json(
      { error: "El lead no tiene empresa vinculada para enriquecer el email" },
      { status: 409 }
    );
  }

  const contacto = normalizeOne(lead.global_contactos);
  const draft = await generateProspectEmailDraft({
    empresa: {
      nombre: empresa.nombre ?? "Empresa sin nombre",
      sector: empresa.sector,
      ciudad: empresa.ciudad,
      pais: empresa.pais,
      dominio: empresa.dominio,
      linkedinUrl: empresa.linkedin_url,
      tecnologias: Array.isArray(empresa.tecnologias)
        ? empresa.tecnologias.filter((item): item is string => typeof item === "string")
        : null,
      descripcion: empresa.descripcion,
    },
    contacto: contacto
      ? {
          nombre: contacto.nombre,
          apellidos: contacto.apellidos,
          cargo: contacto.cargo,
          email: contacto.email,
          linkedinUrl: contacto.linkedin_url,
          seniority: contacto.seniority,
          departamento: contacto.departamento,
        }
      : null,
    preferenciasIa,
    maxWords: 150,
  });

  const metadataActual = toRecord(lead.metadata);
  const { error: updateError } = await supabase
    .from("leads_prospectados")
    .update({
      borrador_email: draft.body,
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
    },
    { status: 200 }
  );
}

