import { generateLookalikeTerms, type TenantIaPreferences, type WonDealSignal } from "@/lib/services/gemini";
import { getHubSpotTokenFromVault, listHubSpotWonDeals } from "@/lib/services/hubspot";
import {
  executeApolloLookalikeJob,
  resolveProspectingErrorMessage,
  resolveProspectingErrorStatus,
} from "@/lib/services/prospecting";
import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Prospección IA Lookalike.
 * Flujo: HubSpot (deals ganados) -> Gemini (terminos) -> Apollo/Data Moat (leads).
 * Si no hay deals ganados, usa fallback automático con las preferencias del tenant.
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

  let body: { organizacion_id?: string; max_resultados?: number } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const orgIdFromBody =
    typeof body.organizacion_id === "string" && body.organizacion_id.trim().length > 0
      ? body.organizacion_id
      : null;

  const membresiaQuery = supabase
    .from("miembros_equipo")
    .select("organizacion_id")
    .eq("user_id", user.id)
    .eq("activo", true)
    .limit(1);

  const { data: membresia } = orgIdFromBody
    ? await membresiaQuery.eq("organizacion_id", orgIdFromBody).single()
    : await membresiaQuery.single();

  if (!membresia) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const organizacionId = String(membresia.organizacion_id);

  const { data: config } = await supabase
    .from("configuracion_tenant")
    .select("preferencias_ia")
    .eq("organizacion_id", organizacionId)
    .maybeSingle();

  const preferenciasIa = (config?.preferencias_ia ?? null) as TenantIaPreferences | null;

  const serviceClient = createServiceClient();
  let wonDealsSignals: WonDealSignal[] = [];
  let fallbackReason: string | null = null;

  try {
    const hubSpotToken = await getHubSpotTokenFromVault(serviceClient, organizacionId);

    if (hubSpotToken) {
      const wonDeals = await listHubSpotWonDeals({
        accessToken: hubSpotToken,
        limit: 20,
      });

      wonDealsSignals = wonDeals.map((deal) => ({
        nombre: deal.name,
        descripcion: deal.pipeline ? `pipeline:${deal.pipeline}` : null,
        importe: deal.amount,
      }));
    } else {
      fallbackReason = "No hay token HubSpot en Vault para esta organización";
    }
  } catch (hubspotError) {
    console.warn("No fue posible leer deals ganados de HubSpot", hubspotError);
    fallbackReason = "No fue posible obtener deals ganados de HubSpot";
  }

  if (wonDealsSignals.length === 0 && !fallbackReason) {
    fallbackReason = "HubSpot no tiene deals ganados todavía";
  }

  const generated = await generateLookalikeTerms({
    wonDeals: wonDealsSignals,
    preferenciasIa,
    maxTerms: 5,
  });

  const maxResultados =
    typeof body.max_resultados === "number" && Number.isFinite(body.max_resultados)
      ? Math.min(Math.max(Math.trunc(body.max_resultados), 1), 10)
      : 10;

  try {
    const result = await executeApolloLookalikeJob({
      userClient: supabase,
      serviceClient,
      organizacionId,
      createdBy: user.id,
      parametros: {
        origen: "hubspot_gemini",
        won_deals_count: wonDealsSignals.length,
        fallback_reason: fallbackReason,
        fallback_used: generated.fallbackUsed,
      },
      searchTerms: generated.terms,
      maxResults: maxResultados,
    });

    return NextResponse.json(
      {
        job_id: result.jobId,
        organizacion_id: organizacionId,
        total_resultados: result.totalResultados,
        cache_hits: result.cacheHits,
        cache_misses: result.cacheMisses,
        terminos: result.searchTermsUsed,
        fallback_used: generated.fallbackUsed || Boolean(fallbackReason),
        fallback_reason: fallbackReason,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error ejecutando lookalike", error);
    return NextResponse.json(
      {
        error: resolveProspectingErrorMessage(error),
      },
      { status: resolveProspectingErrorStatus(error) }
    );
  }
}

