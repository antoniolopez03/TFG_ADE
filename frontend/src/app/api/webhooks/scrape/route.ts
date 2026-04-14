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
 * Ejecuta una búsqueda síncrona (mock Gemini + Data Moat) y
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
    tipo?: "apollo_search";
    sector?: string;
    ubicacion?: string;
    tamano?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { organizacion_id, tipo, sector, ubicacion, tamano } = body;

  if (!organizacion_id) {
    return NextResponse.json(
      { error: "Falta el campo requerido: organizacion_id" },
      { status: 400 }
    );
  }

  if (tipo && tipo !== "apollo_search") {
    return NextResponse.json(
      { error: "El campo 'tipo' solo admite 'apollo_search'." },
      { status: 400 }
    );
  }

  const normalizedSector = typeof sector === "string" ? sector.trim() : "";
  const normalizedUbicacion = typeof ubicacion === "string" ? ubicacion.trim() : "";
  const normalizedTamano = typeof tamano === "string" ? tamano.trim() : "";

  if (!normalizedSector || !normalizedUbicacion) {
    return NextResponse.json(
      {
        error:
          "Para búsqueda manual se requieren sector y ubicacion como strings no vacíos.",
      },
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

  const serviceClient = createServiceClient();

  try {
    const result = await executeApolloProspectingJob({
      userClient: supabase,
      serviceClient,
      organizacionId: organizacion_id,
      createdBy: user.id,
      tipo: "apollo_search",
      parametros: {
        tipo: "apollo_search",
        sector: normalizedSector,
        ubicacion: normalizedUbicacion,
        tamano: normalizedTamano || undefined,
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
