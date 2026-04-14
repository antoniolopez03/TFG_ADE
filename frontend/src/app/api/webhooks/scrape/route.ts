import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Trigger de busqueda.
 *
 * Registra un trabajo de busqueda para su trazabilidad en server-side.
 *
 * Flujo:
 * 1. Verificar sesión de usuario con Supabase
 * 2. Verificar que el usuario pertenece a la organización solicitada
 * 3. Crear registro en trabajos_busqueda
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
    tipo: "google_maps" | "google_dorks" | "apollo_search" | "apollo_lookalike";
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

  // Compatibilidad temporal: mapear modos legacy al esquema actual.
  const tipoBusqueda =
    tipo === "google_maps"
      ? "apollo_search"
      : tipo === "google_dorks"
      ? "apollo_lookalike"
      : tipo;

  // 4. Crear registro del job en Supabase
  const parametros =
    tipoBusqueda === "apollo_search"
      ? { query, location, max_results }
      : { dork_query, max_results };

  const { data: job, error: jobError } = await supabase
    .from("trabajos_busqueda")
    .insert({
      organizacion_id,
      tipo: tipoBusqueda,
      parametros,
      estado: "completado",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (jobError || !job) {
    console.error("Error creando trabajo de busqueda:", jobError);
    return NextResponse.json(
      { error: "Error interno al crear el trabajo" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      job_id: job.id,
      organizacion_id,
      mensaje: "Trabajo de busqueda registrado correctamente.",
    },
    { status: 202 }
  );
}
