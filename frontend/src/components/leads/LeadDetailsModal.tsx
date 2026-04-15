"use client";

import { useEffect } from "react";
import {
  Briefcase,
  Building2,
  Cpu,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  UserRound,
  X,
} from "lucide-react";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import type { LeadConRelaciones } from "@/lib/types/app.types";

interface LeadDetailsModalProps {
  lead: LeadConRelaciones | null;
  onClose: () => void;
}

function formatFallback(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "No disponible";
}

function formatSeniority(value: string | null | undefined): string {
  if (!value) {
    return "No disponible";
  }

  return value
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
}

function formatEmailStatus(value: string | null | undefined): string {
  if (!value) {
    return "No disponible";
  }

  const labels: Record<string, string> = {
    verified: "Verificado",
    unverified: "No verificado",
    catch_all: "Catch-all",
    unknown: "Desconocido",
    invalid: "Invalido",
  };

  return labels[value] ?? value;
}

export function LeadDetailsModal({ lead, onClose }: LeadDetailsModalProps) {
  useEffect(() => {
    if (!lead) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [lead, onClose]);

  if (!lead) {
    return null;
  }

  const empresa = lead.global_empresas;
  const contacto = lead.global_contactos;
  const tecnologias = Array.isArray(empresa?.tecnologias)
    ? empresa.tecnologias.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const contactoNombre = [contacto?.nombre, contacto?.apellidos]
    .filter((item): item is string => Boolean(item && item.trim()))
    .join(" ");
  const ubicacionEmpresa = [empresa?.ciudad, empresa?.pais]
    .filter((item): item is string => Boolean(item && item.trim()))
    .join(", ");

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 lg:p-10">
        <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="relative border-b border-slate-200 px-6 pb-6 pt-8 dark:border-slate-700 sm:px-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-r from-cyan-50 via-sky-50 to-teal-50 dark:from-cyan-950/20 dark:via-sky-950/20 dark:to-teal-950/20" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Perfil enriquecido del lead
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  {formatFallback(empresa?.nombre)}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {contactoNombre || "Contacto sin nombre"}
                  {contacto?.cargo ? ` - ${contacto.cargo}` : ""}
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white/80 p-2 text-slate-500 transition-colors hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white"
                aria-label="Cerrar panel de detalles"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mt-5 flex flex-wrap items-center gap-2">
              <LeadStatusBadge estado={lead.estado} />
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Creado el {new Date(lead.created_at).toLocaleDateString("es-ES")}
              </span>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="mb-4 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  Perfil del contacto
                </h3>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="grid gap-1">
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Nombre completo</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">{contactoNombre || "No disponible"}</dd>
                </div>

                <div className="grid gap-1">
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Cargo</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">{formatFallback(contacto?.cargo)}</dd>
                </div>

                <div className="grid gap-1 sm:grid-cols-2 sm:gap-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Seniority</dt>
                    <dd className="mt-1 text-slate-700 dark:text-slate-300">{formatSeniority(contacto?.seniority)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Departamento</dt>
                    <dd className="mt-1 text-slate-700 dark:text-slate-300">{formatFallback(contacto?.departamento)}</dd>
                  </div>
                </div>

                <div className="grid gap-1">
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</dt>
                  <dd>
                    {contacto?.email ? (
                      <a
                        href={`mailto:${contacto.email}`}
                        className="inline-flex items-center gap-2 font-medium text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {contacto.email}
                      </a>
                    ) : (
                      <span className="text-slate-700 dark:text-slate-300">No disponible</span>
                    )}
                  </dd>
                </div>

                <div className="grid gap-1 sm:grid-cols-2 sm:gap-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Estado del email</dt>
                    <dd className="mt-1 text-slate-700 dark:text-slate-300">{formatEmailStatus(contacto?.email_status)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Telefono</dt>
                    <dd className="mt-1">
                      {contacto?.telefono ? (
                        <a
                          href={`tel:${contacto.telefono}`}
                          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {contacto.telefono}
                        </a>
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">No disponible</span>
                      )}
                    </dd>
                  </div>
                </div>

                <div className="grid gap-1">
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">LinkedIn</dt>
                  <dd>
                    {contacto?.linkedin_url ? (
                      <a
                        href={contacto.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-medium text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
                      >
                        Ver perfil
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-slate-700 dark:text-slate-300">No disponible</span>
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  Datos de la empresa
                </h3>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="grid gap-1">
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Nombre</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">{formatFallback(empresa?.nombre)}</dd>
                </div>

                <div className="grid gap-1">
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Dominio</dt>
                  <dd>
                    {empresa?.dominio ? (
                      <a
                        href={`https://${empresa.dominio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        {empresa.dominio}
                      </a>
                    ) : (
                      <span className="text-slate-700 dark:text-slate-300">No disponible</span>
                    )}
                  </dd>
                </div>

                <div className="grid gap-1">
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Sector</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">{formatFallback(empresa?.sector)}</dd>
                </div>

                <div className="grid gap-1 sm:grid-cols-2 sm:gap-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tamano (empleados)</dt>
                    <dd className="mt-1 inline-flex rounded-md bg-slate-200/70 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700/50 dark:text-slate-200">
                      {formatFallback(empresa?.empleados_rango)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tamano (ingresos)</dt>
                    <dd className="mt-1 inline-flex rounded-md bg-emerald-100/70 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {formatFallback(empresa?.ingresos_rango)}
                    </dd>
                  </div>
                </div>

                <div className="grid gap-1">
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tecnologias</dt>
                  <dd>
                    {tecnologias.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {tecnologias.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                          >
                            <Cpu className="h-3 w-3" />
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-700 dark:text-slate-300">No disponible</span>
                    )}
                  </dd>
                </div>

                <div className="grid gap-1">
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Ciudad y pais</dt>
                  <dd className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5" />
                    {ubicacionEmpresa || "No disponible"}
                  </dd>
                </div>

                <div className="grid gap-1 sm:grid-cols-2 sm:gap-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Telefono empresa</dt>
                    <dd className="mt-1 text-slate-700 dark:text-slate-300">{formatFallback(empresa?.telefono)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">LinkedIn empresa</dt>
                    <dd className="mt-1">
                      {empresa?.linkedin_url ? (
                        <a
                          href={empresa.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                          Ver empresa
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">No disponible</span>
                      )}
                    </dd>
                  </div>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
