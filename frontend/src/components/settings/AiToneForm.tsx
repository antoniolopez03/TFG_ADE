"use client";

/**
 * AiToneForm
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

const IDIOMAS = [
  { label: "Español", value: "es" },
  { label: "Inglés",  value: "en" },
  { label: "Alemán",  value: "de" },
];

const INPUT_CLASS =
  "border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leadby-500/30 focus:border-leadby-500 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-500 dark:disabled:text-gray-500";

interface AiToneFormProps {
  organizacionId: string;
  tonoVoz:        string;
  idioma:         string;
  isAdmin:        boolean;
}

export function AiToneForm({
  organizacionId,
  tonoVoz,
  idioma,
  isAdmin,
}: AiToneFormProps) {
  const supabase        = createClient();
  const [tono,          setTono]         = useState(tonoVoz);
  const [idiomaValue,   setIdiomaValue]  = useState(idioma || "es");
  const [loading,       setLoading]      = useState(false);
  const [saved,         setSaved]        = useState(false);
  const [error,         setError]        = useState<string | null>(null);

  // Ref for the check icon wrapper — GSAP targets this
  const checkRef = useRef<HTMLSpanElement>(null);

  // Animate check icon whenever `saved` becomes true
  useGSAP(
    () => {
      if (!saved || !checkRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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
        gsap.set(checkRef.current, { scale: 1, rotation: 0 });
      });

      return () => mm.revert();
    },
    { dependencies: [saved] }
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: upsertError } = await supabase
      .from("configuracion_tenant")
      .upsert(
        {
          organizacion_id: organizacionId,
          preferencias_ia: { tono_voz: tono.trim(), idioma: idiomaValue },
        },
        { onConflict: "organizacion_id" }
      );

    setLoading(false);

    if (upsertError) {
      setError("Error al guardar las preferencias. Inténtalo de nuevo.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Tono de voz */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Tono de voz corporativo
        </label>
        <textarea
          value={tono}
          onChange={(e) => setTono(e.target.value)}
          disabled={!isAdmin}
          rows={4}
          placeholder="Ej: Tono técnico y directo, sin anglicismos. Siempre mencionar casos de éxito en el sector. Evitar promesas vagas."
          className={`${INPUT_CLASS} resize-none`}
        />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Gemini usará estas instrucciones para generar todos los correos.
        </p>
      </div>

      {/* Idioma */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Idioma de los correos
        </label>
        <select
          value={idiomaValue}
          onChange={(e) => setIdiomaValue(e.target.value)}
          disabled={!isAdmin}
          className={INPUT_CLASS}
        >
          {IDIOMAS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
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
              <span ref={checkRef} className="inline-flex" style={{ transformOrigin: "center" }}>
                <Check className="w-4 h-4" />
              </span>
              Guardado
            </>
          ) : (
            "Guardar preferencias IA"
          )}
        </button>
      )}
    </form>
  );
}
