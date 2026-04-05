"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { label: "Organización", value: "organizacion" },
  { label: "CRM", value: "crm" },
  { label: "IA", value: "ia" },
  { label: "Equipo", value: "equipo" },
] as const;

export type SettingsTab = (typeof TABS)[number]["value"];

interface SettingsTabsProps {
  activeTab: SettingsTab;
}

export function SettingsTabs({ activeTab }: SettingsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-0 border-b border-gray-100 dark:border-gray-800 mb-6">
      {TABS.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            onClick={() => setTab(tab.value)}
            className={`px-5 py-3 text-sm font-medium transition-colors relative ${
              isActive
                ? "text-leadby-500 border-b-2 border-leadby-500 -mb-px"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
