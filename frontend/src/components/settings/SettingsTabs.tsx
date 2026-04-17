"use client";

/**
 * SettingsTabs
 *
 * Tab navigation for the Settings page with a GSAP animated sliding indicator:
 * – On first render:  gsap.set() positions the indicator instantly (no flash).
 * – On tab change:    gsap.to() slides the indicator to the new tab.
 * – gsap.matchMedia() respects prefers-reduced-motion (instant on reduce).
 * – overwrite: true kills any in-flight tween before starting the new one.
 */

import "@/lib/gsap/register";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { label: "Organización", value: "organizacion" },
  { label: "CRM",          value: "crm"          },
  { label: "IA",           value: "ia"            },
  { label: "Equipo",       value: "equipo"        },
] as const;

export type SettingsTab = (typeof TABS)[number]["value"];

interface SettingsTabsProps {
  activeTab: SettingsTab;
}

export function SettingsTabs({ activeTab }: SettingsTabsProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const containerRef  = useRef<HTMLDivElement>(null);
  const indicatorRef  = useRef<HTMLDivElement>(null);
  // Track whether the indicator has been positioned for the first time
  const hasInitRef    = useRef(false);

  function setTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  // Re-runs whenever activeTab changes; positions / animates the indicator
  useGSAP(
    () => {
      if (!containerRef.current || !indicatorRef.current) return;

      const btn = containerRef.current.querySelector<HTMLButtonElement>(
        `[data-tab="${activeTab}"]`
      );
      if (!btn) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const btnRect       = btn.getBoundingClientRect();
      const targetX       = btnRect.left - containerRect.left;
      const targetW       = btnRect.width;

      if (!hasInitRef.current) {
        // First render — instant, no animation
        gsap.set(indicatorRef.current, { x: targetX, width: targetW });
        hasInitRef.current = true;
        return;
      }

      // Subsequent tab changes — animate with reduced-motion awareness
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(indicatorRef.current, {
          x: targetX,
          width: targetW,
          duration: 0.32,
          ease: "power2.inOut",
          overwrite: true, // Kill any in-flight tween on the indicator
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(indicatorRef.current, { x: targetX, width: targetW });
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [activeTab] }
  );

  return (
    <div
      ref={containerRef}
      className="settings-reveal relative flex flex-shrink-0 items-center gap-0 border-b border-gray-100 dark:border-gray-800 mb-6"
    >
      {/* Sliding orange indicator line */}
      <div
        ref={indicatorRef}
        className="absolute bottom-0 h-0.5 bg-leadby-500 pointer-events-none -mb-px"
        style={{ width: 0, transform: "translateX(0)" }}
        aria-hidden="true"
      />

      {TABS.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            data-tab={tab.value}
            onClick={() => setTab(tab.value)}
            aria-current={isActive ? "page" : undefined}
            className={[
              "px-5 py-3 text-sm font-medium transition-colors relative flex-shrink-0",
              isActive
                ? "text-leadby-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
