import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Búsqueda manual de prospectos.
 * Recibe sector, ubicacion y tamano, obtiene el organizacion_id del usuario
 * y dispara el webhook de n8n para iniciar la búsqueda.
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

  let body: { sector: string; ubicacion: string; tamano: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { sector, ubicacion, tamano } = body;

  if (!sector || !ubicacion || !tamano) {
    return NextResponse.json(
      { error: "Faltan campos: sector, ubicacion, tamano" },
      { status: 400 }
    );
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

  const webhookUrl = process.env.N8N_WEBHOOK_PROSPECTING_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    return NextResponse.json(
      { error: "Servicio de prospección no configurado" },
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
        sector,
        ubicacion,
        tamano,
        organizacion_id: membresia.organizacion_id,
        user_id: user.id,
      }),
    });
  } catch (e) {
    console.error("Error llamando webhook de prospección:", e);
    return NextResponse.json(
      { error: "Error al iniciar la búsqueda" },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { mensaje: "Búsqueda iniciada. Los leads aparecerán en tu bandeja en unos minutos." },
    { status: 202 }
  );
}
