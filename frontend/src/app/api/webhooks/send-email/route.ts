import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Envío de email aprobado.
 *
 * Este es el endpoint del HUMAN-IN-THE-LOOP.
 * Solo se activa cuando el comercial ha revisado el borrador,
 * posiblemente lo ha editado, y pulsa "Confirmar y Enviar".
 *
 * Validaciones críticas antes de notificar a n8n:
 * - El lead debe estar en estado 'pendiente_aprobacion'
 * - El email_aprobado debe estar presente y no vacío
 * - El usuario debe tener acceso a la organización
 *
 * N8n luego:
 * 1. Llama a Resend para enviar el email real
 * 2. Registra el email en HubSpot CRM (Timeline)
 * 3. Actualiza leads_prospectados.estado = 'enviado'
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

  let body: {
    lead_id: string;
    organizacion_id: string;
    email_aprobado: string;
    email_asunto: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
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
      { error: "El email aprobado está vacío o es demasiado corto" },
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

  // Verificar estado del lead - DEBE estar en 'pendiente_aprobacion'
  // Esta validación previene doble-envío aunque el frontend sea manipulado
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
        error: `Estado inválido para envío: '${lead.estado}'. Solo se puede enviar desde 'pendiente_aprobacion'.`,
      },
      { status: 409 }
    );
  }

  // Guardar el email aprobado (editado por el comercial) y marcar como 'aprobado'
  const { error: updateError } = await supabase
    .from("leads_prospectados")
    .update({
      email_aprobado: email_aprobado.trim(),
      email_asunto: email_asunto.trim(),
      estado: "aprobado",
    })
    .eq("id", lead_id);

  if (updateError) {
    return NextResponse.json(
      { error: "Error actualizando el lead" },
      { status: 500 }
    );
  }

  // Notificar a n8n para que ejecute el envío real
  const webhookUrl = process.env.N8N_WEBHOOK_SEND_EMAIL_URL;
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
          email_aprobado: email_aprobado.trim(),
          email_asunto: email_asunto.trim(),
        }),
      });
    } catch (e) {
      console.error("Error notificando envío a n8n:", e);
      // El estado ya es 'aprobado'; n8n puede procesarlo cuando recupere conectividad
    }
  }

  return NextResponse.json(
    { mensaje: "Email enviado a procesar", lead_id },
    { status: 202 }
  );
}
