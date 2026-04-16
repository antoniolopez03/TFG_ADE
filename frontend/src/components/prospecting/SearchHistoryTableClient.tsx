"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HistorialItem {
  grupoId: string;
  fecha: string;
  fuente: string;
  total: number;
  estados: Record<string, number>;
}

interface SearchHistoryTableClientProps {
  historial: HistorialItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchHistoryTableClient({
  historial,
}: SearchHistoryTableClientProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // ── GSAP ScrollTrigger fade-in when table enters viewport ────────────────
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /*
         * gsap-performance: animate autoAlpha + y (opacity + transform only).
         * gsap.from sets the start state synchronously (via useLayoutEffect),
         * so the element is invisible before the first browser paint on the
         * client — no flash of unstyled content.
         */
        gsap.from(containerRef.current, {
          autoAlpha: 0,
          y: 24,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 88%",
            once: true,
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(containerRef.current, { autoAlpha: 1, clearProps: "transform" });
      });
    },
    { scope: containerRef }
  );

  return (
    /*
     * gsap-performance: will-change: transform hints the browser to promote
     * this layer ahead of the entrance animation.
     */
    <div
      ref={containerRef}
      style={{ willChange: "transform" }}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Fecha
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Fuente
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Leads encontrados
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Estado general
            </th>
            {/* Spacer column for the arrow icon */}
            <th className="w-8 px-4 py-3" aria-hidden="true" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
          {historial.map(({ grupoId, fecha, fuente, total, estados }) => {
            const enviados = estados["enviado"] ?? 0;
            const pendientes = estados["pendiente_aprobacion"] ?? 0;
            const nuevos = estados["nuevo"] ?? 0;

            return (
              <tr
                key={grupoId}
                className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() =>
                  router.push(
                    `/leads?job_id=${encodeURIComponent(grupoId)}`
                  )
                }
              >
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(fecha).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {fuente}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {total}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 ml-1 text-xs">
                    leads
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {enviados > 0 && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {enviados} enviados
                      </span>
                    )}
                    {pendientes > 0 && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        {pendientes} pendientes
                      </span>
                    )}
                    {nuevos > 0 && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300">
                        {nuevos} nuevos
                      </span>
                    )}
                    {enviados === 0 && pendientes === 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        En proceso
                      </span>
                    )}
                  </div>
                </td>
                {/* Arrow — visible only on row hover */}
                <td className="px-4 py-3 text-right">
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity inline-block" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
