import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Trigger de scraping.
 *
 * Actúa como proxy seguro entre el frontend y n8n.
 * El frontend NUNCA llama a n8n directamente (mantiene el webhook secret server-side).
 *
 * Flujo:
 * 1. Verificar sesión de usuario con Supabase
 * 2. Verificar que el usuario pertenece a la organización solicitada
 * 3. Crear registro en trabajos_scraping (para polling del frontend)
 * 4. Notificar a n8n con el webhook secret
 */
export async function POST(request: NextRequest) {
  // 1. Verificar autenticación
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // 2. Parsear y validar el body
  let body: {
    organizacion_id: string;
    tipo: "google_maps" | "google_dorks";
    query?: string;
    location?: string;
    dork_query?: string;
    max_results?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { organizacion_id, tipo, query, location, dork_query, max_results = 20 } = body;

  if (!organizacion_id || !tipo) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: organizacion_id, tipo" },
      { status: 400 }
    );
  }

  // 3. Verificar que el usuario pertenece a la organización (autorización)
  const { data: membresia, error: membresiaError } = await supabase
    .from("miembros_equipo")
    .select("id, rol")
    .eq("user_id", user.id)
    .eq("organizacion_id", organizacion_id)
    .eq("activo", true)
    .single();

  if (membresiaError || !membresia) {
    return NextResponse.json(
      { error: "No tienes acceso a esta organización" },
      { status: 403 }
    );
  }

  // 4. Crear registro del job en Supabase para que el frontend pueda hacer polling
  const parametros =
    tipo === "google_maps"
      ? { query, location, max_results }
      : { dork_query, max_results };

  const { data: job, error: jobError } = await supabase
    .from("trabajos_scraping")
    .insert({
      organizacion_id,
      tipo,
      parametros,
      estado: "pendiente",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (jobError || !job) {
    console.error("Error creando trabajo de scraping:", jobError);
    return NextResponse.json(
      { error: "Error interno al crear el trabajo" },
      { status: 500 }
    );
  }

  // 5. Notificar al orquestador n8n (server-side: el secret no se expone al cliente)
  const webhookUrl = process.env.N8N_WEBHOOK_SCRAPE_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    console.error("Variables de entorno N8N_WEBHOOK_SCRAPE_URL o N8N_WEBHOOK_SECRET no configuradas");
    // El job queda en estado 'pendiente'; el admin puede reintentarlo
    return NextResponse.json(
      {
        job_id: job.id,
        organizacion_id,
        mensaje: "Job creado. El orquestador no está configurado.",
      },
      { status: 202 }
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
        job_id: job.id,
        organizacion_id,
        tipo,
        parametros,
        user_id: user.id,
      }),
    });
  } catch (fetchError) {
    console.error("Error notificando a n8n:", fetchError);
    // El job queda en 'pendiente'; n8n puede procesarlo más tarde
  }

  return NextResponse.json(
    {
      job_id: job.id,
      organizacion_id,
      mensaje: "Job de scraping iniciado correctamente",
    },
    { status: 202 }
  );
}
