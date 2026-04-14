import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Envío de email aprobado.
 *
 * Este es el endpoint del HUMAN-IN-THE-LOOP.
 * Solo se activa cuando el comercial ha revisado el borrador,
 * posiblemente lo ha editado, y pulsa "Confirmar y Enviar".
 *
 * Validaciones críticas antes de ejecutar el envío real:
 * - El lead debe estar en estado 'aprobado'
 * - El email_aprobado debe estar presente y no vacío
 * - El usuario debe tener acceso a la organización
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

  // Verificar estado del lead - DEBE estar en 'aprobado'
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

  if (lead.estado !== "aprobado") {
    return NextResponse.json(
      {
        error: `Estado inválido para envío: '${lead.estado}'. Solo se puede enviar desde 'aprobado'.`,
      },
      { status: 409 }
    );
  }

  return NextResponse.json(
    {
      error:
        "El envío automático aún no está disponible. Se habilitará al integrar Resend y HubSpot en la Fase 5.",
      lead_id,
      organizacion_id,
      preview: {
        email_aprobado: email_aprobado.trim(),
        email_asunto: email_asunto.trim(),
      },
    },
    { status: 501 }
  );
}
