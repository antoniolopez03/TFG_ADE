"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export interface TeamMemberDetails {
  id: string;
  user_id: string;
  nombre_completo: string | null;
  cargo: string | null;
  rol: "admin" | "miembro";
  activo: boolean;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
}

interface MemberDetailsModalProps {
  member: TeamMemberDetails | null;
  onClose: () => void;
}

function formatDate(value: string | null, fallback = "Sin registro") {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString("es-ES");
}

function formatRol(rol: TeamMemberDetails["rol"]) {
  return rol === "admin" ? "Admin" : "Miembro";
}

export function MemberDetailsModal({ member, onClose }: MemberDetailsModalProps) {
  useEffect(() => {
    if (!member) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [member, onClose]);

  if (!member) {
    return null;
  }

  const invitacionPendiente = member.joined_at === null && member.invited_at !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Detalles del miembro"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Detalle del miembro
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {member.nombre_completo?.trim() || "Sin nombre"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
            aria-label="Cerrar detalles del miembro"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {invitacionPendiente && (
            <span className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              Invitación pendiente
            </span>
          )}

          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Nombre completo
              </dt>
              <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                {member.nombre_completo?.trim() || "Sin registro"}
              </dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Cargo
              </dt>
              <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                {member.cargo?.trim() || "Sin registro"}
              </dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Rol
              </dt>
              <dd className="mt-1 font-medium text-slate-900 dark:text-white">{formatRol(member.rol)}</dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Estado
              </dt>
              <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                {member.activo ? "Activo" : "Inactivo"}
              </dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Fecha de invitación
              </dt>
              <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                {formatDate(member.invited_at)}
              </dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Fecha de unión
              </dt>
              <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                {formatDate(member.joined_at, "Pendiente")}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
