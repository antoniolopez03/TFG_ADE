import {
  executeApolloProspectingJob,
  resolveProspectingErrorMessage,
  resolveProspectingErrorStatus,
} from "@/lib/services/prospecting";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Trigger de busqueda.
 *
 * Ejecuta una búsqueda síncrona (Apollo + Data Moat) y
 * registra el trabajo para trazabilidad.
 *
 * Flujo:
 * 1. Verificar sesión de usuario con Supabase
 * 2. Verificar que el usuario pertenece a la organización solicitada
 * 3. Ejecutar prospección y crear leads
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

  const maxResults = Math.min(Math.max(Math.trunc(max_results), 1), 10);
  const serviceClient = createServiceClient();

  if (tipoBusqueda === "apollo_search" && (!query || !location)) {
    return NextResponse.json(
      { error: "Para búsqueda manual se requieren query y location" },
      { status: 400 }
    );
  }

  if (tipoBusqueda === "apollo_lookalike" && !dork_query) {
    return NextResponse.json(
      { error: "Para búsqueda lookalike se requiere dork_query" },
      { status: 400 }
    );
  }

  const parametros =
    tipoBusqueda === "apollo_search"
      ? { query, location, max_results: maxResults }
      : { dork_query, max_results: maxResults };

  try {
    const result = await executeApolloProspectingJob({
      userClient: supabase,
      serviceClient,
      organizacionId: organizacion_id,
      createdBy: user.id,
      tipo: tipoBusqueda,
      parametros,
      organizationCriteria:
        tipoBusqueda === "apollo_search"
          ? {
              query,
              location,
              sector: query,
              ubicacion: location,
              perPage: maxResults,
            }
          : {
              query: dork_query,
              perPage: maxResults,
            },
    });

    return NextResponse.json(
      {
        job_id: result.jobId,
        organizacion_id,
        total_resultados: result.totalResultados,
        cache_hits: result.cacheHits,
        cache_misses: result.cacheMisses,
        mensaje: "Búsqueda completada correctamente.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error ejecutando scrape síncrono", error);
    return NextResponse.json(
      {
        error: resolveProspectingErrorMessage(error),
      },
      { status: resolveProspectingErrorStatus(error) }
    );
  }
}
