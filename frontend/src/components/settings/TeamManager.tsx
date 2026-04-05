"use client";

import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Miembro {
  id: string;
  user_id: string;
  nombre_completo: string | null;
  cargo: string | null;
  rol: string;
  activo: boolean;
  created_at: string;
}

interface TeamManagerProps {
  organizacionId: string;
  miembros: Miembro[];
  isAdmin: boolean;
}

export function TeamManager({
  organizacionId: _organizacionId,
  miembros: miembrosIniciales,
  isAdmin,
}: TeamManagerProps) {
  const supabase = createClient();
  const [miembros, setMiembros] = useState<Miembro[]>(miembrosIniciales);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRol, setInviteRol] = useState<"admin" | "miembro">("miembro");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  async function handleChangeRol(miembroId: string, nuevoRol: string) {
    const { error } = await supabase
      .from("miembros_equipo")
      .update({ rol: nuevoRol })
      .eq("id", miembroId);

    if (!error) {
      setMiembros((prev) =>
        prev.map((m) => (m.id === miembroId ? { ...m, rol: nuevoRol } : m))
      );
    }
  }

  async function handleToggleActivo(miembroId: string, activo: boolean) {
    const { error } = await supabase
      .from("miembros_equipo")
      .update({ activo: !activo })
      .eq("id", miembroId);

    if (!error) {
      setMiembros((prev) =>
        prev.map((m) =>
          m.id === miembroId ? { ...m, activo: !activo } : m
        )
      );
    }
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
      }
    } catch {
      setInviteError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabla de miembros */}
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
                Alta
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {miembros.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {m.nombre_completo || "—"}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {m.cargo || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      m.rol === "admin"
                        ? "bg-leadby-500/10 text-leadby-600 border border-leadby-500/20"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {m.rol}
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
                  {new Date(m.created_at).toLocaleDateString("es-ES")}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={m.rol}
                        onChange={(e) => handleChangeRol(m.id, e.target.value)}
                        className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-leadby-500/30 focus:border-leadby-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="miembro">miembro</option>
                        <option value="admin">admin</option>
                      </select>
                      <button
                        onClick={() => handleToggleActivo(m.id, m.activo)}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                          m.activo
                            ? "text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                            : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                        }`}
                      >
                        {m.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulario de invitación */}
      {isAdmin && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Invitar nuevo miembro
            </h3>
          </div>
          <form onSubmit={handleInvite} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
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
                onChange={(e) =>
                  setInviteRol(e.target.value as "admin" | "miembro")
                }
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leadby-500/30 focus:border-leadby-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="miembro">miembro</option>
                <option value="admin">admin</option>
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
    </div>
  );
}
