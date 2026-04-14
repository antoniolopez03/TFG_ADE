"use client";

import Link from "next/link";
import { useState } from "react";

const DEMO_VIDEO_URL = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL?.trim() ?? "";
const HAS_CONFIGURED_VIDEO = DEMO_VIDEO_URL.length > 0;

interface VideoFallbackProps {
  hasConfiguredVideo: boolean;
}

function VideoFallback({ hasConfiguredVideo }: VideoFallbackProps) {
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-950">
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-tl-full bg-leadby-500/20 blur-2xl" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative flex max-w-xl flex-col items-center gap-4 px-6 text-center">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-leadby-500/40 bg-leadby-500/10">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="ml-1 text-leadby-500"
          >
            <path
              d="M8 5.14v13.72a1 1 0 001.5.87l11-6.86a1 1 0 000-1.74l-11-6.86A1 1 0 008 5.14z"
              fill="currentColor"
            />
          </svg>
        </div>

        <p className="text-lg font-semibold text-white">Vista previa del flujo LeadBy</p>
        <p className="max-w-md text-sm leading-relaxed text-white/70">
          {hasConfiguredVideo
            ? "Estamos actualizando el vídeo corporativo. Mientras tanto, te mostramos el flujo en una demo guiada."
            : "Estamos preparando el vídeo corporativo definitivo. Puedes solicitar una demostración personalizada ahora mismo."}
        </p>

        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full bg-leadby-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-leadby-600"
        >
          Solicitar demo guiada
        </Link>
      </div>
    </div>
  );
}

export function VideoDemo() {
  const [hasError, setHasError] = useState(false);

  if (!HAS_CONFIGURED_VIDEO || hasError) {
    return <VideoFallback hasConfiguredVideo={HAS_CONFIGURED_VIDEO} />;
  }

  return (
    <video
      src={DEMO_VIDEO_URL}
      poster="/images/demo-poster.svg"
      controls
      playsInline
      preload="metadata"
      onError={() => setHasError(true)}
      className="aspect-video w-full rounded-2xl object-cover"
    />
  );
}
