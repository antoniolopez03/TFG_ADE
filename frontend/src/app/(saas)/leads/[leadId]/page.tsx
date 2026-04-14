import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Building2, User, Globe, MapPin } from "lucide-react";
import { EmailApprovalPanel } from "@/components/leads/EmailApprovalPanel";

type Empresa = {
  id: string | null;
  nombre: string | null;
  dominio: string | null;
  ciudad: string | null;
  provincia: string | null;
  sector: string | null;
  telefono: string | null;
  linkedin_url: string | null;
};

type Contacto = {
  id: string | null;
  nombre: string | null;
  apellidos: string | null;
  cargo: string | null;
  email: string | null;
  linkedin_url: string | null;
  telefono: string | null;
};

type MaybeArray<T> = T | T[] | null | undefined;

function normalizeOne<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

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
      id, estado, borrador_email, email_aprobado, email_asunto,
      email_enviado_at, notas, created_at,
      global_empresas (id, nombre, dominio, ciudad, provincia, sector, telefono, linkedin_url),
      global_contactos (id, nombre, apellidos, cargo, email, linkedin_url, telefono)
    `)
    .eq("id", params.leadId)
    .eq("organizacion_id", membresia.organizacion_id)
    .single();

  if (!lead) notFound();

  const empresa = normalizeOne<Empresa>(lead.global_empresas as MaybeArray<Empresa>);
  const contacto = normalizeOne<Contacto>(lead.global_contactos as MaybeArray<Contacto>);

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/leads" className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
          ← Bandeja de leads
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo: datos del lead */}
        <div className="space-y-4">
          {/* Empresa */}
          <div className="rounded-xl border border-black/5 bg-white/90 p-5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-black/40 dark:text-white/50" />
              <h2 className="text-sm font-semibold text-foreground">Empresa</h2>
            </div>
            {empresa ? (
              <div className="space-y-2">
                <p className="text-lg font-bold text-foreground">{empresa.nombre}</p>
                {empresa.sector && (
                  <p className="w-fit rounded-md bg-black/5 px-2 py-1 text-xs text-black/60 dark:bg-white/10 dark:text-white/60">
                    {empresa.sector}
                  </p>
                )}
                <div className="space-y-1.5 mt-3">
                  {empresa.ciudad && (
                    <div className="flex items-center gap-2 text-xs text-black/70 dark:text-white/70">
                      <MapPin className="w-3.5 h-3.5 text-black/40 dark:text-white/50" />
                      {empresa.ciudad}{empresa.provincia && `, ${empresa.provincia}`}
                    </div>
                  )}
                  {empresa.dominio && (
                    <div className="flex items-center gap-2 text-xs text-black/70 dark:text-white/70">
                      <Globe className="w-3.5 h-3.5 text-black/40 dark:text-white/50" />
                      <a
                        href={`https://${empresa.dominio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-leadby-500 hover:text-leadby-600 dark:text-leadby-400"
                      >
                        {empresa.dominio}
                      </a>
                    </div>
                  )}
                  {empresa.linkedin_url && (
                    <a
                      href={empresa.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-leadby-500 hover:text-leadby-600 dark:text-leadby-400"
                    >
                      Ver empresa en LinkedIn <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-black/50 dark:text-white/50">Datos de empresa no disponibles.</p>
            )}
          </div>

          {/* Contacto */}
          <div className="rounded-xl border border-black/5 bg-white/90 p-5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-black/40 dark:text-white/50" />
              <h2 className="text-sm font-semibold text-foreground">Contacto</h2>
            </div>
            {contacto ? (
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  {[contacto.nombre, contacto.apellidos].filter(Boolean).join(" ") || "Nombre desconocido"}
                </p>
                {contacto.cargo && (
                  <p className="text-xs text-black/60 dark:text-white/60">{contacto.cargo}</p>
                )}
                <div className="space-y-1.5 mt-3">
                  {contacto.email && (
                    <p className="text-xs text-black/70 dark:text-white/70">
                      ✉️{" "}
                      <a
                        href={`mailto:${contacto.email}`}
                        className="text-leadby-500 hover:text-leadby-600 dark:text-leadby-400"
                      >
                        {contacto.email}
                      </a>
                    </p>
                  )}
                  {contacto.linkedin_url && (
                    <p className="text-xs">
                      <a
                        href={contacto.linkedin_url}
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

          {/* Metadata */}
          <div className="rounded-xl border border-black/5 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs text-black/50 dark:text-white/50">
              Descubierto el {new Date(lead.created_at).toLocaleDateString("es-ES", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
            {lead.email_enviado_at && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
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
          emailBorrador={lead.borrador_email}
          emailAprobado={lead.email_aprobado}
          emailAsunto={lead.email_asunto}
        />
      </div>
    </div>
  );
}
