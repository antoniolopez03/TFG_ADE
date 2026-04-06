"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

const ORBS = [
  { id: 0, x: 10, y: 15, size: 320, blur: 60 },
  { id: 1, x: 75, y: 5,  size: 280, blur: 50 },
  { id: 2, x: 50, y: 40, size: 400, blur: 80 },
  { id: 3, x: 20, y: 70, size: 260, blur: 55 },
  { id: 4, x: 85, y: 60, size: 350, blur: 70 },
  { id: 5, x: 40, y: 85, size: 300, blur: 60 },
  { id: 6, x: 65, y: 30, size: 240, blur: 45 },
];

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientRef  = useRef<HTMLDivElement>(null);
  const gridRef      = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const isDark = () => document.documentElement.classList.contains("dark");

    const getOrbColor = (dark: boolean) => (dark ? "#FF751F" : "#FF914D");

    const updateGradient = (dark: boolean, angle: number) => {
      const start = dark ? "#111111" : "#ffffff";
      const end   = dark ? "#140d08" : "#fff4ee";
      gradientRef.current!.style.backgroundImage =
        `linear-gradient(${angle}deg, ${start}, ${end})`;
    };

    const updateGrid = (dark: boolean) => {
      const stroke = dark ? "rgba(255,117,31,0.08)" : "rgba(255,117,31,0.05)";
      gridRef.current!.querySelector("path")!.setAttribute("stroke", stroke);
    };

    // Apply initial theme state
    const dark0 = isDark();
    const orbCircles = containerRef.current!.querySelectorAll<SVGCircleElement>(".orb circle");

    orbCircles.forEach((c) => {
      gsap.set(c, {
        fill: getOrbColor(dark0),
        opacity: gsap.utils.random(dark0 ? 0.06 : 0.08, dark0 ? 0.10 : 0.12),
      });
    });

    updateGradient(dark0, 0);
    updateGrid(dark0);

    // Motion + scroll animations gated by prefers-reduced-motion
    const mm = gsap.matchMedia();

    mm.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        full:   "(prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        if (ctx.conditions!.reduce) {
          gsap.set(gridRef.current, { opacity: 1 });
          return;
        }

        // 1. Grid fade-in on load
        gsap.from(gridRef.current, { opacity: 0, duration: 2, ease: "power2.out" });

        // 2. Floating orb timelines — breathe/drift loop
        containerRef.current!
          .querySelectorAll<HTMLElement>(".orb")
          .forEach((orb) => {
            const duration = gsap.utils.random(8, 16);
            gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } })
              .to(orb, {
                x:        gsap.utils.random(-80, 80),
                y:        gsap.utils.random(-80, 80),
                scale:    gsap.utils.random(0.9, 1.1),
                duration,
              });
          });

        // 3. Scroll-reactive gradient angle
        let currentAngle = 0;
        ScrollTrigger.create({
          trigger: document.documentElement,
          start:   "top top",
          end:     "bottom bottom",
          scrub:   true,
          onUpdate(self) {
            currentAngle = self.progress * 20;
            updateGradient(isDark(), currentAngle);
          },
        });

        // 4. Theme change observer — smooth color transition
        const observer = new MutationObserver(() => {
          const dark = isDark();
          orbCircles.forEach((c) => {
            gsap.to(c, {
              fill:     getOrbColor(dark),
              opacity:  gsap.utils.random(dark ? 0.06 : 0.08, dark ? 0.10 : 0.12),
              duration: 0.6,
            });
          });
          updateGradient(dark, currentAngle);
          updateGrid(dark);
        });

        observer.observe(document.documentElement, {
          attributes:      true,
          attributeFilter: ["class"],
        });

        return () => observer.disconnect();
      },
    );

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {/* Layer 1 — scroll-reactive gradient */}
      <div ref={gradientRef} className="absolute inset-0" />

      {/* Layer 2 — subtle grid lines */}
      <svg
        ref={gridRef}
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0 }}
      >
        <defs>
          <pattern
            id="animated-bg-grid-pattern"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 60 0 L 0 0 0 60" fill="none" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#animated-bg-grid-pattern)" />
      </svg>

      {/* Layer 3 — floating orbs */}
      {ORBS.map((orb) => (
        <div
          key={orb.id}
          className="orb absolute"
          style={{
            left:        `${orb.x}%`,
            top:         `${orb.y}%`,
            willChange:  "transform",
            // offset the element by half its size so the orb center aligns to the % position
            transform:   `translate(-50%, -50%)`,
          }}
        >
          <svg
            width={orb.size}
            height={orb.size}
            viewBox={`0 0 ${orb.size} ${orb.size}`}
            style={{ filter: `blur(${orb.blur}px)`, display: "block" }}
          >
            <circle
              cx={orb.size / 2}
              cy={orb.size / 2}
              r={orb.size / 2}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
