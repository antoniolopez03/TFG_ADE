import { createClient } from "@/lib/supabase/server";
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  if (!membresia) redirect("/auth/login");

  // Fetch del lead con empresa y contacto (RLS garantiza que pertenece a este tenant)
  const { data: lead } = await supabase
    .from("leads_prospectados")
    .select(`
      id, estado, email_borrador, email_aprobado, email_asunto,
      email_enviado_at, notas, created_at,
      global_empresas (id, nombre, dominio, ciudad, provincia, sector, telefono, direccion, google_maps_url),
      global_contactos (id, nombre, apellidos, cargo, email, linkedin_url, telefono)
    `)
    .eq("id", params.leadId)
    .eq("organizacion_id", membresia.organizacion_id)
    .single();

  if (!lead) notFound();

  const empresa = lead.global_empresas as Record<string, string | null> | null;
  const contacto = lead.global_contactos as Record<string, string | null> | null;

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/leads" className="text-sm text-gray-500 hover:text-gray-700">
          ← Bandeja de leads
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo: datos del lead */}
        <div className="space-y-4">
          {/* Empresa */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900 text-sm">Empresa</h2>
            </div>
            {empresa ? (
              <div className="space-y-2">
                <p className="text-lg font-bold text-gray-900">{empresa.nombre}</p>
                {empresa.sector && (
                  <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md w-fit">
                    {empresa.sector}
                  </p>
                )}
                <div className="space-y-1.5 mt-3">
                  {empresa.ciudad && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {empresa.ciudad}{empresa.provincia && `, ${empresa.provincia}`}
                    </div>
                  )}
                  {empresa.dominio && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                      <a
                        href={`https://${empresa.dominio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {empresa.dominio}
                      </a>
                    </div>
                  )}
                  {empresa.google_maps_url && (
                    <a
                      href={empresa.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-1"
                    >
                      Ver en Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Datos de empresa no disponibles.</p>
            )}
          </div>

          {/* Contacto */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900 text-sm">Contacto</h2>
            </div>
            {contacto ? (
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">
                  {[contacto.nombre, contacto.apellidos].filter(Boolean).join(" ") || "Nombre desconocido"}
                </p>
                {contacto.cargo && (
                  <p className="text-xs text-gray-500">{contacto.cargo}</p>
                )}
                <div className="space-y-1.5 mt-3">
                  {contacto.email && (
                    <p className="text-xs text-gray-600">
                      ✉️ <a href={`mailto:${contacto.email}`} className="text-blue-600 hover:underline">{contacto.email}</a>
                    </p>
                  )}
                  {contacto.linkedin_url && (
                    <p className="text-xs">
                      <a
                        href={contacto.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        Ver perfil LinkedIn <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Contacto pendiente de enriquecimiento con Apollo.io.
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400">
              Descubierto el {new Date(lead.created_at).toLocaleDateString("es-ES", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
            {lead.email_enviado_at && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Email enviado el {new Date(lead.email_enviado_at).toLocaleDateString("es-ES")}
              </p>
            )}
          </div>
        </div>

        {/* Panel derecho: aprobación del email (Human-in-the-Loop) */}
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
