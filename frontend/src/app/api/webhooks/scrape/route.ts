import {
  executeApolloProspectingJob,
  resolveProspectingErrorMessage,
  resolveProspectingErrorStatus,
} from "@/lib/services/prospecting";
import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Trigger de busqueda.
 *
 * Ejecuta una bÃºsqueda sÃ­ncrona (mock Gemini + Data Moat) y
 * registra el trabajo para trazabilidad.
 *
 * Flujo:
 * 1. Verificar sesiÃ³n de usuario con Supabase
 * 2. Verificar que el usuario pertenece a la organizaciÃ³n solicitada
 * 3. Ejecutar prospecciÃ³n y crear leads
 */
export async function POST(request: NextRequest) {
  // 1. Verificar autenticaciÃ³n
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
    return NextResponse.json({ error: "Body JSON invÃ¡lido" }, { status: 400 });
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
          "Para bÃºsqueda manual se requieren sector y ubicacion como strings no vacÃ­os.",
      },
      { status: 400 }
    );
  }

  // 3. Verificar que el usuario pertenece a la organizaciÃ³n (autorizaciÃ³n)
  const { data: membresia, error: membresiaError } = await supabase
    .from("miembros_equipo")
    .select("id, rol")
    .eq("user_id", user.id)
    .eq("organizacion_id", organizacion_id)
    .eq("activo", true)
    .single();

  if (membresiaError || !membresia) {
    return NextResponse.json(
      { error: "No tienes acceso a esta organizaciÃ³n" },
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
        mensaje: "BÃºsqueda completada correctamente.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error ejecutando scrape sÃ­ncrono", error);
    return NextResponse.json(
      {
        error: resolveProspectingErrorMessage(error),
      },
      { status: resolveProspectingErrorStatus(error) }
    );
  }
}

