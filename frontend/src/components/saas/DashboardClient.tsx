"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Link from "next/link";
import { Search, Users, Send, TrendingUp } from "lucide-react";

interface DashboardClientProps {
  orgName: string | null;
  plan: string;
  totalLeads: number;
  leadsEnviados: number;
  leadsPendientes: number;
}

interface Metrica {
  label: string;
  valor: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export function DashboardClient({
  orgName,
  plan,
  totalLeads,
  leadsEnviados,
  leadsPendientes,
}: DashboardClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const METRICAS: Metrica[] = [
    {
      label: "Total leads",
      valor: totalLeads,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Correos enviados",
      valor: leadsEnviados,
      icon: Send,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/40",
    },
    {
      label: "Pendientes de aprobación",
      valor: leadsPendientes,
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Header fades in
        tl.from(".dash-header", {
          y: 16,
          autoAlpha: 0,
          duration: 0.45,
        });

        // Metric cards stagger in
        tl.from(
          ".dash-metric-card",
          {
            y: 24,
            autoAlpha: 0,
            stagger: 0.1,
            duration: 0.5,
          },
          "-=0.25"
        );

        // Count-up for each metric number
        const countEls =
          containerRef.current?.querySelectorAll<HTMLElement>(".dash-count");
        countEls?.forEach((el) => {
          const target = parseInt(el.dataset.target ?? "0", 10);
          if (target === 0) return;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.4,
            onUpdate: () => {
              el.textContent = String(Math.round(obj.val));
            },
          });
        });

        // Quick actions fade in
        tl.from(
          ".dash-actions",
          {
            y: 16,
            autoAlpha: 0,
            duration: 0.45,
          },
          "-=0.2"
        );

        tl.from(
          ".dash-action-item",
          {
            x: -12,
            autoAlpha: 0,
            stagger: 0.08,
            duration: 0.4,
          },
          "-=0.25"
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="p-8">
      {/* Header */}
      <div className="dash-header mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bienvenido de nuevo{orgName ? `, ${orgName}` : ""}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Plan: <span className="capitalize font-medium">{plan}</span>
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {METRICAS.map(({ label, valor, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="dash-metric-card bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {label}
              </span>
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <p
              className="dash-count text-3xl font-bold text-gray-900 dark:text-white"
              data-target={valor}
            >
              {valor}
            </p>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="dash-actions bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/prospecting"
            className="dash-action-item flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                Nueva búsqueda
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Encuentra nuevos leads B2B
              </p>
            </div>
          </Link>

          <Link
            href="/leads?tab=pendientes"
            className="dash-action-item flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors group"
          >
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/50 rounded-lg flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
              <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                Revisar borradores
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {leadsPendientes} correos esperando tu aprobación
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
