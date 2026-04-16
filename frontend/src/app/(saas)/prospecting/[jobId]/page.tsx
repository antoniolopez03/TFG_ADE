"use client";

import Link from "next/link";
import { Info, ArrowRight } from "lucide-react";

export default function JobStatusPage() {
  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link href="/prospecting" className="text-sm text-gray-500 hover:text-gray-700">
          ← Nueva búsqueda
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-4 text-sky-700">
          <Info className="w-5 h-5" />
          <p className="font-semibold text-sm">Flujo de búsqueda actualizado</p>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          La prospección ahora es síncrona: los leads se generan directamente y puedes revisarlos
          de inmediato en la bandeja, sin tabla intermedia de trabajos.
        </p>

        <Link
          href="/leads?tab=pendientes"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
        >
          Ver leads encontrados
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
