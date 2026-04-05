"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function CursorEffect() {
  const arrowRef = useRef<HTMLDivElement>(null);
  const haloRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const arrow = arrowRef.current;
    const halo  = haloRef.current;
    if (!arrow || !halo) return;

    const TIP_X   = 2;
    const TIP_Y   = 2;
    const HALO_R  = 45; // half of 90px halo

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.set([arrow, halo], { autoAlpha: 1 });

    const style = document.createElement("style");
    style.id = "custom-cursor-style";
    style.textContent = "html, html * { cursor: none !important; }";
    document.head.appendChild(style);

    // Halo follows with a slight lag so it feels organic
    const xHalo = gsap.quickTo(halo, "x", { duration: 0.18, ease: "power2.out" });
    const yHalo = gsap.quickTo(halo, "y", { duration: 0.18, ease: "power2.out" });

    let mouseX = 0;
    let mouseY = 0;
    let isMagnetic  = false;
    let magneticRAF = 0;

    // ── Magnetic ──────────────────────────────────────────────────────────
    function tickMagnetic() {
      if (!isMagnetic) return;
      const magnets = document.querySelectorAll<HTMLElement>(".cursor-magnetic");
      let nearestDist = Infinity;
      let nearestEl: HTMLElement | null = null;
      magnets.forEach((el) => {
        const r  = el.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const d  = Math.hypot(mouseX - cx, mouseY - cy);
        if (d < nearestDist) { nearestDist = d; nearestEl = el; }
      });
      if (nearestEl && nearestDist < 110) {
        const r    = (nearestEl as HTMLElement).getBoundingClientRect();
        const cx   = r.left + r.width  / 2;
        const cy   = r.top  + r.height / 2;
        const pull = Math.max(0, 1 - nearestDist / 110);
        xHalo(mouseX - HALO_R + (cx - mouseX) * pull * 0.4);
        yHalo(mouseY - HALO_R + (cy - mouseY) * pull * 0.4);
      }
      magneticRAF = requestAnimationFrame(tickMagnetic);
    }

    // ── Click ripple ──────────────────────────────────────────────────────
    function spawnRipple(x: number, y: number) {
      if (reducedMotion) return;
      const r = document.createElement("div");
      r.style.cssText = `
        position:fixed;top:${y}px;left:${x}px;
        width:8px;height:8px;border-radius:50%;
        border:1.5px solid rgba(255,117,31,0.5);
        pointer-events:none;z-index:9996;
        transform:translate(-50%,-50%) scale(1);
        will-change:transform,opacity;
      `;
      document.body.appendChild(r);
      gsap.to(r, {
        scale: 5, opacity: 0, duration: 0.5, ease: "power2.out",
        onComplete: () => r.remove(),
      });
    }

    // ── Mouse move ────────────────────────────────────────────────────────
    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(arrow, { x: mouseX - TIP_X, y: mouseY - TIP_Y });
      if (!isMagnetic) {
        xHalo(mouseX - HALO_R);
        yHalo(mouseY - HALO_R);
      }
    }

    // ── Click ─────────────────────────────────────────────────────────────
    function onClick(e: MouseEvent) {
      if (reducedMotion) return;
      gsap.timeline()
        .to(arrow, { scale: 0.72, rotation: -5, duration: 0.1,  ease: "power2.in" })
        .to(arrow, { scale: 1.15, rotation: 0,  duration: 0.2,  ease: "back.out(2.5)" })
        .to(arrow, { scale: 1,                  duration: 0.15, ease: "power2.out" });
      // Halo pulses slightly on click (scale only — don't touch opacity/autoAlpha)
      gsap.timeline()
        .to(halo, { scale: 1.5, duration: 0.18, ease: "power2.out" })
        .to(halo, { scale: 1,   duration: 0.3,  ease: "power2.out" });
      spawnRipple(e.clientX, e.clientY);
    }

    // ── Hover ─────────────────────────────────────────────────────────────
    function onMouseOver(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a, button, [role='button']");
      if (!target || reducedMotion) return;
      gsap.to(arrow, { scale: 1.12, rotation: -10, duration: 0.22, ease: "back.out(2)" });
      gsap.to(halo,  { scale: 1.3, duration: 0.25, ease: "power2.out" });
      if ((target as HTMLElement).closest(".cursor-magnetic")) {
        isMagnetic = true;
        cancelAnimationFrame(magneticRAF);
        magneticRAF = requestAnimationFrame(tickMagnetic);
      }
    }

    function onMouseOut(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a, button, [role='button']");
      if (!target || reducedMotion) return;
      gsap.to(arrow, { scale: 1, rotation: 0, duration: 0.25, ease: "power2.out" });
      gsap.to(halo,  { scale: 1, duration: 0.25, ease: "power2.out" });
      if ((target as HTMLElement).closest(".cursor-magnetic")) {
        isMagnetic = false;
        cancelAnimationFrame(magneticRAF);
        xHalo(mouseX - HALO_R);
        yHalo(mouseY - HALO_R);
      }
    }

    function onDocLeave() { gsap.to([arrow, halo], { autoAlpha: 0, duration: 0.2 }); }
    function onDocEnter() {
      // Snap to last known position before fading in so it never shows at (0,0)
      gsap.set(arrow, { x: mouseX - TIP_X,  y: mouseY - TIP_Y });
      gsap.set(halo,  { x: mouseX - HALO_R, y: mouseY - HALO_R });
      gsap.to([arrow, halo], { autoAlpha: 1, duration: 0.2 });
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("click",     onClick);
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mouseout",  onMouseOut,  { passive: true });
    document.addEventListener("mouseleave", onDocLeave);
    document.addEventListener("mouseenter", onDocEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click",     onClick);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mouseout",  onMouseOut);
      document.removeEventListener("mouseleave", onDocLeave);
      document.removeEventListener("mouseenter", onDocEnter);
      document.getElementById("custom-cursor-style")?.remove();
      cancelAnimationFrame(magneticRAF);
    };
  }, []);

  return (
    <>
      {/* Tenue halo naranja — siempre visible alrededor del cursor */}
      <div
        ref={haloRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,117,31,0.28) 0%, rgba(255,117,31,0.12) 45%, rgba(255,117,31,0) 75%)",
          filter: "blur(10px)",
          pointerEvents: "none",
          zIndex: 9997,
          visibility: "hidden",
          willChange: "transform",
        }}
      />

      {/* Arrow cursor */}
      <div
        ref={arrowRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 9999,
          visibility: "hidden",
          willChange: "transform",
          transformOrigin: "2px 2px",
        }}
      >
        <svg viewBox="0 0 14 22" width="18" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2 2 L2 17.5 L5.5 14 L7.5 20.5 L10 19.5 L8 13.5 L12.5 13.5 Z"
            fill="#ff751f"
            stroke="#c25510"
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}
