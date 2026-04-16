import { getHubSpotTokenFromVault, listHubSpotWonDeals } from "@/lib/services/hubspot";
import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/saas/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Obtener organización del usuario
  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id, rol, organizaciones(nombre, plan)")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  // Métricas rápidas desde Supabase
  const orgId = membresia?.organizacion_id;
  const [{ count: totalLeads }, { count: leadsEnviados }, { count: leadsPendientes }] =
    await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("organizacion_id", orgId ?? ""),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("organizacion_id", orgId ?? "").eq("estado", "enviado"),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("organizacion_id", orgId ?? "").eq("estado", "pendiente_aprobacion"),
    ]);

  let hubspotDealsWon = 0;
  let hubspotRevenueWon = 0;
  let hubspotMetricsSource: "hubspot" | "sin_token" | "error" = "sin_token";

  if (orgId) {
    try {
      const serviceClient = createServiceClient();
      const hubSpotToken = await getHubSpotTokenFromVault(serviceClient, String(orgId));

      if (hubSpotToken) {
        const wonDeals = await listHubSpotWonDeals({
          accessToken: hubSpotToken,
          limit: 50,
        });

        hubspotDealsWon = wonDeals.length;
        hubspotRevenueWon = wonDeals.reduce(
          (total, deal) => total + (deal.amount ?? 0),
          0
        );
        hubspotMetricsSource = "hubspot";
      }
    } catch (error) {
      console.warn("No se pudieron obtener métricas reales de HubSpot", error);
      hubspotMetricsSource = "error";
    }
  }

  const orgRaw = membresia?.organizaciones;
  const org = (Array.isArray(orgRaw) ? orgRaw[0] : orgRaw) as { nombre: string; plan: string } | null;

  return (
    <DashboardClient
      orgName={org?.nombre ?? null}
      plan={org?.plan ?? "Free"}
      totalLeads={totalLeads ?? 0}
      leadsEnviados={leadsEnviados ?? 0}
      leadsPendientes={leadsPendientes ?? 0}
      hubspotDealsWon={hubspotDealsWon}
      hubspotRevenueWon={hubspotRevenueWon}
      hubspotMetricsSource={hubspotMetricsSource}
    />
  );
}

