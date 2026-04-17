"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

// ─── Plugin registration (outside component, runs once) ───────────────────────
gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProspectingAnimationProps {
  /** Set to true by the parent when the API call succeeds */
  isJobComplete: boolean;
  /** Called when animation + job are both done */
  onComplete: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProspectingAnimation({
  isJobComplete,
  onComplete,
}: ProspectingAnimationProps) {
  // Lazy-initialise: if the user already prefers reduced-motion, jump straight
  // to the waiting spinner without mounting the SVG at all.
  const [waiting, setWaiting] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const legRef = useRef<gsap.core.Timeline | null>(null);
  const animDoneRef = useRef(false);

  // Keep stable refs so callbacks inside useGSAP never go stale
  const isJobCompleteRef = useRef(isJobComplete);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { isJobCompleteRef.current = isJobComplete; }, [isJobComplete]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // When the job finishes AFTER the animation has already completed → navigate
  useEffect(() => {
    if (isJobComplete && animDoneRef.current) {
      onCompleteRef.current();
    }
  }, [isJobComplete]);

  // Called by the timeline's onComplete AND by the skip button
  function finish() {
    animDoneRef.current = true;
    if (isJobCompleteRef.current) {
      onCompleteRef.current();
    } else {
      setWaiting(true);
    }
  }

  function handleSkip() {
    legRef.current?.kill();
    tlRef.current?.kill();
    finish();
  }

  // ── Animation setup ──────────────────────────────────────────────────────
  useGSAP(
    () => {
      // prefers-reduced-motion → already in "waiting" state from useState init
      if (waiting) return;

      const path = containerRef.current?.querySelector<SVGPathElement>("#journey-path");
      const pathLen = path?.getTotalLength() ?? 900;

      // ── Initial state ─────────────────────────────────────────────────────
      gsap.set("#journey-path", {
        strokeDasharray: pathLen,
        strokeDashoffset: pathLen,
      });
      gsap.set("#company-1, #company-2, #company-3, #dest-house", {
        autoAlpha: 0,
        y: 12,
      });
      gsap.set("#c1-person, #c2-person, #c3-person", { autoAlpha: 0 });
      gsap.set("#c1-shake, #c2-shake, #c3-shake", { autoAlpha: 0, scale: 0 });

      // Place walker at the very start of the path
      gsap.set("#walker", {
        motionPath: {
          path: "#journey-path",
          align: "#journey-path",
          alignOrigin: [0.5, 1],
          start: 0,
          end: 0,
        },
      });

      // ── Leg-cycle (paused until walker moves) ─────────────────────────────
      const legCycle = gsap.timeline({ repeat: -1, paused: true });
      legCycle
        .to("#w-lleg", { attr: { x2: 7 }, duration: 0.13, ease: "none" })
        .to("#w-rleg", { attr: { x2: -7 }, duration: 0.13, ease: "none" }, "<")
        .to("#w-lleg", { attr: { x2: -7 }, duration: 0.13, ease: "none" })
        .to("#w-rleg", { attr: { x2: 7 }, duration: 0.13, ease: "none" }, "<");
      legRef.current = legCycle;

      // ── Main timeline ─────────────────────────────────────────────────────
      const tl = gsap.timeline({
        onComplete: finish,
        defaults: { ease: "power2.inOut" },
      });
      tlRef.current = tl;

      // helper: motion-path tween for one walk segment
      const walk = (start: number, end: number, dur: number) =>
        gsap.to("#walker", {
          motionPath: {
            path: "#journey-path",
            align: "#journey-path",
            alignOrigin: [0.5, 1],
            start,
            end,
          },
          duration: dur,
          ease: "none",
        });

      // ① Draw road + reveal scene
      tl.to("#journey-path", { strokeDashoffset: 0, duration: 0.7, ease: "none" })
        .to(
          "#company-1, #company-2, #company-3, #dest-house",
          { autoAlpha: 1, y: 0, stagger: 0.14, duration: 0.45 },
          0.25
        )

        // ② Walk → Company 1
        .add((): void => { legCycle.play(); })
        .add(walk(0, 0.22, 1.9))
        .add((): void => { legCycle.pause(); })
        .to("#c1-person", { autoAlpha: 1, x: -13, duration: 0.28 })
        .to(
          "#c1-shake",
          { autoAlpha: 1, scale: 1, duration: 0.32, transformOrigin: "center center" }
        )
        .to(["#c1-person", "#c1-shake"], { autoAlpha: 0, duration: 0.24 }, "+=0.45")

        // ③ Walk → Company 2
        .add((): void => { legCycle.play(); })
        .add(walk(0.22, 0.47, 1.65))
        .add((): void => { legCycle.pause(); })
        .to("#c2-person", { autoAlpha: 1, x: -13, duration: 0.28 })
        .to(
          "#c2-shake",
          { autoAlpha: 1, scale: 1, duration: 0.32, transformOrigin: "center center" }
        )
        .to(["#c2-person", "#c2-shake"], { autoAlpha: 0, duration: 0.24 }, "+=0.45")

        // ④ Walk → Company 3
        .add((): void => { legCycle.play(); })
        .add(walk(0.47, 0.70, 1.45))
        .add((): void => { legCycle.pause(); })
        .to("#c3-person", { autoAlpha: 1, x: -13, duration: 0.28 })
        .to(
          "#c3-shake",
          { autoAlpha: 1, scale: 1, duration: 0.32, transformOrigin: "center center" }
        )
        .to(["#c3-person", "#c3-shake"], { autoAlpha: 0, duration: 0.24 }, "+=0.45")

        // ⑤ Walk → House
        .add((): void => { legCycle.play(); })
        .add(walk(0.70, 1, 1.3))
        .add((): void => { legCycle.pause(); })
        // Walker enters the door
        .to("#walker", { autoAlpha: 0, y: -4, duration: 0.35 })
        // House pulses with a glow
        .to(
          "#dest-house",
          {
            filter: "drop-shadow(0 0 14px #f97316)",
            duration: 0.38,
            repeat: 2,
            yoyo: true,
            ease: "sine.inOut",
          },
          "<"
        );
    },
    { scope: containerRef }
  );

  // ── Waiting spinner ──────────────────────────────────────────────────────
  if (waiting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
          <p className="text-sm text-white/70">Finalizando búsqueda…</p>
        </div>
      </div>
    );
  }

  // ── Full animation overlay ───────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black px-4 backdrop-blur-sm"
    >
      {/* Subtitle */}
      <p className="text-xs tracking-widest text-white/40 uppercase">
        Buscando clientes potenciales…
      </p>

      {/* ── SVG scene (responsive via viewBox) ─────────────────────────── */}
      <div className="w-full max-w-2xl">
        <svg
          viewBox="0 0 800 280"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          aria-hidden="true"
        >
          <defs>
            {/* Road gradient left→right */}
            <linearGradient id="road-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0.85" />
            </linearGradient>
            {/* Green glow for handshake effect */}
            <filter id="glow-green" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Ground shadow ─────────────────────────────────────────── */}
          <line
            x1="30" y1="243" x2="775" y2="243"
            stroke="#7c2d12" strokeWidth="1.5"
          />

          {/* ── Winding road ─────────────────────────────────────────── */}
          {/*
            Path passes approximately through:
              x≈55  y≈235  (start)
              x≈200 y≈228  (≈22% — company 1 stop)
              x≈375 y≈228  (≈47% — company 2 stop)
              x≈540 y≈212  (≈70% — company 3 stop)
              x≈760 y≈200  (100% — house)
          */}
          <path
            id="journey-path"
            d="M 55,235 C 90,222 130,240 200,228
               C 265,218 305,244 375,228
               C 435,216 470,198 540,212
               C 600,224 630,208 698,204
               C 720,202 740,200 760,200"
            fill="none"
            stroke="url(#road-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* ════════════════════════════════════════════════════════════
              COMPANY 1  — path ≈ 22 %,  path coords ≈ (200, 228)
          ════════════════════════════════════════════════════════════ */}
          <g id="company-1">
            {/* Roof band */}
            <rect x="175" y="152" width="44" height="9" fill="#7c2d12" stroke="#9a3412" strokeWidth="1.2" rx="1" />
            {/* Body */}
            <rect x="175" y="160" width="44" height="68" fill="#431407" stroke="#9a3412" strokeWidth="1.5" rx="2" />
            {/* Windows row 1 */}
            <rect x="182" y="167" width="9" height="7" fill="#f97316" opacity="0.55" rx="1" />
            <rect x="198" y="167" width="9" height="7" fill="#f97316" opacity="0.55" rx="1" />
            {/* Windows row 2 */}
            <rect x="182" y="181" width="9" height="7" fill="#f97316" opacity="0.35" rx="1" />
            <rect x="198" y="181" width="9" height="7" fill="#f97316" opacity="0.35" rx="1" />
            {/* Windows row 3 */}
            <rect x="182" y="195" width="9" height="7" fill="#f97316" opacity="0.18" rx="1" />
            <rect x="198" y="195" width="9" height="7" fill="#f97316" opacity="0.18" rx="1" />
            {/* Door */}
            <rect x="190" y="215" width="12" height="13" fill="#f97316" opacity="0.45" rx="1" />
            {/* Company representative — slides left on arrival */}
            <g id="c1-person" transform="translate(226, 220)">
              <circle cx="0" cy="-15" r="5" fill="#fdba74" />
              <line x1="0" y1="-10" x2="0" y2="1" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" />
              <line x1="-6" y1="-7" x2="6" y2="-7" stroke="#fdba74" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="0" y1="1" x2="-5" y2="11" stroke="#fdba74" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="0" y1="1" x2="5" y2="11" stroke="#fdba74" strokeWidth="1.8" strokeLinecap="round" />
            </g>
            {/* Handshake seal */}
            <g id="c1-shake" transform="translate(210, 214)" filter="url(#glow-green)">
              <circle cx="0" cy="0" r="13" fill="rgba(249,115,22,0.12)" stroke="#f97316" strokeWidth="1.8" />
              {/* two clasped-hands shape: two offset arcs */}
              <path d="M -7,-2 C -5,-7 5,-7 7,-2" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <path d="M -7,2 C -5,7 5,7 7,2" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <line x1="-7" y1="-2" x2="-7" y2="2" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <line x1="7" y1="-2" x2="7" y2="2" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              {/* sparkle dots */}
              <circle cx="-12" cy="-10" r="1.5" fill="#f97316" opacity="0.8" />
              <circle cx="12" cy="-10" r="1.5" fill="#f97316" opacity="0.8" />
              <circle cx="0" cy="-16" r="1.5" fill="#f97316" opacity="0.6" />
            </g>
          </g>

          {/* ════════════════════════════════════════════════════════════
              COMPANY 2  — path ≈ 47 %,  path coords ≈ (375, 228)
          ════════════════════════════════════════════════════════════ */}
          <g id="company-2">
            {/* Flagpole + flag */}
            <line x1="374" y1="128" x2="374" y2="142" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" />
            <polygon points="374,128 386,133 374,138" fill="#fb923c" opacity="0.9" />
            {/* Penthouse */}
            <rect x="354" y="138" width="50" height="10" fill="#7c2d12" stroke="#9a3412" strokeWidth="1.2" rx="1" />
            {/* Body */}
            <rect x="354" y="147" width="50" height="81" fill="#431407" stroke="#9a3412" strokeWidth="1.5" rx="2" />
            {/* Windows 5 rows */}
            <rect x="361" y="154" width="10" height="8" fill="#fb923c" opacity="0.6" rx="1" />
            <rect x="378" y="154" width="10" height="8" fill="#fb923c" opacity="0.6" rx="1" />
            <rect x="361" y="168" width="10" height="8" fill="#fb923c" opacity="0.45" rx="1" />
            <rect x="378" y="168" width="10" height="8" fill="#fb923c" opacity="0.45" rx="1" />
            <rect x="361" y="182" width="10" height="8" fill="#fb923c" opacity="0.3" rx="1" />
            <rect x="378" y="182" width="10" height="8" fill="#fb923c" opacity="0.3" rx="1" />
            <rect x="361" y="196" width="10" height="8" fill="#fb923c" opacity="0.18" rx="1" />
            <rect x="378" y="196" width="10" height="8" fill="#fb923c" opacity="0.18" rx="1" />
            {/* Door */}
            <rect x="366" y="215" width="16" height="13" fill="#fb923c" opacity="0.45" rx="1" />
            {/* Company rep */}
            <g id="c2-person" transform="translate(419, 218)">
              <circle cx="0" cy="-15" r="5" fill="#fdba74" />
              <line x1="0" y1="-10" x2="0" y2="1" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" />
              <line x1="-6" y1="-7" x2="6" y2="-7" stroke="#fdba74" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="0" y1="1" x2="-5" y2="11" stroke="#fdba74" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="0" y1="1" x2="5" y2="11" stroke="#fdba74" strokeWidth="1.8" strokeLinecap="round" />
            </g>
            {/* Handshake seal */}
            <g id="c2-shake" transform="translate(401, 212)" filter="url(#glow-green)">
              <circle cx="0" cy="0" r="13" fill="rgba(249,115,22,0.12)" stroke="#f97316" strokeWidth="1.8" />
              <path d="M -7,-2 C -5,-7 5,-7 7,-2" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <path d="M -7,2 C -5,7 5,7 7,2" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <line x1="-7" y1="-2" x2="-7" y2="2" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <line x1="7" y1="-2" x2="7" y2="2" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <circle cx="-12" cy="-10" r="1.5" fill="#f97316" opacity="0.8" />
              <circle cx="12" cy="-10" r="1.5" fill="#f97316" opacity="0.8" />
              <circle cx="0" cy="-16" r="1.5" fill="#f97316" opacity="0.6" />
            </g>
          </g>

          {/* ════════════════════════════════════════════════════════════
              COMPANY 3  — path ≈ 70 %,  path coords ≈ (540, 212)
          ════════════════════════════════════════════════════════════ */}
          <g id="company-3">
            {/* Antenna */}
            <line x1="539" y1="136" x2="539" y2="150" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="539" cy="134" r="2.5" fill="#f97316" opacity="0.8" />
            {/* Roof band */}
            <rect x="518" y="150" width="44" height="9" fill="#7c2d12" stroke="#9a3412" strokeWidth="1.2" rx="1" />
            {/* Body */}
            <rect x="518" y="158" width="44" height="67" fill="#431407" stroke="#9a3412" strokeWidth="1.5" rx="2" />
            {/* Windows */}
            <rect x="525" y="165" width="9" height="7" fill="#f97316" opacity="0.55" rx="1" />
            <rect x="541" y="165" width="9" height="7" fill="#f97316" opacity="0.55" rx="1" />
            <rect x="525" y="179" width="9" height="7" fill="#f97316" opacity="0.35" rx="1" />
            <rect x="541" y="179" width="9" height="7" fill="#f97316" opacity="0.35" rx="1" />
            <rect x="525" y="193" width="9" height="7" fill="#f97316" opacity="0.18" rx="1" />
            <rect x="541" y="193" width="9" height="7" fill="#f97316" opacity="0.18" rx="1" />
            {/* Door */}
            <rect x="530" y="210" width="12" height="15" fill="#f97316" opacity="0.45" rx="1" />
            {/* Company rep */}
            <g id="c3-person" transform="translate(577, 202)">
              <circle cx="0" cy="-15" r="5" fill="#fdba74" />
              <line x1="0" y1="-10" x2="0" y2="1" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" />
              <line x1="-6" y1="-7" x2="6" y2="-7" stroke="#fdba74" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="0" y1="1" x2="-5" y2="11" stroke="#fdba74" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="0" y1="1" x2="5" y2="11" stroke="#fdba74" strokeWidth="1.8" strokeLinecap="round" />
            </g>
            {/* Handshake seal */}
            <g id="c3-shake" transform="translate(560, 196)" filter="url(#glow-green)">
              <circle cx="0" cy="0" r="13" fill="rgba(249,115,22,0.12)" stroke="#f97316" strokeWidth="1.8" />
              <path d="M -7,-2 C -5,-7 5,-7 7,-2" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <path d="M -7,2 C -5,7 5,7 7,2" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <line x1="-7" y1="-2" x2="-7" y2="2" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <line x1="7" y1="-2" x2="7" y2="2" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <circle cx="-12" cy="-10" r="1.5" fill="#f97316" opacity="0.8" />
              <circle cx="12" cy="-10" r="1.5" fill="#f97316" opacity="0.8" />
              <circle cx="0" cy="-16" r="1.5" fill="#f97316" opacity="0.6" />
            </g>
          </g>

          {/* ════════════════════════════════════════════════════════════
              DESTINATION HOUSE  — path 100 %,  coords ≈ (760, 200)
          ════════════════════════════════════════════════════════════ */}
          <g id="dest-house">
            {/* Chimney */}
            <rect x="769" y="175" width="7" height="16" fill="#7c2d12" stroke="#f97316" strokeWidth="1.2" />
            {/* Roof */}
            <polygon
              points="728,203 757,175 786,203"
              fill="#7c2d12"
              stroke="#f97316"
              strokeWidth="2"
            />
            {/* House body */}
            <rect
              x="732" y="202" width="50" height="38"
              fill="#431407" stroke="#f97316" strokeWidth="2" rx="2"
            />
            {/* Door */}
            <rect x="749" y="220" width="13" height="20" fill="#f97316" opacity="0.72" rx="1" />
            <circle cx="759" cy="231" r="1.5" fill="#ffedd5" />
            {/* Left window */}
            <rect x="737" y="209" width="11" height="9" fill="#fdba74" opacity="0.5" rx="1" />
            {/* Right window */}
            <rect x="766" y="209" width="11" height="9" fill="#fdba74" opacity="0.5" rx="1" />
            {/* Warm light glow behind windows */}
            <rect x="737" y="209" width="11" height="9" fill="#fb923c" opacity="0.12" rx="1" />
            <rect x="766" y="209" width="11" height="9" fill="#fb923c" opacity="0.12" rx="1" />
          </g>

          {/* ════════════════════════════════════════════════════════════
              WALKER FIGURE  — positioned by MotionPathPlugin
              All coords are relative to the group origin (0,0).
              alignOrigin [0.5, 1] places the feet (y≈13) on the path.
          ════════════════════════════════════════════════════════════ */}
          <g id="walker">
            {/* Ground shadow */}
            <ellipse cx="0" cy="15" rx="7" ry="2" fill="#000" opacity="0.25" />
            {/* Head */}
            <circle cx="0" cy="-20" r="7" fill="#f97316" />
            {/* Shine on head */}
            <circle cx="-2" cy="-23" r="2.5" fill="#fdba74" opacity="0.5" />
            {/* Body */}
            <line
              x1="0" y1="-13" x2="0" y2="2"
              stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"
            />
            {/* Left arm */}
            <line
              id="w-larm"
              x1="0" y1="-10" x2="-9" y2="-4"
              stroke="#f97316" strokeWidth="2" strokeLinecap="round"
            />
            {/* Right arm */}
            <line
              id="w-rarm"
              x1="0" y1="-10" x2="9" y2="-4"
              stroke="#f97316" strokeWidth="2" strokeLinecap="round"
            />
            {/* Left leg — x2 oscillates during walk */}
            <line
              id="w-lleg"
              x1="0" y1="2" x2="-7" y2="13"
              stroke="#f97316" strokeWidth="2" strokeLinecap="round"
            />
            {/* Right leg — x2 oscillates during walk */}
            <line
              id="w-rleg"
              x1="0" y1="2" x2="7" y2="13"
              stroke="#f97316" strokeWidth="2" strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Step label */}
      <p className="text-xs text-white/30">
        Cada parada es una empresa candidata para tu pipeline
      </p>

      {/* Skip button — bottom-right corner */}
      <button
        onClick={handleSkip}
        className="absolute bottom-6 right-6 text-xs text-white/30 transition-colors hover:text-white/60"
        type="button"
      >
        Saltar animación →
      </button>
    </div>
  );
}
