"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// ─── Static content ───────────────────────────────────────────────────────────

const BENEFITS = [
  "275 M+ contactos B2B verificados",
  "Cold emails generados con IA en segundos",
  "Sincronización automática con HubSpot",
];

type AuthPanelVariant = "default" | "login";

interface AuthPanelProps {
  variant?: AuthPanelVariant;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Left branding panel for the auth split-screen layout.
 * Hidden on mobile (md:flex) — only visible on tablet/desktop.
 *
 * Entry animation is a GSAP timeline that orchestrates:
 * 1. Logo fade-in
 * 2. Headline slide-up
 * 3. Accent line scale-in (transform-origin: left)
 * 4. Benefits stagger slide-in from left
 * 5. Quote slide-up
 *
 * All animations respect `prefers-reduced-motion` via gsap.matchMedia().
 */
export function AuthPanel({ variant = "default" }: AuthPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isLoginVariant = variant === "login";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ── Full motion ──────────────────────────────────────────────────────
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /*
         * Set initial state synchronously (useGSAP uses useLayoutEffect
         * internally) so elements are hidden before the first paint.
         * Only animate transforms + opacity — compositor-only, no layout.
         */
        gsap.set(".ap-logo",    { autoAlpha: 0 });
        gsap.set(".ap-headline", { autoAlpha: 0, y: 28 });
        gsap.set(".ap-line",    { autoAlpha: 0, scaleX: 0, transformOrigin: "left center" });
        gsap.set(".ap-benefit", { autoAlpha: 0, x: -18 });
        gsap.set(".ap-quote",   { autoAlpha: 0, y: 18 });

        /*
         * Timeline with defaults + position parameter for overlapping tweens.
         * gsap-timeline best practice: pass defaults into the constructor so
         * child tweens don't repeat ease/duration.
         */
        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.55 },
          delay: 0.2,
        });

        tl
          // Logo fades in first
          .to(".ap-logo",    { autoAlpha: 1, duration: 0.45 })
          // Headline overlaps logo by 0.2s
          .to(".ap-headline", { autoAlpha: 1, y: 0 }, "-=0.2")
          // Accent line scales from left while headline finishes
          .to(".ap-line",    { autoAlpha: 1, scaleX: 1, ease: "power2.inOut", duration: 0.5 }, "-=0.25")
          // Benefits stagger in from the left
          .to(".ap-benefit", { autoAlpha: 1, x: 0, stagger: 0.1 }, "-=0.15")
          // Quote slides up after the last benefit
          .to(".ap-quote",   { autoAlpha: 1, y: 0 }, "-=0.1");
      });

      // ── Reduced motion — snap to final state instantly ───────────────────
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [".ap-logo", ".ap-headline", ".ap-line", ".ap-benefit", ".ap-quote"],
          { autoAlpha: 1, clearProps: "transform" }
        );
      });
    },
    { scope: panelRef }
  );

  return (
    <div
      ref={panelRef}
      className="relative hidden flex-col justify-between overflow-hidden bg-leadby-hero px-10 pb-10 pt-2 md:flex lg:px-14 lg:pb-14 lg:pt-3"
    >
      {/* ── Float orbs ──────────────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="glow-orb animate-float absolute -left-16 -top-16"
          style={{
            "--size": "360px",
            "--color": "rgba(255,117,31,0.20)",
            "--blur": "90px",
          } as React.CSSProperties}
        />
        <div
          className="glow-orb animate-float absolute bottom-0 right-0"
          style={{
            "--size": "280px",
            "--color": "rgba(255,145,77,0.13)",
            "--blur": "70px",
            animationDelay: "-3s",
          } as React.CSSProperties}
        />
      </div>

      {/* ── Top-left action ─────────────────────────────────────────────── */}
      {isLoginVariant ? (
        <Link
          href="/"
          aria-label="Volver a la landing"
          className="ap-logo relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/90 transition-colors hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      ) : (
        <Link href="/" className="ap-logo relative flex items-center gap-3">
          <Image
            src="/LEADBY-Auth.png"
            alt="LeadBy"
            width={36}
            height={36}
            className="h-9 w-9"
          />
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            LeadBy
          </span>
        </Link>
      )}

      {/* ── Main copy ───────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col justify-center py-6 lg:py-8">
        {isLoginVariant && (
          <div className="ap-headline mb-6 flex justify-center">
            <Image
              src="/LEADBY-Auth.png"
              alt="LeadBy"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>
        )}

        <h2
          className={
            isLoginVariant
              ? "ap-headline whitespace-nowrap text-2xl font-semibold leading-tight text-white lg:text-3xl"
              : "ap-headline text-balance text-3xl font-semibold leading-tight text-white lg:text-4xl"
          }
        >
          {isLoginVariant ? (
            "Tu próximo cliente está a un clic."
          ) : (
            <>
              Tu próximo cliente<br />está a un clic.
            </>
          )}
        </h2>

        {/* Animated accent line — scaleX from left */}
        <div className="ap-line mt-6 h-px w-full bg-gradient-to-r from-leadby-500 via-leadby-400/50 to-transparent" />

        <ul className="mt-8 flex flex-col gap-4">
          {BENEFITS.map((benefit, i) => (
            <li
              key={i}
              className="ap-benefit flex items-center gap-3 text-sm text-white/70"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leadby-500/25 text-leadby-400 text-xs">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Quote ───────────────────────────────────────────────────────── */}
      <div className="ap-quote relative rounded-xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
        <p className="text-sm italic leading-relaxed text-white/65">
          &quot;Antes tardábamos 2 semanas en llenar un pipeline. Ahora lo hacemos en una mañana.&quot;
        </p>
        <p className="mt-3 text-xs font-semibold text-white/40">
          Director Comercial · Fabricante CNC · Madrid
        </p>
      </div>
    </div>
  );
}
