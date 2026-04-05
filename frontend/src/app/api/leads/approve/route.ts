import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Aprobar lead para generación de borrador.
 *
 * Transiciona el lead de 'nuevo'/'enriqueciendo' a 'pendiente_aprobacion'
 * y dispara el webhook de n8n para que Gemini genere el borrador de email.
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

  if (lead.estado !== "nuevo" && lead.estado !== "enriqueciendo") {
    return NextResponse.json(
      {
        error: `Estado inválido: '${lead.estado}'. Solo se puede aprobar desde 'nuevo' o 'enriqueciendo'.`,
      },
      { status: 409 }
    );
  }

  // Actualizar estado a pendiente_aprobacion
  const { error: updateError } = await supabase
    .from("leads_prospectados")
    .update({ estado: "pendiente_aprobacion" })
    .eq("id", lead_id);

  if (updateError) {
    return NextResponse.json(
      { error: "Error actualizando el lead" },
      { status: 500 }
    );
  }

  // Notificar a n8n para que genere el borrador con Gemini
  const webhookUrl = process.env.N8N_WEBHOOK_APPROVE_LEAD_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  if (webhookUrl && webhookSecret) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": webhookSecret,
        },
        body: JSON.stringify({
          lead_id,
          organizacion_id,
          user_id: user.id,
        }),
      });
    } catch (e) {
      console.error("Error notificando aprobación a n8n:", e);
      // El estado ya es 'pendiente_aprobacion'; n8n puede procesarlo cuando recupere conectividad
    }
  }

  return NextResponse.json(
    { mensaje: "Lead aprobado, generando borrador", lead_id },
    { status: 202 }
  );
}
