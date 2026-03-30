import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Trigger de enriquecimiento con IA.
 *
 * Cuando el usuario aprueba un lead en la Bandeja de Leads,
 * este endpoint notifica a n8n para que:
 * 1. Llame a Apollo.io (si el contacto no tiene email verificado)
 * 2. Scrape la web de la empresa
 * 3. Pida a Google Gemini que redacte el email de prospección
 * 4. Guarde el borrador en leads_prospectados.email_borrador
 * 5. Actualice el estado a 'pendiente_aprobacion'
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

  // Marcar como 'enriqueciendo' para que el frontend muestre el estado correcto
  await supabase
    .from("leads_prospectados")
    .update({ estado: "enriqueciendo" })
    .eq("id", lead_id);

  // Notificar a n8n
  const webhookUrl = process.env.N8N_WEBHOOK_ENRICH_URL;
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
      console.error("Error notificando enriquecimiento a n8n:", e);
    }
  }

  return NextResponse.json(
    { mensaje: "Enriquecimiento iniciado", lead_id },
    { status: 202 }
  );
}
