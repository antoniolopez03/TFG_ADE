import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Guarda o rota el token de HubSpot en Supabase Vault.
 * Solo disponible para administradores del tenant.
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

  let body: { organizacion_id?: string; token?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invÃ¡lido" }, { status: 400 });
  }

  const organizacionId =
    typeof body.organizacion_id === "string" ? body.organizacion_id.trim() : "";
  const token = typeof body.token === "string" ? body.token.trim() : "";

  if (!organizacionId || !token) {
    return NextResponse.json(
      { error: "Faltan campos: organizacion_id y token" },
      { status: 400 }
    );
  }

  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id, rol")
    .eq("user_id", user.id)
    .eq("organizacion_id", organizacionId)
    .eq("activo", true)
    .single();

  if (!membresia) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  if (membresia.rol !== "admin") {
    return NextResponse.json(
      { error: "Solo los administradores pueden actualizar el token CRM." },
      { status: 403 }
    );
  }

  const { data: orgData } = await supabase
    .from("organizaciones")
    .select("nombre")
    .eq("id", organizacionId)
    .maybeSingle();

  const nombreEmpresa =
    typeof orgData?.nombre === "string" && orgData.nombre.trim().length > 0
      ? orgData.nombre.trim()
      : "Organizacion";

  const serviceClient = createServiceClient();

  const { error: vaultError } = await serviceClient.rpc("guardar_hubspot_token", {
    p_organizacion_id: organizacionId,
    p_token: token,
    p_nombre_empresa: nombreEmpresa,
  });

  if (vaultError) {
    console.error("Error guardando token HubSpot en Vault", vaultError);
    return NextResponse.json(
      { error: "No se pudo guardar el token en Vault." },
      { status: 500 }
    );
  }

  const { error: configError } = await serviceClient
    .from("configuracion_tenant")
    .update({ crm_proveedor: "hubspot" })
    .eq("organizacion_id", organizacionId);

  if (configError) {
    console.warn("Token guardado en Vault, pero no se pudo actualizar crm_proveedor", configError);
  }

  return NextResponse.json({
    ok: true,
    message: "Token de HubSpot guardado correctamente en Vault.",
  });
}

