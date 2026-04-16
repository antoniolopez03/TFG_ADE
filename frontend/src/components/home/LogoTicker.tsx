"use client";

// ─── Data ─────────────────────────────────────────────────────────────────────

const LOGOS = [
  { name: "HubSpot",     label: "HubSpot CRM" },
  { name: "Google AI",   label: "Google Gemini" },
  { name: "Supabase",    label: "Supabase" },
  { name: "Resend",      label: "Resend" },
  { name: "Vercel",      label: "Vercel" },
  { name: "Next.js",     label: "Next.js" },
];

// Triplicate the array so the seamless loop works for any viewport width
const TRACK = [...LOGOS, ...LOGOS, ...LOGOS];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Infinite horizontal ticker showing technology & partner logos.
 * Uses pure CSS animation (`animate-ticker`) — no JS scroll needed.
 * The track is triplicated so the seam is never visible; `animation-delay`
 * on a second copy keeps the gap perfectly filled.
 */
export function LogoTicker() {
  return (
    <div className="relative overflow-hidden border-y border-black/6 dark:border-white/8 py-5">
      {/* Left fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-background to-transparent"
      />
      {/* Right fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"
      />

      {/* Track — two copies run back-to-back for seamless loop */}
      <div className="flex" aria-hidden>
        {/* Copy 1 */}
        <ul
          className="flex shrink-0 animate-ticker items-center gap-14"
          style={{ willChange: "transform" }}
        >
          {TRACK.map((logo, i) => (
            <TickerItem key={`a-${i}`} logo={logo} />
          ))}
        </ul>

        {/* Copy 2 — offset by half a duration to fill the gap seamlessly */}
        <ul
          className="flex shrink-0 animate-ticker items-center gap-14"
          style={{ willChange: "transform", animationDelay: "-12.5s" }}
        >
          {TRACK.map((logo, i) => (
            <TickerItem key={`b-${i}`} logo={logo} />
          ))}
        </ul>
      </div>

      {/* Accessible hidden text */}
      <span className="sr-only">Marquesina de plataformas compatibles</span>
    </div>
  );
}

// ─── Ticker item ──────────────────────────────────────────────────────────────

function TickerItem({ logo }: { logo: { name: string; label: string } }) {
  return (
    <li className="flex shrink-0 items-center gap-2.5 opacity-40 grayscale transition-all duration-300 hover:opacity-90 hover:grayscale-0 hover:scale-105 cursor-default select-none">
      {/* Icon placeholder — swap for real SVG/Image when assets are available */}
      <LogoIcon name={logo.name} />
      <span className="text-sm font-semibold tracking-tight text-foreground/80">
        {logo.label}
      </span>
    </li>
  );
}

// ─── Minimal SVG icons ────────────────────────────────────────────────────────

function LogoIcon({ name }: { name: string }) {
  const cls = "h-5 w-5 shrink-0";

  switch (name) {
    case "HubSpot":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#ff7a59" opacity="0.9" />
          <path d="M8.5 15.5c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5z" fill="white" />
          <path d="M12 12V6M12 6l-2 2M12 6l2 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "Google AI":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#4285f4" stroke="#4285f4" strokeWidth="0.5" />
        </svg>
      );
    case "Supabase":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.101 12.888.695 14.076 1.76 14.076H12.3l.1 8.888c.015.987 1.26 1.41 1.876.637l9.261-11.65c.663-.838.069-2.026-.996-2.026H12.0l-.1-8.889z" fill="#3ecf8e" />
        </svg>
      );
    case "Resend":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <rect width="24" height="24" rx="5" fill="#000" className="dark:fill-white/80" />
          <path d="M6 8h12M6 12h8M6 16h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="dark:stroke-black/80" />
        </svg>
      );
    case "Vercel":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L22 20H2L12 2Z" />
        </svg>
      );
    case "Next.js":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
          <path d="M9 8.5l6 7M15 8.5v7" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="dark:stroke-black" />
        </svg>
      );
    default:
      return (
        <div className={`${cls} rounded-full bg-leadby-500/20 flex items-center justify-center text-[8px] font-bold text-leadby-500`}>
          {name.slice(0, 2).toUpperCase()}
        </div>
      );
  }
}
