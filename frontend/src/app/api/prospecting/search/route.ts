import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Búsqueda manual de prospectos.
 * Recibe sector, ubicacion y tamano, obtiene el organizacion_id del usuario
 * y valida acceso para la ejecución síncrona que se implementará con Apollo.
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
        "La búsqueda manual aún no está disponible. Se habilitará al integrar Apollo en la Fase 2.",
      organizacion_id: membresia.organizacion_id,
    },
    { status: 501 }
  );
}
