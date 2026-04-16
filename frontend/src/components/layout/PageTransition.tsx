"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * PageTransition — Fase 10 del Plan UI/UX.
 *
 * Envuelve {children} dentro del layout SaaS y gestiona dos tipos de
 * animación según el contexto:
 *
 *  • Primera carga  → fade-in + slide-up sutil (y:14 → 0, 420ms).
 *  • Cambio de ruta → "page wipe" naranja:
 *      1. Panel naranja entra por la derecha  (220ms, power3.inOut).
 *      2. Breve pausa (40ms).
 *      3. Panel sale por la izquierda         (280ms, power3.inOut).
 *      4. Contenido nuevo aparece a mitad del exit (300ms, power2.out).
 *
 * Implementación GSAP — patrones aplicados:
 *  • useGSAP() con { dependencies: [pathname], revertOnUpdate: true } →
 *    el contexto se revierte y re-crea en cada cambio de ruta, limpiando
 *    tweens y ScrollTriggers automáticamente (gsap-react).
 *  • gsap.matchMedia() con prefers-reduced-motion → sin animación para
 *    usuarios con vestibular disorders (gsap-core / accessibilidad).
 *  • Solo transform (xPercent, y) + autoAlpha → compositor-only, 0 layout
 *    thrashing (gsap-performance).
 *  • gsap.timeline({ defaults }) + position parameter "<0.1" para overlap
 *    preciso sin encadenar delays manuales (gsap-timeline).
 *  • clearProps: "all" en el fade-in inicial → las clases CSS recuperan
 *    control una vez termina la animación (gsap-core).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);

  /**
   * isFirstRender persiste entre renders del mismo layout pero se resetea
   * si el componente se desmonta (p. ej. log-out → log-in).
   */
  const isFirstRender = useRef(true);
  const pathname = usePathname();

  useGSAP(
    () => {
      /*
       * gsap.matchMedia() — conditions-object form para ramificar por
       * preferencia de movimiento sin duplicar código.
       * gsap-core best practice: siempre respetar prefers-reduced-motion.
       */
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion:  "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduced } = ctx.conditions as {
            motion: boolean;
            reduced: boolean;
          };

          // ── Reduced-motion: reveal inmediato, sin wipe ──────────────
          if (reduced) {
            gsap.set(contentRef.current, { autoAlpha: 1, clearProps: "y" });
            return;
          }

          // ── Primera carga: slide-up fade-in ─────────────────────────
          if (isFirstRender.current) {
            isFirstRender.current = false;

            /*
             * gsap.from() con immediateRender: true (default) → el estado
             * inicial se aplica antes del primer paint, evitando flash.
             * gsap-performance: y + autoAlpha únicamente.
             */
            gsap.from(contentRef.current, {
              autoAlpha: 0,
              y: 14,
              duration: 0.42,
              ease: "power2.out",
              clearProps: "all", // devuelve control a CSS al terminar
            });
            return;
          }

          // ── Cambio de ruta: wipe naranja ────────────────────────────
          //
          // Duración total ≈ 550ms (220 + 40 pausa + 280 exit | content 300ms)
          //
          // gsap-timeline: defaults en constructor, position param para overlap.
          // gsap-performance: xPercent (transform) + autoAlpha = compositor.
          const tl = gsap.timeline({
            defaults: { ease: "power3.inOut" },
          });

          tl
            // Estado inicial: wipe fuera de pantalla a la derecha, content oculto
            .set(wipeRef.current,    { xPercent: 100, autoAlpha: 1 })
            .set(contentRef.current, { autoAlpha: 0, y: 8 })

            // 1. Wipe entra por la derecha
            .to(wipeRef.current, { xPercent: 0, duration: 0.22 })

            // 2. Wipe sale por la izquierda (pausa implícita de 40ms via delay)
            .to(wipeRef.current, {
              xPercent: -100,
              duration: 0.28,
              delay: 0.04,
            })

            // 3. Content aparece a mitad del exit del wipe
            //    "<0.1" = 100ms después de que el tween anterior EMPIEZA
            .to(
              contentRef.current,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out",
              },
              "<0.1"
            )

            // 4. Ocultar el wipe para que no bloquee eventos de puntero
            .set(wipeRef.current, {
              autoAlpha: 0,
              clearProps: "xPercent",
            });
        }
      );
    },
    {
      scope: contentRef,
      /*
       * revertOnUpdate: true → en cada cambio de pathname, GSAP revierte
       * todos los tweens/ScrollTriggers de este contexto y re-ejecuta el
       * callback. Garantiza limpieza automática en cada navegación.
       * gsap-react best practice.
       */
      dependencies: [pathname],
      revertOnUpdate: true,
    }
  );

  return (
    <>
      {/*
       * Panel de wipe — fixed, z-index alto, pointer-events: none para no
       * bloquear interacción con el contenido en estados intermedios.
       * Oculto por defecto (GSAP lo activa con autoAlpha:1 al necesitarlo).
       */}
      <div
        ref={wipeRef}
        aria-hidden
        className="fixed inset-0 z-[999] pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, #ff751f 0%, #ff9a4d 45%, #ff751f 100%)",
          // Oculto hasta que GSAP lo active
          opacity: 0,
          visibility: "hidden",
        }}
      />

      {/* Contenedor del contenido de la página */}
      <div ref={contentRef} className="h-full">
        {children}
      </div>
    </>
  );
}
