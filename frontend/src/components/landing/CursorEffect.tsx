"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function CursorEffect() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only on pointer:fine devices (desktops with mouse)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const DOT_R = 4;  // half of 8px dot
    const RING_R = 20; // half of 40px ring

    // Show the cursor elements
    gsap.set([dot, ring], { autoAlpha: 1 });

    // Inject cursor:none globally
    const style = document.createElement("style");
    style.id = "custom-cursor-style";
    style.textContent = "html, html * { cursor: none !important; }";
    document.head.appendChild(style);

    // quickTo for the lagging ring
    const xTo = gsap.quickTo(ring, "x", { duration: 0.13, ease: "power2.out" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.13, ease: "power2.out" });

    let lastTrailX = -9999;
    let lastTrailY = -9999;
    let lastTrailMs = 0;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // ── Trail particle ─────────────────────────────────────────────────────
    function spawnTrail(x: number, y: number) {
      if (reducedMotion) return;
      const size = Math.random() * 5 + 3;
      const p = document.createElement("div");
      p.style.cssText = `
        position:fixed;top:${y}px;left:${x}px;
        width:${size}px;height:${size}px;border-radius:50%;
        background:rgba(255,117,31,0.65);
        pointer-events:none;z-index:9997;
        transform:translate(-50%,-50%);will-change:transform,opacity;
      `;
      document.body.appendChild(p);
      gsap.to(p, {
        scale: 0,
        opacity: 0,
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 14,
        duration: 0.42,
        ease: "power2.out",
        onComplete: () => p.remove(),
      });
    }

    // ── Click burst ────────────────────────────────────────────────────────
    function spawnBurst(x: number, y: number) {
      if (reducedMotion) return;
      const count = 8;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const dist = 28 + Math.random() * 18;
        const size = Math.random() * 5 + 3;
        const p = document.createElement("div");
        p.style.cssText = `
          position:fixed;top:${y}px;left:${x}px;
          width:${size}px;height:${size}px;border-radius:50%;
          background:rgba(255,117,31,${0.5 + Math.random() * 0.5});
          pointer-events:none;z-index:9998;
          transform:translate(-50%,-50%);will-change:transform,opacity;
        `;
        document.body.appendChild(p);
        gsap.to(p, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          scale: 0,
          opacity: 0,
          duration: 0.55 + Math.random() * 0.2,
          ease: "power2.out",
          onComplete: () => p.remove(),
        });
      }
    }

    // ── Event handlers ─────────────────────────────────────────────────────
    function onMouseMove(e: MouseEvent) {
      const { clientX: x, clientY: y } = e;

      // Dot snaps instantly
      gsap.set(dot, { x: x - DOT_R, y: y - DOT_R });

      // Ring lags behind
      xTo(x - RING_R);
      yTo(y - RING_R);

      // Trail: throttle by distance + time
      const dx = x - lastTrailX;
      const dy = y - lastTrailY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const now = Date.now();
      if (dist > 14 && now - lastTrailMs > 32) {
        lastTrailX = x;
        lastTrailY = y;
        lastTrailMs = now;
        spawnTrail(x, y);
      }
    }

    function onClick(e: MouseEvent) {
      const { clientX: x, clientY: y } = e;

      // Ring pulse outward then reset
      gsap.timeline()
        .to(ring, { scale: 2.6, opacity: 0, duration: 0.33, ease: "power2.out" })
        .set(ring, { scale: 1, opacity: 1 });

      spawnBurst(x, y);
    }

    function onMouseOver(e: MouseEvent) {
      if ((e.target as HTMLElement).closest("a, button, [role='button']")) {
        gsap.to(ring, {
          scale: 2,
          borderColor: "rgba(255,117,31,0.9)",
          duration: 0.25,
          ease: "power2.out",
        });
        gsap.to(dot, { scale: 0, duration: 0.25 });
      }
    }

    function onMouseOut(e: MouseEvent) {
      if ((e.target as HTMLElement).closest("a, button, [role='button']")) {
        gsap.to(ring, {
          scale: 1,
          borderColor: "rgba(255,117,31,0.5)",
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.to(dot, { scale: 1, duration: 0.3 });
      }
    }

    function onDocLeave() {
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.25 });
    }
    function onDocEnter() {
      gsap.to([dot, ring], { autoAlpha: 1, duration: 0.25 });
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("click", onClick);
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mouseout", onMouseOut, { passive: true });
    document.addEventListener("mouseleave", onDocLeave);
    document.addEventListener("mouseenter", onDocEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("mouseleave", onDocLeave);
      document.removeEventListener("mouseenter", onDocEnter);
      document.getElementById("custom-cursor-style")?.remove();
    };
  }, []);

  return (
    <>
      {/* Cursor dot — snaps to mouse */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#ff751f",
          pointerEvents: "none",
          zIndex: 9999,
          visibility: "hidden",
          willChange: "transform",
        }}
      />
      {/* Cursor ring — lags behind */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1.5px solid rgba(255,117,31,0.5)",
          pointerEvents: "none",
          zIndex: 9998,
          visibility: "hidden",
          willChange: "transform",
        }}
      />
    </>
  );
}
