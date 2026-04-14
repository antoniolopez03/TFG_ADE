import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Aprobar lead para envío.
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

  // Verificar membresía
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

  // Verificar que el lead existe y está en estado aprobable
  const { data: lead } = await supabase
    .from("leads_prospectados")
    .select("id, estado")
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

  // Actualizar estado a aprobado
  const { error: updateError } = await supabase
    .from("leads_prospectados")
    .update({ estado: "aprobado" })
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
    },
    { status: 202 }
  );
}
