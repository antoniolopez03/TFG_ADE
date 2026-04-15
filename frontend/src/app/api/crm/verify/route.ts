import { getHubSpotTokenFromVault, verifyHubSpotConnection } from "@/lib/services/hubspot";
import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Verificar conexión con HubSpot usando token guardado en Vault.
 */
export async function POST(_request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Solo admins pueden verificar
  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id, rol")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  if (!membresia) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  if (membresia.rol !== "admin") {
    return NextResponse.json(
      { error: "Solo los administradores pueden verificar la conexión CRM" },
      { status: 403 }
    );
  }

  const serviceClient = createServiceClient();
  let token: string | null = null;

  try {
    token = await getHubSpotTokenFromVault(serviceClient, String(membresia.organizacion_id));
  } catch (error) {
    console.error("Error leyendo token HubSpot desde Vault", error);
    return NextResponse.json(
      {
        ok: false,
        message: "No se pudo recuperar el token de HubSpot desde Vault.",
      },
      { status: 500 }
    );
  }

  if (!token) {
    return NextResponse.json(
      { ok: false, message: "No hay token de HubSpot configurado en Vault." },
      { status: 200 }
    );
  }

  try {
    await verifyHubSpotConnection(token);

    return NextResponse.json({
      ok: true,
      message: "Conexión con HubSpot verificada correctamente.",
    });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Error desconocido";

    if (rawMessage.includes("401")) {
      return NextResponse.json({
        ok: false,
        message: "Token inválido o expirado. Actualiza el token de HubSpot.",
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message: "No se pudo conectar con HubSpot. Revisa permisos del token y scopes de la app.",
      },
      { status: 200 }
    );
  }
}

