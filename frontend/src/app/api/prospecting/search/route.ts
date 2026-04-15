import {
  executeApolloProspectingJob,
} from "@/lib/services/prospecting";
import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

interface ApolloMockAiErrorLike {
  name?: unknown;
  code?: unknown;
  status?: unknown;
  publicMessage?: unknown;
}

function isApolloMockAiErrorLike(error: unknown): error is {
  code: string;
  status: 503 | 429 | 500;
  publicMessage: string;
} {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as ApolloMockAiErrorLike;

  const hasKnownName = candidate.name === "ApolloMockAiError";
  const hasKnownCode =
    candidate.code === "SERVIDOR_SATURADO" ||
    candidate.code === "LIMITE_PETICIONES" ||
    candidate.code === "FALLO_IA";
  const hasKnownStatus = candidate.status === 503 || candidate.status === 429 || candidate.status === 500;
  const hasPublicMessage = typeof candidate.publicMessage === "string";

  return hasKnownName && hasKnownCode && hasKnownStatus && hasPublicMessage;
}

interface LeadProspectedWithCompanyRow {
  global_empresas:
    | {
        dominio: string | null;
      }
    | Array<{
        dominio: string | null;
      }>
    | null;
}

function extractDominiosExcluidos(rows: LeadProspectedWithCompanyRow[] | null): string[] {
  if (!rows || rows.length === 0) {
    return [];
  }

  const uniqueDomains = new Set<string>();

  for (const row of rows) {
    const empresa = row.global_empresas;

    if (Array.isArray(empresa)) {
      for (const item of empresa) {
        const dominio = typeof item?.dominio === "string" ? item.dominio.trim().toLowerCase() : "";

        if (dominio) {
          uniqueDomains.add(dominio);
        }
      }

      continue;
    }

    const dominio = typeof empresa?.dominio === "string" ? empresa.dominio.trim().toLowerCase() : "";
    if (dominio) {
      uniqueDomains.add(dominio);
    }
  }

  return Array.from(uniqueDomains);
}

/**
 * API Route: Búsqueda manual de prospectos.
 * Recibe sector, ubicación y tamaño opcional.
 * Ejecuta prospección síncrona con mock Gemini + Data Moat.
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
    sector?: unknown;
    ubicacion?: unknown;
    tamano?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const sector = typeof body.sector === "string" ? body.sector.trim() : "";
  const ubicacion = typeof body.ubicacion === "string" ? body.ubicacion.trim() : "";
  const tamano = typeof body.tamano === "string" ? body.tamano.trim() : "";

  if (!sector) {
    return NextResponse.json(
      { error: "El campo 'sector' es obligatorio y debe ser un string no vacío." },
      { status: 400 }
    );
  }

  if (!ubicacion) {
    return NextResponse.json(
      { error: "El campo 'ubicacion' es obligatorio y debe ser un string no vacío." },
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
  let dominiosExcluidos: string[] = [];

  try {
    const { data: prospectadosConEmpresa, error: prospectadosError } = await supabase
      .from("leads_prospectados")
      .select("global_empresas!inner(dominio)")
      .eq("organizacion_id", organizacionId);

    if (prospectadosError) {
      throw prospectadosError;
    }

    dominiosExcluidos = extractDominiosExcluidos(
      (prospectadosConEmpresa ?? null) as LeadProspectedWithCompanyRow[] | null
    );
  } catch (error) {
    console.error("Error obteniendo dominios excluidos para mock Apollo", {
      organizacionId,
      error,
    });
    dominiosExcluidos = [];
  }

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
        sector,
        ubicacion,
        tamano: tamano || undefined,
        dominiosExcluidos,
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

    if (isApolloMockAiErrorLike(error)) {
      return NextResponse.json(
        {
          error: error.publicMessage,
          error_code: error.code,
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        error:
          "No se pudo completar la prospección en este momento por un fallo interno de IA. Inténtalo de nuevo en unos minutos.",
      },
      { status: 500 }
    );
  }
}

