"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

// ─── Radial line data (computed once at module level) ─────────────────────────
//
// SVG viewBox "0 0 1440 800", vanishing point at dead centre (720, 400).
// 16 lines total:
//   8 primary   → corner + edge-midpoint destinations (full visual weight)
//   8 secondary → intermediate-angle destinations (~22.5° between primaries)
//
// Electric pulse formula:
//   strokeDasharray  = "{pulse} {gap}"  where pulse = len×0.15, gap = len×3.2
//   Initial strokeDashoffset = len + pulse  → pulse before path-start (invisible)
//   Target  strokeDashoffset = −(len+pulse) → pulse past path-end  (invisible)
//   GSAP repeat:-1 creates a seamless centre-to-edge loop.

const VPX   = 720;
const VPY   = 400;
const SVG_W = 1440;
const SVG_H = 800;

function makeLine(x2: number, y2: number) {
  const len   = Math.sqrt((x2 - VPX) ** 2 + (y2 - VPY) ** 2);
  const pulse = len * 0.15;
  const gap   = len * 3.2;
  return { x2, y2, len, pulse, gap };
}

// 8 primary: corners + edge midpoints (clockwise from right-centre)
const PRIMARY_LINES = (
  [
    [SVG_W, VPY  ],  // right-centre
    [SVG_W, SVG_H],  // bottom-right corner
    [VPX,   SVG_H],  // bottom-centre
    [0,     SVG_H],  // bottom-left corner
    [0,     VPY  ],  // left-centre
    [0,     0    ],  // top-left corner
    [VPX,   0    ],  // top-centre
    [SVG_W, 0    ],  // top-right corner
  ] as [number, number][]
).map(([x, y]) => makeLine(x, y));

// 8 secondary: SVG-boundary intersections at intermediate angles.
// Angles (from VP):  ~14.5° | ~59.5° | ~120.5° | ~165.5°
//                  ~194.5° | ~239.5° | ~300.5° | ~345.5°
const SECONDARY_LINES = (
  [
    [SVG_W, 586],   // ~14.5°  – between right & bottom-right
    [955,   SVG_H], // ~59.5°  – between bottom-right & bottom
    [485,   SVG_H], // ~120.5° – between bottom & bottom-left
    [0,     586],   // ~165.5° – between bottom-left & left
    [0,     214],   // ~194.5° – between left & top-left
    [485,   0  ],   // ~239.5° – between top-left & top
    [955,   0  ],   // ~300.5° – between top & top-right
    [SVG_W, 214],   // ~345.5° – between top-right & right
  ] as [number, number][]
).map(([x, y]) => makeLine(x, y));

const ALL_LINES = [...PRIMARY_LINES, ...SECONDARY_LINES];

// ─── Component ────────────────────────────────────────────────────────────────

export function HeroBackground() {
  // ── Refs ────────────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef      = useRef<HTMLDivElement>(null);
  const topMaskRef   = useRef<HTMLDivElement>(null);
  const pulseRefs    = useRef<(SVGLineElement | null)[]>(
    Array.from({ length: ALL_LINES.length }, () => null)
  );

  // ── Dark-mode detection ─────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const sync = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  // ── GSAP animations (re-initialise when dark mode flips) ───────────────────
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {

      // Glow: slow breathing pulse
      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { scale: 0.85, opacity: isDark ? 0.13 : 0.10 },
          {
            scale:    1.15,
            opacity:  isDark ? 0.22 : 0.20,
            duration: 6,
            repeat: -1, yoyo: true, ease: "sine.inOut",
          }
        );
      }

      // Electric pulses: all lines fire simultaneously — pulse explodes
      // from the centre VP and reaches every edge at exactly the same time.
      pulseRefs.current.forEach((el, i) => {
        if (!el) return;
        const { len, pulse } = ALL_LINES[i];
        gsap.to(el, {
          attr: { "stroke-dashoffset": -(len + pulse) },
          duration: 2,
          delay: 0,
          repeat: -1, ease: "none",
        });
      });

      // Top mask: gentle breathing parallax
      if (topMaskRef.current) {
        gsap.to(topMaskRef.current, {
          y: 10, duration: 8,
          repeat: -1, yoyo: true, ease: "sine.inOut",
        });
      }

    }, containerRef);

    return () => ctx.revert();
  }, [isDark]);

  // ── Theme values ─────────────────────────────────────────────────────────────
  const bg           = isDark ? "black" : "white";
  const primaryBaseW = isDark ? 0.6 : 0.8;
  const gradMaxOp    = isDark ? 0.25 : 0.40;
  const gradEdgeOp   = isDark ? 0.06 : 0.10;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >

      {/* ── CAPA 1 — Diffuse background glow ──────────────────────────────── */}
      {/*
          Radial orange glow anchored to the bottom-centre.
          GSAP pulses scale + opacity for a breathing effect.
          willChange limited to this one element (performance rule).
      */}
      <div
        ref={glowRef}
        className="absolute"
        style={{
          bottom:       "-5%",
          left:         "50%",
          transform:    "translateX(-50%)",
          width:        "860px",
          height:       "640px",
          borderRadius: "50%",
          background: [
            "radial-gradient(ellipse 55% 45% at 50% 100%,",
            "  rgba(255,117,31,0.38) 0%,",
            "  rgba(255,117,31,0.14) 38%,",
            "  transparent 72%)",
          ].join(" "),
          filter:     "blur(50px)",
          opacity:    isDark ? 0.16 : 0.14,
          willChange: "transform, opacity",
        }}
      />

      {/* ── CAPA 2 — Radial perspective SVG (full-hero) ───────────────────── */}
      {/*
          Single SVG covering the entire hero. All 16 lines radiate from the
          dead-centre vanishing point. preserveAspectRatio="xMidYMid slice"
          scales the SVG to cover any viewport while keeping the VP centred.
          Each line has:
            · A static base with a linearGradient (opacity 0 at VP → peak → 0 at edge)
            · A travelling electric pulse driven by GSAP stroke-dashoffset
      */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          {/* One linearGradient per line — each has a unique direction */}
          {ALL_LINES.map((ln, i) => (
            <linearGradient
              key={`grad-def-${i}`}
              id={`hb-grad-${i}`}
              x1={VPX} y1={VPY}
              x2={ln.x2} y2={ln.y2}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%"   stopColor="#FF751F" stopOpacity={0} />
              <stop offset="40%"  stopColor="#FF751F" stopOpacity={gradMaxOp} />
              <stop offset="100%" stopColor="#FF751F" stopOpacity={gradEdgeOp} />
            </linearGradient>
          ))}
        </defs>

        {/* Primary lines (corner + midpoint destinations) */}
        {PRIMARY_LINES.map((ln, i) => (
          <g key={`p${i}`}>
            <line
              x1={VPX} y1={VPY} x2={ln.x2} y2={ln.y2}
              stroke={`url(#hb-grad-${i})`}
              strokeWidth={primaryBaseW}
            />
            <line
              ref={(el) => { pulseRefs.current[i] = el; }}
              x1={VPX} y1={VPY} x2={ln.x2} y2={ln.y2}
              stroke="#FF751F"
              strokeWidth="1.5"
              strokeDasharray={`${ln.pulse} ${ln.gap}`}
              strokeDashoffset={ln.len + ln.pulse}
              strokeOpacity="1"
            />
          </g>
        ))}

        {/* Secondary lines (intermediate-angle destinations) */}
        {SECONDARY_LINES.map((ln, i) => {
          const idx = PRIMARY_LINES.length + i;
          return (
            <g key={`s${i}`}>
              <line
                x1={VPX} y1={VPY} x2={ln.x2} y2={ln.y2}
                stroke={`url(#hb-grad-${idx})`}
                strokeWidth={0.4}
              />
              <line
                ref={(el) => { pulseRefs.current[idx] = el; }}
                x1={VPX} y1={VPY} x2={ln.x2} y2={ln.y2}
                stroke="#FF751F"
                strokeWidth="0.8"
                strokeDasharray={`${ln.pulse} ${ln.gap}`}
                strokeDashoffset={ln.len + ln.pulse}
                strokeOpacity="0.5"
              />
            </g>
          );
        })}
      </svg>

      {/* ── CAPA 3 — Top mask (breathing / parallax) ──────────────────────── */}
      {/*
          Covers the top 32% of the hero fading from bg to transparent.
          GSAP animates a gentle y translation (0 ↔ 10px) every 8s.
      */}
      <div
        ref={topMaskRef}
        className="absolute top-0 left-0 right-0 h-[32%] pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${bg} 0%, transparent 100%)`,
          willChange: "transform",
        }}
      />

      {/* ── CAPA 4 — Side vignettes (depth / framing) ─────────────────────── */}
      {/*
          Full-height gradients frame the central content and give depth,
          making the radial lines recede at the edges.
          Width 32% for a more pronounced effect with the new radial design.
      */}
      <div
        className="absolute inset-y-0 left-0 w-[32%] pointer-events-none"
        style={{
          background: `linear-gradient(to right, ${bg} 0%, transparent 100%)`,
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-[32%] pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${bg} 0%, transparent 100%)`,
        }}
      />

    </div>
  );
}
