import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

interface UpdateMemberStatusBody {
  memberId?: string;
  activo?: boolean;
}

/**
 * API Route: Actualizar estado (activo/inactivo) de un miembro del equipo.
 * Solo administradores de la organización pueden ejecutar esta acción.
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

  let body: UpdateMemberStatusBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { memberId, activo } = body;

  if (!memberId || typeof memberId !== "string") {
    return NextResponse.json({ error: "memberId es obligatorio" }, { status: 400 });
  }

  if (typeof activo !== "boolean") {
    return NextResponse.json({ error: "activo debe ser boolean" }, { status: 400 });
  }

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
      { error: "Solo los administradores pueden actualizar miembros" },
      { status: 403 }
    );
  }

  const { data: targetMember } = await supabase
    .from("miembros_equipo")
    .select("id, user_id")
    .eq("id", memberId)
    .eq("organizacion_id", membresia.organizacion_id)
    .single();

  if (!targetMember) {
    return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 });
  }

  if (targetMember.user_id === user.id && !activo) {
    return NextResponse.json(
      { error: "No puedes desactivar tu propio usuario." },
      { status: 400 }
    );
  }

  const serviceClient = createServiceClient();
  const { data: memberUpdated, error: updateError } = await serviceClient
    .from("miembros_equipo")
    .update({ activo })
    .eq("id", memberId)
    .eq("organizacion_id", membresia.organizacion_id)
    .select("id, activo")
    .single();

  if (updateError || !memberUpdated) {
    return NextResponse.json(
      { error: "No se pudo actualizar el estado del miembro" },
      { status: 500 }
    );
  }

  return NextResponse.json({ member: memberUpdated }, { status: 200 });
}
