"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Search,
  Building2,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { Magnetic } from "@/lib/animations/magnetic";
import { ProspectingAnimation } from "./ProspectingAnimation";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTOR_CHIPS = [
  "Maquinaria industrial",
  "Hidráulica",
  "CNC / Mecanizado",
  "Logística",
  "Automoción",
  "Metalurgia",
] as const;

const TAMANO_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

/** Animated stepper shown while the search API request is in-flight. */
const SEARCH_STEPS = [
  { icon: Radio,             label: "Contactando Apollo.io…" },
  { icon: SlidersHorizontal, label: "Filtrando duplicados…" },
  { icon: Sparkles,          label: "Preparando borradores con IA…" },
  { icon: CheckCircle2,      label: "¡Leads listos!" },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ManualSearchFormProps {
  organizacionId?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ManualSearchForm({ organizacionId }: ManualSearchFormProps) {
  const router       = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);
  const progressTween = useRef<gsap.core.Tween | null>(null);
  const stepTimers    = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [sector,        setSector]        = useState("");
  const [ubicacion,     setUbicacion]     = useState("");
  const [tamano,        setTamano]        = useState("");
  const [loading,       setLoading]       = useState(false);
  const [searchStep,    setSearchStep]    = useState(-1);   // -1 = idle
  const [error,         setError]         = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [jobComplete,   setJobComplete]   = useState(false);

  // ── Animate progress bar with GSAP scaleX on step change ─────────────────
  useEffect(() => {
    if (!progressRef.current || searchStep < 0) return;

    /*
     * gsap-performance: use scaleX + transformOrigin instead of width.
     * This keeps the animation on the compositor thread and avoids layout.
     */
    progressTween.current?.kill();
    progressTween.current = gsap.to(progressRef.current, {
      scaleX: (searchStep + 1) / SEARCH_STEPS.length,
      duration: 0.45,
      ease: "power2.out",
      transformOrigin: "left center",
    });

    return () => {
      progressTween.current?.kill();
    };
  }, [searchStep]);

  // ── GSAP entrance animation ───────────────────────────────────────────────
  useGSAP(
    () => {
      /*
       * gsap.utils.selector scopes all selectors to this component's DOM.
       * gsap-react best practice: always scope selectors.
       */
      const q  = gsap.utils.selector(containerRef);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Set hidden synchronously before first paint
        gsap.set(
          [q(".sf-heading"), q(".sf-field"), q(".sf-chips"), q(".sf-submit")],
          { autoAlpha: 0, y: 16 }
        );

        /*
         * gsap-timeline: pass defaults into constructor + use addLabel
         * for readable, maintainable sequencing.
         * gsap-utils: distribute for organic chip stagger.
         */
        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.45 },
        });

        tl.addLabel("enter", 0)
          .to(q(".sf-heading"), { autoAlpha: 1, y: 0 }, "enter")
          .to(
            q(".sf-field"),
            {
              autoAlpha: 1,
              y: 0,
              stagger: gsap.utils.distribute({ from: "start", each: 0.1 }),
            },
            "enter+=0.15"
          )
          .to(
            q(".sf-chip"),
            {
              autoAlpha: 1,
              y: 0,
              stagger: gsap.utils.distribute({
                from: "start",
                each: 0.055,
                ease: "power1.out",
              }),
            },
            "enter+=0.3"
          )
          .to(
            q(".sf-submit"),
            { autoAlpha: 1, y: 0, ease: "back.out(1.4)" },
            "enter+=0.52"
          );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [q(".sf-heading"), q(".sf-field"), q(".sf-chips"), q(".sf-submit")],
          { autoAlpha: 1, clearProps: "transform" }
        );
      });
    },
    { scope: containerRef }
  );

  // ── Cleanup timers on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stepTimers.current.forEach(clearTimeout);
    };
  }, []);

  // ── Submit handler ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!sector.trim() || !ubicacion.trim()) {
      setError("Completa sector y ubicación antes de buscar.");
      return;
    }

    // Clear previous timers + reset state
    stepTimers.current.forEach(clearTimeout);
    stepTimers.current = [];

    setLoading(true);
    setError(null);
    setSearchStep(0);
    setShowAnimation(true);
    setJobComplete(false);

    // Advance stepper steps while the API is in-flight (visible behind overlay)
    stepTimers.current.push(
      setTimeout(() => setSearchStep(1), 1400),
      setTimeout(() => setSearchStep(2), 2800)
    );

    try {
      const res = await fetch("/api/prospecting/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizacion_id: organizacionId ?? undefined,
          tipo:            "apollo_search",
          sector:          sector.trim(),
          ubicacion:       ubicacion.trim(),
          tamano:          tamano || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ??
            "Error al iniciar la búsqueda. Inténtalo de nuevo."
        );
      }

      // Signal the animation overlay that the job is ready
      stepTimers.current.forEach(clearTimeout);
      setSearchStep(SEARCH_STEPS.length - 1);
      setJobComplete(true);
      // Navigation is handled by ProspectingAnimation's onComplete
    } catch (err) {
      stepTimers.current.forEach(clearTimeout);
      setShowAnimation(false);
      setError(err instanceof Error ? err.message : "Error de conexión.");
      setSearchStep(-1);
    } finally {
      setLoading(false);
    }
  }

  const isRunning = loading && searchStep >= 0;

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {/* ── Heading ──────────────────────────────────────────────────── */}
      <div className="sf-heading mb-5">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
          Búsqueda Manual
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Define sector, ubicación y tamaño para encontrar empresas y decisores.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-4">

        {/* ── Fields ───────────────────────────────────────────────────── */}
        <div className="sf-field grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Sector */}
          <div>
            <label
              htmlFor="ms-sector"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Sector / tipo de negocio
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                id="ms-sector"
                type="text"
                required
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Ej: metalurgia, logística"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent pl-9 pr-4 py-2.5 text-sm transition-all placeholder:text-gray-400/60 focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/25 dark:text-white"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label
              htmlFor="ms-ubicacion"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Ubicación
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                id="ms-ubicacion"
                type="text"
                required
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej: Madrid, España"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent pl-9 pr-4 py-2.5 text-sm transition-all placeholder:text-gray-400/60 focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/25 dark:text-white"
              />
            </div>
          </div>

          {/* Tamaño */}
          <div>
            <label
              htmlFor="ms-tamano"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Tamaño{" "}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <select
              id="ms-tamano"
              value={tamano}
              onChange={(e) => setTamano(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm transition-all focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/25 dark:text-white"
            >
              <option value="">Sin filtro</option>
              {TAMANO_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Quick suggestion chips ────────────────────────────────────── */}
        <div className="sf-chips flex flex-wrap gap-2">
          <span className="text-[11px] text-gray-400 dark:text-gray-500 self-center mr-1">
            Sugerencias:
          </span>
          {SECTOR_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setSector(chip)}
              className={[
                "sf-chip rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-150",
                sector === chip
                  ? "border-leadby-500 bg-leadby-500/10 text-leadby-600 dark:text-leadby-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-leadby-500/40 hover:text-leadby-500",
              ].join(" ")}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* ── Error — framer-motion slide-down ─────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="ms-error"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={  { opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <p className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/30 px-4 py-3 text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Animated stepper (loading state) ─────────────────────────── */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              key="ms-stepper"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={  { opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-5 py-4 space-y-3"
            >
              {/* Steps */}
              <div className="space-y-2">
                {SEARCH_STEPS.map((step, i) => {
                  const Icon      = step.icon;
                  const isActive  = searchStep === i;
                  const isDone    = searchStep > i;

                  return (
                    <motion.div
                      key={i}
                      className={[
                        "flex items-center gap-2.5 text-xs transition-colors",
                        isDone   ? "text-emerald-600 dark:text-emerald-400"
                        : isActive ? "font-medium text-leadby-500"
                        : "text-gray-400 dark:text-gray-500",
                      ].join(" ")}
                      animate={{
                        opacity: isDone || isActive ? 1 : 0.4,
                        x: isActive ? [0, 2, 0] : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin" />
                      ) : (
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span>
                        {i + 1}. {step.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress bar — GSAP scaleX (compositor-only, no layout) */}
              <div className="h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  ref={progressRef}
                  className="h-full origin-left rounded-full bg-leadby-gradient"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Submit + info note ───────────────────────────────────────── */}
        <div className="sf-submit mt-auto flex flex-col gap-3">
          {/* Info note — moved above the CTA per design spec */}
          <p className="text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
            LeadBy analiza tu sector con IA y genera una lista de empresas y
            decisores relevantes. Los resultados aparecen en tu bandeja listos
            para revisión.
          </p>
          <Magnetic strength={0.12}>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-leadby-gradient px-4 py-3 text-sm font-semibold text-white shadow-leadby transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 animate-glow-pulse cursor-magnetic group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando decisores…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Search className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                  Iniciar búsqueda
                </span>
              )}
            </button>
          </Magnetic>
        </div>
      </form>

      {/* Animation overlay — mounts when search starts, navigates on complete */}
      {showAnimation && (
        <ProspectingAnimation
          isJobComplete={jobComplete}
          onComplete={() => router.push("/leads")}
        />
      )}
    </div>
  );
}
