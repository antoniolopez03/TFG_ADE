import { createClient } from "@/lib/supabase/request-client";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Building2, User, Globe, MapPin } from "lucide-react";
import { EmailApprovalPanel } from "@/components/leads/EmailApprovalPanel";

export default async function LeadDetailPage({
  params,
}: {
  params: { leadId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  if (!membresia) redirect("/auth/login");

  const { data: lead } = await supabase
    .from("leads")
    .select(`
      id,
      estado,
      email_borrador,
      email_aprobado,
      email_asunto,
      email_enviado_at,
      notas,
      created_at,
      empresa_nombre,
      empresa_dominio,
      empresa_ciudad,
      empresa_sector,
      empresa_telefono,
      empresa_linkedin_url,
      empresa_facturacion_rango,
      empresa_pais,
      contacto_nombre_completo,
      contacto_cargo,
      contacto_email,
      contacto_linkedin_url,
      contacto_telefono,
      contacto_departamento
    `)
    .eq("id", params.leadId)
    .eq("organizacion_id", membresia.organizacion_id)
    .single();

  if (!lead) notFound();

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <Link
          href="/leads"
          className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
        >
          ← Bandeja de leads
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-xl border border-black/5 bg-white/90 p-5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-black/40 dark:text-white/50" />
              <h2 className="text-sm font-semibold text-foreground">Empresa</h2>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-bold text-foreground">{lead.empresa_nombre}</p>
              {lead.empresa_sector && (
                <p className="w-fit rounded-md bg-black/5 px-2 py-1 text-xs text-black/60 dark:bg-white/10 dark:text-white/60">
                  {lead.empresa_sector}
                </p>
              )}
              {lead.empresa_facturacion_rango && (
                <p className="w-fit rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  Facturación estimada: {lead.empresa_facturacion_rango}
                </p>
              )}

              <div className="space-y-1.5 mt-3">
                {lead.empresa_ciudad && (
                  <div className="flex items-center gap-2 text-xs text-black/70 dark:text-white/70">
                    <MapPin className="w-3.5 h-3.5 text-black/40 dark:text-white/50" />
                    {lead.empresa_ciudad}
                    {lead.empresa_pais ? `, ${lead.empresa_pais}` : ""}
                  </div>
                )}

                {lead.empresa_dominio && (
                  <div className="flex items-center gap-2 text-xs text-black/70 dark:text-white/70">
                    <Globe className="w-3.5 h-3.5 text-black/40 dark:text-white/50" />
                    <a
                      href={`https://${lead.empresa_dominio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-leadby-500 hover:text-leadby-600 dark:text-leadby-400"
                    >
                      {lead.empresa_dominio}
                    </a>
                  </div>
                )}

                {lead.empresa_linkedin_url && (
                  <a
                    href={lead.empresa_linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-leadby-500 hover:text-leadby-600 dark:text-leadby-400"
                  >
                    Ver empresa en LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-black/5 bg-white/90 p-5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-black/40 dark:text-white/50" />
              <h2 className="text-sm font-semibold text-foreground">Contacto</h2>
            </div>

            {lead.contacto_nombre_completo || lead.contacto_email || lead.contacto_cargo ? (
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  {lead.contacto_nombre_completo || "Nombre desconocido"}
                </p>

                {lead.contacto_cargo && (
                  <p className="text-xs text-black/60 dark:text-white/60">{lead.contacto_cargo}</p>
                )}

                {lead.contacto_departamento && (
                  <p className="text-xs text-black/60 dark:text-white/60">
                    Departamento: {lead.contacto_departamento}
                  </p>
                )}

                <div className="space-y-1.5 mt-3">
                  {lead.contacto_email && (
                    <p className="text-xs text-black/70 dark:text-white/70">
                      ✉️{" "}
                      <a
                        href={`mailto:${lead.contacto_email}`}
                        className="text-leadby-500 hover:text-leadby-600 dark:text-leadby-400"
                      >
                        {lead.contacto_email}
                      </a>
                    </p>
                  )}

                  {lead.contacto_linkedin_url && (
                    <p className="text-xs">
                      <a
                        href={lead.contacto_linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-leadby-500 hover:text-leadby-600 dark:text-leadby-400"
                      >
                        Ver perfil LinkedIn <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-black/50 dark:text-white/50 italic">
                Contacto pendiente de enriquecimiento de prospección.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-black/5 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs text-black/50 dark:text-white/50">
              Descubierto el{" "}
              {new Date(lead.created_at).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {lead.email_enviado_at && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                ✓ Email enviado el {new Date(lead.email_enviado_at).toLocaleDateString("es-ES")}
              </p>
            )}
          </div>
        </div>

        <EmailApprovalPanel
          leadId={lead.id}
          organizacionId={membresia.organizacion_id}
          estado={lead.estado}
          emailBorrador={lead.email_borrador}
          emailAprobado={lead.email_aprobado}
          emailAsunto={lead.email_asunto}
        />
      </div>
    </div>
  );
}
