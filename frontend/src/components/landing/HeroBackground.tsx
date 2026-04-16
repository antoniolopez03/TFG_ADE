"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

// ─── Static grid data (computed once at module level) ─────────────────────────
//
// Coordinate system: SVG viewBox "0 0 1000 500"
// Vanishing point (VP): (500, 0) — top-centre
//
// Radial lines    → from VP fanning out to 8 x-positions at y = 500
// Horizontal lines → clipped to the perspective trapezoid at each y level
//   Left boundary at height y  : x = VPX - y
//   Right boundary at height y : x = VPX + y
// Central ray     → straight down from VP (x = 500)
//
// Electric-pulse formula
//   strokeDasharray  = "{pulse} {gap}"
//     gap = len × 3.2  → ensures only ONE pulse is visible at any instant
//   Initial strokeDashoffset = len + pulse    (pulse positioned before line start)
//   Target  strokeDashoffset = -(len + pulse) (pulse positioned after line end)
//   GSAP gsap.to(el, { attr: { "stroke-dashoffset": -(len+pulse) }, repeat:-1 })
//   creates a seamless loop.

const VPX   = 500;
const SVG_W = 1000;
const SVG_H = 500;

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ── 8 radial lines ──────────────────────────────────────────────────────────
const RADIAL_LINES = [0, 125, 250, 375, 625, 750, 875, 1000].map((x2) => {
  const len   = dist(VPX, 0, x2, SVG_H);
  const pulse = len * 0.12;
  const gap   = len * 3.2;
  return { x1: VPX, y1: 0, x2, y2: SVG_H, len, pulse, gap } as const;
});

// ── 4 horizontal lines (opacity increases toward viewer) ────────────────────
const H_LINES = ([80, 180, 310, 460] as const).map((y, i) => {
  const xL    = VPX - y;
  const xR    = VPX + y;
  const len   = xR - xL;
  const pulse = len * 0.18;
  const gap   = len * 3.2;
  const base  = 0.06 + i * 0.045;   // 0.06 / 0.105 / 0.15 / 0.195
  return { x1: xL, y1: y, x2: xR, y2: y, len, pulse, gap, base } as const;
});

// ── Central ray ─────────────────────────────────────────────────────────────
const RAY_LEN   = SVG_H;
const RAY_PULSE = RAY_LEN * 0.14;
const RAY_GAP   = RAY_LEN * 3.2;

// ─── Component ────────────────────────────────────────────────────────────────

export function HeroBackground() {
  // ── Refs ────────────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef      = useRef<HTMLDivElement>(null);
  const topMaskRef   = useRef<HTMLDivElement>(null);
  const centralRef   = useRef<SVGLineElement>(null);

  const rPulseRefs = useRef<(SVGLineElement | null)[]>(
    Array.from({ length: RADIAL_LINES.length }, () => null)
  );
  const hPulseRefs = useRef<(SVGLineElement | null)[]>(
    Array.from({ length: H_LINES.length }, () => null)
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

      // ── CAPA 1 — Background glow pulse ──────────────────────────────────
      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { scale: 0.85, opacity: isDark ? 0.13 : 0.05 },
          {
            scale:    1.15,
            opacity:  isDark ? 0.22 : 0.12,
            duration: 6,
            repeat: -1, yoyo: true, ease: "sine.inOut",
          }
        );
      }

      // ── CAPA 2 — Base-line shimmer (wrapper <g> CSS opacity) ────────────
      //    Each base line's <g class="hb-base-shimmer"> oscillates between
      //    full opacity and 0.45 with a random duration + delay.
      containerRef.current
        ?.querySelectorAll<SVGGElement>(".hb-base-shimmer")
        .forEach((el) => {
          gsap.to(el, {
            opacity:  0.45,
            duration: 3 + Math.random() * 3,
            delay:    Math.random() * 4,
            repeat: -1, yoyo: true, ease: "sine.inOut",
          });
        });

      // ── CAPA 2 — Radial pulse: dash travels VP → bottom ─────────────────
      rPulseRefs.current.forEach((el, i) => {
        if (!el) return;
        const { len, pulse } = RADIAL_LINES[i];
        gsap.to(el, {
          attr: { "stroke-dashoffset": -(len + pulse) },
          duration: 2 + Math.random() * 2,
          delay:    Math.random() * 3,
          repeat: -1, ease: "none",
        });
      });

      // ── CAPA 2 — Horizontal pulse: dash travels left → right ────────────
      hPulseRefs.current.forEach((el, i) => {
        if (!el) return;
        const { len, pulse } = H_LINES[i];
        gsap.to(el, {
          attr: { "stroke-dashoffset": -(len + pulse) },
          duration: 2.5 + Math.random() * 2,
          delay:    Math.random() * 4,
          repeat: -1, ease: "none",
        });
      });

      // ── CAPA 3 — Central ray pulse (faster, more prominent) ─────────────
      if (centralRef.current) {
        gsap.to(centralRef.current, {
          attr: { "stroke-dashoffset": -(RAY_LEN + RAY_PULSE) },
          duration: 1.4,
          delay:    Math.random() * 0.8,
          repeat: -1, ease: "none",
        });
      }

      // ── CAPA 4 — Top mask breathing ──────────────────────────────────────
      if (topMaskRef.current) {
        gsap.to(topMaskRef.current, {
          y: 10, duration: 8,
          repeat: -1, yoyo: true, ease: "sine.inOut",
        });
      }

    }, containerRef); // scope: selector strings resolve inside containerRef

    return () => ctx.revert();
  }, [isDark]);

  // ── Theme-dependent CSS values ───────────────────────────────────────────────
  const bg      = isDark ? "black" : "white";
  const baseOp  = isDark ? 0.20 : 0.12;
  const stroke  = "#FF751F";

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >

      {/* ── CAPA 1 — Diffuse background lights ────────────────────────────── */}
      {/*
          Two radial glows stacked in one div.
          GSAP pulses scale + opacity for a breathing effect.
          willChange limited to this one element (performance rule).
      */}
      <div
        ref={glowRef}
        className="absolute"
        style={{
          bottom:  "-5%",
          left:    "50%",
          transform: "translateX(-50%)",
          width:   "860px",
          height:  "640px",
          borderRadius: "50%",
          background: [
            "radial-gradient(ellipse 55% 45% at 50% 100%,",
            "  rgba(255,117,31,0.38) 0%,",
            "  rgba(255,117,31,0.14) 38%,",
            "  transparent 72%)",
          ].join(" "),
          filter:     "blur(50px)",
          opacity:    isDark ? 0.16 : 0.07,
          willChange: "transform, opacity",
        }}
      />

      {/* ── CAPA 2 + 3 — Perspective grid SVG ────────────────────────────── */}
      {/*
          The div occupies the lower 52% of the hero section.
          preserveAspectRatio="none" stretches the SVG to fill, so the
          perspective effect looks correct on any screen width.
      */}
      <div className="absolute bottom-0 left-0 right-0 h-[52%]">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <defs>
            {/* Glow filter: blur + composite for the central ray */}
            <filter
              id="hb-ray-glow"
              x="-400%" y="-10%"
              width="900%" height="120%"
            >
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="4"
                result="blur"
              />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Radial lines ──────────────────────────────────────────────── */}
          {RADIAL_LINES.map((ln, i) => (
            <g key={`r${i}`}>

              {/* Base line — shimmer driven by GSAP on the wrapper <g> */}
              <g className="hb-base-shimmer">
                <line
                  x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                  stroke={stroke}
                  strokeWidth="0.5"
                  strokeOpacity={baseOp}
                />
              </g>

              {/* Traveling electric pulse */}
              <line
                ref={(el) => { rPulseRefs.current[i] = el; }}
                x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                stroke={stroke}
                strokeWidth="1.5"
                strokeDasharray={`${ln.pulse} ${ln.gap}`}
                strokeDashoffset={ln.len + ln.pulse}
                strokeOpacity="0.85"
              />
            </g>
          ))}

          {/* ── Horizontal lines ──────────────────────────────────────────── */}
          {H_LINES.map((ln, i) => (
            <g key={`h${i}`}>

              <g className="hb-base-shimmer">
                <line
                  x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                  stroke={stroke}
                  strokeWidth="0.5"
                  strokeOpacity={ln.base}
                />
              </g>

              <line
                ref={(el) => { hPulseRefs.current[i] = el; }}
                x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                stroke={stroke}
                strokeWidth="1.5"
                strokeDasharray={`${ln.pulse} ${ln.gap}`}
                strokeDashoffset={ln.len + ln.pulse}
                strokeOpacity="0.78"
              />
            </g>
          ))}

          {/* ── CAPA 3 — Central ray ──────────────────────────────────────── */}

          {/* Halo: thick, blurred, static — creates the ambient glow */}
          <line
            x1={VPX} y1={0} x2={VPX} y2={SVG_H}
            stroke={stroke}
            strokeWidth="6"
            strokeOpacity="0.22"
            filter="url(#hb-ray-glow)"
          />

          {/* Sharp traveling pulse with glow filter */}
          <line
            ref={centralRef}
            x1={VPX} y1={0} x2={VPX} y2={SVG_H}
            stroke={stroke}
            strokeWidth="1"
            strokeDasharray={`${RAY_PULSE} ${RAY_GAP}`}
            strokeDashoffset={RAY_LEN + RAY_PULSE}
            strokeOpacity="0.92"
            filter="url(#hb-ray-glow)"
          />
        </svg>

        {/* Horizon fade — blends the top of the grid into the page background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, ${bg} 0%, transparent 50%)`,
          }}
        />

        {/* Side fades — soften the left and right edges of the grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to right,
              ${bg}  0%,
              transparent 12%,
              transparent 88%,
              ${bg}  100%)`,
          }}
        />
      </div>

      {/* ── CAPA 4 — Top mask (breathing / parallax effect) ───────────────── */}
      {/*
          Covers the top 32% of the hero with a fade from bg-color to transparent.
          GSAP animates a gentle y translation (−10 px ↔ 0 px) every 8 s for a
          subtle "breathing" feel without distracting from the content.
      */}
      <div
        ref={topMaskRef}
        className="absolute top-0 left-0 right-0 h-[32%] pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${bg} 0%, transparent 100%)`,
          willChange: "transform",
        }}
      />

    </div>
  );
}
