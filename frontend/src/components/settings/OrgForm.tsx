"use client";

/**
 * OrgForm
 *
 * Phase 8 additions:
 * – GSAP success animation on the Check icon: scale + elastic bounce
 *   when `saved` transitions to true.
 * – gsap.matchMedia() so reduced-motion users see the icon appear instantly.
 * – All other logic is unchanged.
 */

import "@/lib/gsap/register";
import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PLAN_BADGE: Record<string, string> = {
  free:    "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  starter: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  pro:     "bg-leadby-500/10 text-leadby-600 border border-leadby-500/20",
};

const INPUT_CLASS =
  "border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leadby-500/30 focus:border-leadby-500 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-500 dark:disabled:text-gray-500";

interface OrgFormProps {
  organizacionId: string;
  nombre:         string;
  plan:           string;
  isAdmin:        boolean;
}

export function OrgForm({ organizacionId, nombre, plan, isAdmin }: OrgFormProps) {
  const supabase      = createClient();
  const [nombreValue, setNombreValue] = useState(nombre);
  const [nif,         setNif]         = useState("");
  const [loading,     setLoading]     = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Ref for the check icon wrapper — GSAP targets this
  const checkRef = useRef<HTMLSpanElement>(null);

  // Animate check icon whenever `saved` becomes true
  useGSAP(
    () => {
      if (!saved || !checkRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Bounce in from scale 0 with overshoot
        gsap.fromTo(
          checkRef.current,
          { scale: 0, rotation: -30 },
          {
            scale: 1,
            rotation: 0,
            duration: 0.45,
            ease: "back.out(2)",
          }
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // Just show it — no motion
        gsap.set(checkRef.current, { scale: 1, rotation: 0 });
      });

      return () => mm.revert();
    },
    { dependencies: [saved] }
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nombreValue.trim()) {
      setError("El nombre de la organización es obligatorio.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("organizaciones")
      .update({ nombre: nombreValue.trim() })
      .eq("id", organizacionId);

    setLoading(false);

    if (updateError) {
      setError("Error al guardar los cambios. Inténtalo de nuevo.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Nombre de la organización
        </label>
        <input
          type="text"
          value={nombreValue}
          onChange={(e) => setNombreValue(e.target.value)}
          disabled={!isAdmin}
          required
          className={INPUT_CLASS}
        />
      </div>

      {/* NIF/CIF */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          NIF / CIF
        </label>
        <input
          type="text"
          value={nif}
          onChange={(e) => setNif(e.target.value)}
          disabled={!isAdmin}
          placeholder="B12345678"
          className={INPUT_CLASS}
        />
      </div>

      {/* Plan activo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Plan activo
        </label>
        <div>
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              PLAN_BADGE[plan] ?? PLAN_BADGE.free
            }`}
          >
            {plan}
          </span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800/50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {isAdmin && (
        <button
          type="submit"
          disabled={loading}
          className="bg-leadby-500 hover:bg-leadby-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : saved ? (
            <>
              {/* Wrapper gives GSAP a stable DOM node to target */}
              <span ref={checkRef} className="inline-flex" style={{ transformOrigin: "center" }}>
                <Check className="w-4 h-4" />
              </span>
              Guardado
            </>
          ) : (
            "Guardar cambios"
          )}
        </button>
      )}
    </form>
  );
}
