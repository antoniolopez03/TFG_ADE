"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProspectingAnimation } from "./ProspectingAnimation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  CheckCircle,
  CheckCircle2,
  Database,
  Brain,
  Zap,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Magnetic } from "@/lib/animations/magnetic";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FASES = [
  { icon: Database, label: "Analizando tus éxitos en HubSpot" },
  { icon: Brain,    label: "Definiendo tu Perfil de Cliente Ideal" },
  { icon: Zap,      label: "Localizando nuevas empresas en el mercado" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function LookalikeTrigger() {
  const router        = useRouter();
  const containerRef  = useRef<HTMLDivElement>(null);
  const progressRef   = useRef<HTMLDivElement>(null);
  const progressTween = useRef<gsap.core.Tween | null>(null);

  const [fase, setFase] = useState<number>(-1);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<{
    totalResultados: number;
    terminos: string[];
    fallbackUsed: boolean;
  } | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [jobComplete,   setJobComplete]   = useState(false);

  // ── GSAP entrance animation ───────────────────────────────────────────────
  useGSAP(
    () => {
      const q  = gsap.utils.selector(containerRef);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set([q(".lt-header"), q(".lt-step"), q(".lt-btn")], {
          autoAlpha: 0,
          y: 14,
        });

        /*
         * Timeline with defaults + labels.
         * gsap-timeline: put ScrollTrigger on top-level only — steps use
         * entry animation without ST since they're always visible.
         */
        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.42 },
        });

        tl.addLabel("enter", 0)
          .to(q(".lt-header"), { autoAlpha: 1, y: 0 }, "enter")
          .to(
            q(".lt-step"),
            {
              autoAlpha: 1,
              y: 0,
              stagger: gsap.utils.distribute({ from: "start", each: 0.1 }),
            },
            "enter+=0.15"
          )
          .to(q(".lt-btn"), { autoAlpha: 1, y: 0, ease: "back.out(1.4)" }, "enter+=0.45");
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [q(".lt-header"), q(".lt-step"), q(".lt-btn")],
          { autoAlpha: 1, clearProps: "transform" }
        );
      });
    },
    { scope: containerRef }
  );

  // ── Animate progress bar with GSAP scaleX ────────────────────────────────
  useEffect(() => {
    if (!progressRef.current || fase < 0) return;

    const progress = done
      ? 1
      : Math.min((fase + 1) / FASES.length, 1);

    progressTween.current?.kill();
    progressTween.current = gsap.to(progressRef.current, {
      scaleX: progress,
      duration: 0.5,
      ease: "power2.out",
      transformOrigin: "left center",
    });

    return () => {
      progressTween.current?.kill();
    };
  }, [fase, done]);

  // ── Step advancement while API is in-flight ───────────────────────────────
  useEffect(() => {
    if (fase < 0 || done) return;
    if (fase >= FASES.length - 1) return; // hold at last step

    const timer = setTimeout(
      () => setFase((f) => Math.min(f + 1, FASES.length - 1)),
      1300
    );
    return () => clearTimeout(timer);
  }, [fase, done]);

  // ── API call ──────────────────────────────────────────────────────────────
  async function handleClick() {
    if (fase >= 0) return;

    setFase(0);
    setError(null);
    setDone(false);
    setResumen(null);
    setShowAnimation(true);
    setJobComplete(false);

    try {
      const res  = await fetch("/api/prospecting/lookalike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Error al iniciar el análisis.");
        setFase(-1);
        setShowAnimation(false);
        return;
      }

      setResumen({
        totalResultados:
          typeof (data as { total_resultados?: number }).total_resultados === "number"
            ? (data as { total_resultados: number }).total_resultados
            : 0,
        terminos: Array.isArray((data as { terminos?: unknown[] }).terminos)
          ? (data as { terminos: unknown[] }).terminos.filter(
              (t): t is string => typeof t === "string"
            )
          : [],
        fallbackUsed: Boolean((data as { fallback_used?: boolean }).fallback_used),
      });

      setFase(FASES.length);
      setDone(true);
      // Signal animation that the job is done; navigation handled by onComplete
      setJobComplete(true);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setFase(-1);
      setShowAnimation(false);
    }
  }

  const isRunning = fase >= 0 && !done;

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col gap-5 rounded-xl border border-leadby-500/20 bg-leadby-500/5 p-6"
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="lt-header flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-leadby-500/10">
          <Sparkles className="h-5 w-5 text-leadby-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Búsqueda Inteligente por Similitud
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            LeadBy analiza tus mejores clientes en HubSpot para entender qué
            empresas te funcionan mejor y encontrar otras similares.
          </p>
        </div>
      </div>

      {/* ── Phase steps ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        {FASES.map((f, i) => {
          const Icon      = f.icon;
          const isActive  = !done && fase === i;
          const completed = done || fase > i;

          return (
            <motion.div
              key={i}
              className={[
                "lt-step flex items-center gap-2.5 text-xs transition-colors",
                completed ? "text-emerald-600 dark:text-emerald-400"
                : isActive ? "font-medium text-leadby-500"
                : "text-gray-400 dark:text-gray-500",
              ].join(" ")}
              animate={{ opacity: completed || isActive ? 1 : 0.45 }}
              transition={{ duration: 0.3 }}
            >
              {completed ? (
                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin" />
              ) : (
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              <span>
                {i + 1}. {f.label}
                {completed ? " ✓" : isActive ? "…" : ""}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* ── Progress bar (GSAP scaleX) ────────────────────────────────── */}
      <AnimatePresence>
        {(isRunning || done) && (
          <motion.div
            key="lt-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
          >
            <div
              ref={progressRef}
              className="h-full origin-left rounded-full bg-leadby-gradient"
              style={{ transform: "scaleX(0)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success result ────────────────────────────────────────────── */}
      <AnimatePresence>
        {done && (
          <motion.div
            key="lt-success"
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={  { opacity: 0, scale: 0.96,  y: 6 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs dark:border-emerald-800/50 dark:bg-emerald-950/30"
          >
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>
                ¡Análisis completado! {resumen?.totalResultados ?? 0} leads generados
                {resumen?.fallbackUsed ? " (modo fallback IA)" : ""}.
              </span>
            </div>
            <Link
              href="/leads"
              className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors whitespace-nowrap"
            >
              Ver leads <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="lt-error"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0,  height: "auto" }}
            exit={  { opacity: 0, y: -6,  height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CTA button ────────────────────────────────────────────────── */}
      {!done && (
        <div className="lt-btn mt-auto">
          <Magnetic strength={0.12}>
            <button
              onClick={handleClick}
              disabled={isRunning}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-leadby-gradient py-3 text-sm font-semibold text-white shadow-leadby transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 animate-glow-pulse cursor-magnetic"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analizando…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Buscar clientes similares con IA
                </>
              )}
            </button>
          </Magnetic>
        </div>
      )}

      {/* Animation overlay — mounts when analysis starts, navigates on complete */}
      {showAnimation && (
        <ProspectingAnimation
          isJobComplete={jobComplete}
          onComplete={() => router.push("/leads")}
        />
      )}
    </div>
  );
}
