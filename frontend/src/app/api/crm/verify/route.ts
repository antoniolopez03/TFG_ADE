import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Verificar conexión con HubSpot.
 * Lee el token almacenado en configuracion_tenant y hace una llamada de prueba
 * a la API de HubSpot. Nunca expone el token en la respuesta.
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

  // Obtener el token de configuracion_tenant
  const { data: config } = await supabase
    .from("configuracion_tenant")
    .select("crm_api_key_secret_id")
    .eq("organizacion_id", membresia.organizacion_id)
    .single();

  const token = config?.crm_api_key_secret_id;

  if (!token) {
    return NextResponse.json(
      { ok: false, message: "No hay token de HubSpot configurado." },
      { status: 200 }
    );
  }

  // Llamada de prueba a HubSpot
  try {
    const res = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts?limit=1",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (res.ok) {
      return NextResponse.json({
        ok: true,
        message: "Conexión con HubSpot verificada correctamente.",
      });
    } else if (res.status === 401) {
      return NextResponse.json({
        ok: false,
        message: "Token inválido o expirado. Actualiza el token de HubSpot.",
      });
    } else {
      return NextResponse.json({
        ok: false,
        message: `Error de HubSpot (${res.status}). Verifica los permisos del token.`,
      });
    }
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "No se pudo conectar con HubSpot. Comprueba tu conexión.",
      },
      { status: 200 }
    );
  }
}
