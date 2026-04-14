import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Prospección IA Lookalike.
 * Valida acceso del usuario y reserva el endpoint para el flujo HubSpot + Gemini.
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

  // Obtener organización del usuario
  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  if (!membresia) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  return NextResponse.json(
    {
      error:
        "La prospección lookalike aún no está disponible. Se habilitará al integrar HubSpot, Gemini y Apollo.",
      organizacion_id: membresia.organizacion_id,
    },
    { status: 501 }
  );
}
