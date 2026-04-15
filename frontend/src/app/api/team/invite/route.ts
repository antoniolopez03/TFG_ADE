import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Invitar miembro al equipo.
 * Solo admins pueden invitar. Usa el Service Role Key para
 * llamar a supabase.auth.admin.inviteUserByEmail().
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

  let body: { email: string; rol: "admin" | "miembro" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { email, rol } = body;

  if (!email || !rol) {
    return NextResponse.json(
      { error: "Faltan campos: email, rol" },
      { status: 400 }
    );
  }

  if (!["admin", "miembro"].includes(rol)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  // Verificar que el solicitante es admin
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
      { error: "Solo los administradores pueden invitar miembros" },
      { status: 403 }
    );
  }

  // Usar Service Role para invitar por email
  const serviceClient = createServiceClient();

  const { data: inviteData, error: inviteError } =
    await serviceClient.auth.admin.inviteUserByEmail(email, {
      data: { organizacion_id: membresia.organizacion_id },
    });

  if (inviteError) {
    return NextResponse.json(
      { error: inviteError.message ?? "Error al enviar la invitación" },
      { status: 400 }
    );
  }

  // Pre-crear entrada en miembros_equipo con activo=false hasta que acepte
  if (inviteData.user) {
    const nowIso = new Date().toISOString();

    await serviceClient.from("miembros_equipo").insert({
      organizacion_id: membresia.organizacion_id,
      user_id: inviteData.user.id,
      nombre_completo: email,
      cargo: null,
      rol,
      activo: false,
      invited_at: nowIso,
      joined_at: null,
    });
  }

  return NextResponse.json(
    { mensaje: `Invitación enviada a ${email}` },
    { status: 200 }
  );
}

