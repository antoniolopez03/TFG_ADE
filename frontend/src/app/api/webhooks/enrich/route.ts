import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Trigger de enriquecimiento con IA.
 *
 * Endpoint reservado para el flujo de enriquecimiento con Gemini.
 * La integración real se implementará en la Fase 3.
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

  // Verificar que el lead pertenece a la organización del usuario (RLS lo haría también,
  // pero validamos aquí para devolver errores HTTP descriptivos)
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

  // Verificar que el lead existe y está en estado 'nuevo'
  const { data: lead } = await supabase
    .from("leads_prospectados")
    .select("id, estado")
    .eq("id", lead_id)
    .eq("organizacion_id", organizacion_id)
    .single();

  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  if (!["nuevo", "enriqueciendo"].includes(lead.estado)) {
    return NextResponse.json(
      { error: `No se puede enriquecer un lead con estado '${lead.estado}'` },
      { status: 409 }
    );
  }

  return NextResponse.json(
    {
      error:
        "El enriquecimiento automático aún no está disponible. Se habilitará al integrar Gemini en la Fase 3.",
      lead_id,
    },
    { status: 501 }
  );
}
