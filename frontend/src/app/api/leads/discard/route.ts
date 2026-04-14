import { createClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

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
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
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

  const { error: updateError } = await supabase
    .from("leads_prospectados")
    .update({ estado: "descartado" })
    .eq("id", lead_id)
    .eq("organizacion_id", organizacion_id);

  if (updateError) {
    return NextResponse.json({ error: "Error actualizando el lead" }, { status: 500 });
  }

  return NextResponse.json({ mensaje: "Lead descartado", lead_id });
}

