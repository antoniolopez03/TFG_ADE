import {
  executeApolloProspectingJob,
  resolveProspectingErrorMessage,
  resolveProspectingErrorStatus,
} from "@/lib/services/prospecting";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Búsqueda manual de prospectos.
 * Recibe sector, ubicación y tamaño, ejecuta prospección síncrona
 * con Apollo + Data Moat y crea leads en estado pendiente_aprobacion.
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

  const { data: membresia, error: membresiaError } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  if (membresiaError || !membresia) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const serviceClient = createServiceClient();

  try {
    const result = await executeApolloProspectingJob({
      userClient: supabase,
      serviceClient,
      organizacionId: membresia.organizacion_id,
      createdBy: user.id,
      tipo: "apollo_search",
      parametros: {
        sector,
        ubicacion,
        tamano,
      },
      organizationCriteria: {
        query: sector,
        location: ubicacion,
        sector,
        ubicacion,
        tamano,
        perPage: 10,
      },
    });

    return NextResponse.json(
      {
        job_id: result.jobId,
        organizacion_id: membresia.organizacion_id,
        total_resultados: result.totalResultados,
        cache_hits: result.cacheHits,
        cache_misses: result.cacheMisses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en búsqueda manual", error);
    return NextResponse.json(
      {
        error: resolveProspectingErrorMessage(error),
      },
      { status: resolveProspectingErrorStatus(error) }
    );
  }
}
