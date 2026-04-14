import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Trigger de scraping.
 *
 * Registra un trabajo de scraping para su procesamiento server-side.
 *
 * Flujo:
 * 1. Verificar sesión de usuario con Supabase
 * 2. Verificar que el usuario pertenece a la organización solicitada
 * 3. Crear registro en trabajos_scraping (para polling del frontend)
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

  return NextResponse.json(
    {
      job_id: job.id,
      organizacion_id,
      mensaje:
        "Job de scraping registrado en estado pendiente. El procesamiento automático se habilitará en fases siguientes.",
    },
    { status: 202 }
  );
}
