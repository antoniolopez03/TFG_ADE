import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Prospección IA Lookalike.
 * Consulta HubSpot, infiere el ICP con Gemini y lanza búsqueda automática.
 */
export async function POST(_request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Obtener organización del usuario
  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  if (!membresia) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_LOOKALIKE_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    return NextResponse.json(
      { error: "Servicio de prospección IA no configurado" },
      { status: 503 }
    );
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": webhookSecret,
      },
      body: JSON.stringify({
        organizacion_id: membresia.organizacion_id,
        user_id: user.id,
      }),
    });
  } catch (e) {
    console.error("Error llamando webhook lookalike:", e);
    return NextResponse.json(
      { error: "Error al iniciar el análisis" },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { mensaje: "Análisis iniciado. Los leads aparecerán en tu bandeja en unos minutos." },
    { status: 202 }
  );
}
