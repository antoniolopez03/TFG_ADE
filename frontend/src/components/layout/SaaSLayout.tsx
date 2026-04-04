"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { HeaderSaaS } from "@/components/layout/HeaderSaaS";

export function SaaSLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar — drawer with overlay */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <HeaderSaaS onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
