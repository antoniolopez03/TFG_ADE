"use client";

import { useState } from "react";

export function VideoDemo() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-950">
        {/* Orange gradient corner */}
        <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-tl-full bg-leadby-500/20 blur-2xl" />
        {/* Grid overlay */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative flex flex-col items-center gap-4 text-center px-6">
          {/* Play icon SVG */}
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
          <p className="text-lg font-semibold text-white">Demo del producto</p>
          <span className="rounded-full border border-leadby-500/40 bg-leadby-500/10 px-3 py-1 text-xs font-medium text-leadby-400">
            Próximamente
          </span>
        </div>
      </div>
    );
  }

  return (
    <video
      src="/videos/demo-leadby.mp4"
      poster="/images/demo-poster.jpg"
      controls
      playsInline
      preload="metadata"
      onError={() => setHasError(true)}
      className="aspect-video w-full rounded-2xl object-cover"
    />
  );
}
