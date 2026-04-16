import { createServiceClient } from "@/lib/supabase/server";
import {
  type UnsubscribeTokenPayload,
  verifyUnsubscribeToken,
} from "@/lib/services/unsubscribe";
import { NextRequest, NextResponse } from "next/server";

interface RegisterOptOutOptions {
  payload: UnsubscribeTokenPayload;
  reason: string;
  source: "email_link" | "api";
}

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function htmlResponse(message: string, status = 200): NextResponse {
  const html = `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LeadBy · Baja de comunicaciones</title>
    <style>
      body { margin: 0; padding: 0; background: #f4f6fb; font-family: Arial, sans-serif; color: #111827; }
      .box { max-width: 560px; margin: 52px auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 24px; line-height: 1.6; }
      h1 { margin: 0 0 12px; font-size: 20px; }
      p { margin: 0; }
      a { color: #0f766e; }
    </style>
  </head>
  <body>
    <div class="box">
      <h1>Baja de comunicaciones</h1>
      <p>${message}</p>
      <p style="margin-top:12px;"><a href="/">Volver a LeadBy</a></p>
    </div>
  </body>
</html>
  `;

  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function registerOptOut(options: RegisterOptOutOptions): Promise<void> {
  const serviceClient = createServiceClient();
  const nowIso = new Date().toISOString();

  const normalizedEmail = options.payload.email.trim().toLowerCase();

  const { error: optOutError } = await serviceClient.from("email_opt_outs").upsert(
    {
      organizacion_id: options.payload.orgId,
      lead_id: options.payload.leadId,
      email: normalizedEmail,
      reason: options.reason,
      source: options.source,
      unsubscribed_at: nowIso,
    },
    {
      onConflict: "organizacion_id,email",
    }
  );

  if (optOutError) {
    throw new Error(`No se pudo guardar la baja: ${optOutError.message}`);
  }

  const { data: leadData } = await serviceClient
    .from("leads")
    .select("id, metadata")
    .eq("id", options.payload.leadId)
    .eq("organizacion_id", options.payload.orgId)
    .maybeSingle();

  if (!leadData) {
    return;
  }

  const metadataActual = toRecord(leadData.metadata);
  const unsubscribeMetadata = toRecord(metadataActual.unsubscribe);

  await serviceClient
    .from("leads")
    .update({
      metadata: {
        ...metadataActual,
        unsubscribe: {
          ...unsubscribeMetadata,
          opted_out: true,
          opted_out_email: normalizedEmail,
          opted_out_reason: options.reason,
          opted_out_source: options.source,
          opted_out_at: nowIso,
        },
      },
    })
    .eq("id", options.payload.leadId)
    .eq("organizacion_id", options.payload.orgId);
}

function getTokenFromRequest(request: NextRequest): string | null {
  const fromQuery = request.nextUrl.searchParams.get("token")?.trim();
  if (fromQuery) {
    return fromQuery;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);

  if (!token) {
    return htmlResponse("El enlace de baja no contiene un token valido.", 400);
  }

  const payload = verifyUnsubscribeToken(token);
  if (!payload) {
    return htmlResponse("El enlace de baja no es valido o ha expirado.", 400);
  }

  try {
    await registerOptOut({
      payload,
      reason: "unsubscribe_link_click",
      source: "email_link",
    });

    return htmlResponse("Tu baja se ha registrado correctamente. No volveras a recibir estos correos.");
  } catch (error) {
    console.error("Error registrando baja desde enlace", error);
    return htmlResponse("No se pudo completar la baja en este momento. Intentalo de nuevo mas tarde.", 500);
  }
}

export async function POST(request: NextRequest) {
  let body: { token?: string; reason?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalido" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Falta token" }, { status: 400 });
  }

  const payload = verifyUnsubscribeToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Token invalido o expirado" }, { status: 400 });
  }

  try {
    await registerOptOut({
      payload,
      reason:
        typeof body.reason === "string" && body.reason.trim().length > 0
          ? body.reason.trim().slice(0, 240)
          : "api_unsubscribe",
      source: "api",
    });

    return NextResponse.json({ ok: true, message: "Baja registrada correctamente" });
  } catch (error) {
    console.error("Error registrando baja via API", error);
    return NextResponse.json({ error: "No se pudo registrar la baja" }, { status: 500 });
  }
}
