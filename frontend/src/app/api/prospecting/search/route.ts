import {
  executeApolloProspectingJob,
  resolveProspectingErrorMessage,
  resolveProspectingErrorStatus,
} from "@/lib/services/prospecting";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function toTrimmedStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * API Route: Búsqueda manual de prospectos.
 * Recibe cargo(s), sector, ubicación y seniority opcional.
 * Ejecuta prospección síncrona con Apollo + Data Moat.
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
    organizacion_id?: string;
    tipo?: string;
    titles?: unknown;
    sector?: unknown;
    location?: unknown;
    seniorities?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const titles = toTrimmedStringArray(body.titles);
  const seniorities = toTrimmedStringArray(body.seniorities);
  const sector = typeof body.sector === "string" ? body.sector.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";

  if (titles.length === 0) {
    return NextResponse.json(
      { error: "El campo 'titles' debe ser un array no vacío de cargos." },
      { status: 400 }
    );
  }

  if (!sector) {
    return NextResponse.json(
      { error: "El campo 'sector' es obligatorio y debe ser un string no vacío." },
      { status: 400 }
    );
  }

  if (!location) {
    return NextResponse.json(
      { error: "El campo 'location' es obligatorio y debe ser un string no vacío." },
      { status: 400 }
    );
  }

  const requestedOrgId =
    typeof body.organizacion_id === "string" && body.organizacion_id.trim().length > 0
      ? body.organizacion_id.trim()
      : null;

  const membresiaQuery = supabase
    .from("miembros_equipo")
    .select("organizacion_id")
    .eq("user_id", user.id)
    .eq("activo", true)
    .limit(1);

  const { data: membresia, error: membresiaError } = requestedOrgId
    ? await membresiaQuery.eq("organizacion_id", requestedOrgId).single()
    : await membresiaQuery.single();

  if (membresiaError || !membresia) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const organizacionId = String(membresia.organizacion_id);
  const serviceClient = createServiceClient();

  try {
    const result = await executeApolloProspectingJob({
      userClient: supabase,
      serviceClient,
      organizacionId,
      createdBy: user.id,
      tipo: "apollo_search",
      parametros: {
        tipo: body.tipo ?? "apollo_search",
        titles,
        sector,
        location,
        seniorities,
      },
    });

    return NextResponse.json(
      {
        job_id: result.jobId,
        organizacion_id: organizacionId,
        total_resultados: result.totalResultados,
        leads_creados: result.leadsCreados,
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
