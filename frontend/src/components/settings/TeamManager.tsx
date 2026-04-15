"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  MemberDetailsModal,
  type TeamMemberDetails,
} from "@/components/settings/MemberDetailsModal";

type Miembro = TeamMemberDetails;

interface TeamManagerProps {
  organizacionId: string;
  miembros: Miembro[];
  isAdmin: boolean;
}

function isInvitacionPendiente(miembro: Miembro): boolean {
  return miembro.joined_at === null && miembro.invited_at !== null;
}

function isInteractiveRowTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest("button, a, input, textarea, select, [role='button']"));
}

function formatFecha(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("es-ES");
}

export function TeamManager({
  organizacionId: _organizacionId,
  miembros: miembrosIniciales,
  isAdmin,
}: TeamManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [miembros, setMiembros] = useState<Miembro[]>(miembrosIniciales);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Miembro | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRol, setInviteRol] = useState<"admin" | "miembro">("miembro");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const miembrosOrdenados = useMemo(() => {
    return [...miembros].sort((a, b) => {
      const aPendiente = isInvitacionPendiente(a);
      const bPendiente = isInvitacionPendiente(b);

      if (aPendiente !== bPendiente) {
        return aPendiente ? 1 : -1;
      }

      const fechaA = new Date(a.joined_at ?? a.invited_at ?? a.created_at).getTime();
      const fechaB = new Date(b.joined_at ?? b.invited_at ?? b.created_at).getTime();

      return fechaA - fechaB;
    });
  }, [miembros]);

  async function handleChangeRol(miembroId: string, nuevoRol: Miembro["rol"]) {
    setActionError(null);
    setUpdatingMemberId(miembroId);

    const { error } = await supabase
      .from("miembros_equipo")
      .update({ rol: nuevoRol })
      .eq("id", miembroId);

    if (!error) {
      setMiembros((prev) =>
        prev.map((m) => (m.id === miembroId ? { ...m, rol: nuevoRol } : m))
      );
      setSelectedMember((prev) =>
        prev?.id === miembroId ? { ...prev, rol: nuevoRol } : prev
      );
    } else {
      setActionError("No se pudo actualizar el rol del miembro. Inténtalo de nuevo.");
    }

    setUpdatingMemberId(null);
  }

  async function handleToggleActivo(miembro: Miembro) {
    const siguienteEstado = !miembro.activo;

    setActionError(null);
    setUpdatingMemberId(miembro.id);

    setMiembros((prev) =>
      prev.map((m) => (m.id === miembro.id ? { ...m, activo: siguienteEstado } : m))
    );
    setSelectedMember((prev) =>
      prev?.id === miembro.id ? { ...prev, activo: siguienteEstado } : prev
    );

    try {
      const response = await fetch("/api/team/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: miembro.id, activo: siguienteEstado }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        member?: { activo?: boolean };
      };

      if (!response.ok) {
        throw new Error(
          data.error ?? "No se pudo actualizar el estado del miembro. Inténtalo de nuevo."
        );
      }

      const estadoConfirmado =
        typeof data.member?.activo === "boolean" ? data.member.activo : siguienteEstado;

      setMiembros((prev) =>
        prev.map((m) => (m.id === miembro.id ? { ...m, activo: estadoConfirmado } : m))
      );
      setSelectedMember((prev) =>
        prev?.id === miembro.id ? { ...prev, activo: estadoConfirmado } : prev
      );

      toast.success("Estado del miembro actualizado");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado del miembro. Inténtalo de nuevo.";

      setMiembros((prev) =>
        prev.map((m) => (m.id === miembro.id ? { ...m, activo: miembro.activo } : m))
      );
      setSelectedMember((prev) =>
        prev?.id === miembro.id ? { ...prev, activo: miembro.activo } : prev
      );

      setActionError(message);
      toast.error(message);
    }

    setUpdatingMemberId(null);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), rol: inviteRol }),
      });
      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error ?? "Error al enviar la invitación.");
      } else {
        setInviteSuccess(`Invitación enviada a ${inviteEmail.trim()}`);
        setInviteEmail("");
        router.refresh();
      }
    } catch {
      setInviteError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Cargo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Alta / invitación
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {miembrosOrdenados.map((m) => {
              const invitacionPendiente = isInvitacionPendiente(m);
              const nombreMostrado =
                m.nombre_completo?.trim() ||
                (invitacionPendiente ? "Invitado pendiente" : "—");
              const fechaReferencia =
                (invitacionPendiente ? m.invited_at : m.joined_at) ?? m.created_at;

              return (
                <tr
                  key={m.id}
                  onClick={(event) => {
                    if (isInteractiveRowTarget(event.target)) {
                      return;
                    }

                    setSelectedMember(m);
                  }}
                  onKeyDown={(event) => {
                    if (isInteractiveRowTarget(event.target)) {
                      return;
                    }

                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedMember(m);
                    }
                  }}
                  tabIndex={0}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-leadby-500/40"
                >
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {nombreMostrado}
                  </p>
                  {invitacionPendiente && (
                    <span className="mt-1 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300">
                      Invitación pendiente
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {invitacionPendiente ? "—" : m.cargo || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      m.rol === "admin"
                        ? "bg-leadby-500/10 text-leadby-600 border border-leadby-500/20"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {m.rol === "admin" ? "Admin" : "Miembro"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      m.activo
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {m.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                  {formatFecha(fechaReferencia)}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={m.rol}
                        onChange={(e) => handleChangeRol(m.id, e.target.value as Miembro["rol"])}
                        disabled={updatingMemberId === m.id}
                        className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-leadby-500/30 focus:border-leadby-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-60"
                      >
                        <option value="miembro">Miembro</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => handleToggleActivo(m)}
                        disabled={updatingMemberId === m.id}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-colors disabled:opacity-60 ${
                          m.activo
                            ? "text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                            : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                        }`}
                      >
                        {updatingMemberId === m.id
                          ? "Actualizando..."
                          : m.activo
                          ? "Desactivar"
                          : "Activar"}
                      </button>
                    </div>
                  </td>
                )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {actionError && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800/50 rounded-lg px-4 py-2">
          {actionError}
        </p>
      )}

      {isAdmin && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Invitar a un nuevo miembro
            </h3>
          </div>

          <form onSubmit={handleInvite} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                required
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leadby-500/30 focus:border-leadby-500 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Rol
              </label>
              <select
                value={inviteRol}
                onChange={(e) => setInviteRol(e.target.value as "admin" | "miembro")}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leadby-500/30 focus:border-leadby-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="miembro">Miembro</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={inviting}
              className="bg-leadby-500 hover:bg-leadby-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-60 flex-shrink-0"
            >
              {inviting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Enviar invitación
            </button>
          </form>

          {inviteError && (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800/50 rounded-lg px-4 py-2">
              {inviteError}
            </p>
          )}
          {inviteSuccess && (
            <p className="mt-3 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-800/50 rounded-lg px-4 py-2">
              {inviteSuccess}
            </p>
          )}
        </div>
      )}

      <MemberDetailsModal member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
}
