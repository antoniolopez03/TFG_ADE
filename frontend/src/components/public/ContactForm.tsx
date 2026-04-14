"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";

type ContactFormStatus = "idle" | "loading" | "success" | "error";

interface ContactApiResponse {
  ok?: boolean;
  message?: string;
  error?: string;
}

function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function ContactForm() {
  const [status, setStatus] = useState<ContactFormStatus>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const inputClasses =
    "mt-1 w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-sm text-black shadow-sm placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:border-leadby-500 ring-leadby dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      nombre: getFormValue(formData, "nombre"),
      empresa: getFormValue(formData, "empresa"),
      email: getFormValue(formData, "email"),
      telefono: getFormValue(formData, "telefono"),
      cargo: getFormValue(formData, "cargo"),
      mensaje: getFormValue(formData, "mensaje"),
      website: getFormValue(formData, "website"),
    };

    if (!payload.nombre || !payload.empresa || !payload.email || !payload.mensaje) {
      setStatus("error");
      setFeedback("Completa nombre, empresa, email y mensaje para enviar la solicitud.");
      return;
    }

    setStatus("loading");
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as ContactApiResponse;

      if (!response.ok) {
        setStatus("error");
        setFeedback(data.error ?? "No se pudo enviar la solicitud. Inténtalo de nuevo.");
        return;
      }

      setStatus("success");
      setFeedback(data.message ?? "Solicitud enviada. Te contactaremos en menos de 48 horas.");
      form.reset();
    } catch {
      setStatus("error");
      setFeedback("No se pudo conectar con el servidor. Inténtalo de nuevo en unos minutos.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5"
      noValidate
    >
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Sitio web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="text-sm font-medium text-black/70 dark:text-white/70">
            Nombre y apellidos
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            placeholder="Antonio López"
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label htmlFor="empresa" className="text-sm font-medium text-black/70 dark:text-white/70">
            Empresa
          </label>
          <input
            id="empresa"
            name="empresa"
            type="text"
            placeholder="Empresa Industrial"
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-black/70 dark:text-white/70">
            Email corporativo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="tu@empresa.com"
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label htmlFor="telefono" className="text-sm font-medium text-black/70 dark:text-white/70">
            Teléfono
          </label>
          <input id="telefono" name="telefono" type="tel" placeholder="+34 600 000 000" className={inputClasses} />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="cargo" className="text-sm font-medium text-black/70 dark:text-white/70">
          Cargo / Departamento
        </label>
        <input id="cargo" name="cargo" type="text" placeholder="Dirección Comercial" className={inputClasses} />
      </div>

      <div className="mt-5">
        <label htmlFor="mensaje" className="text-sm font-medium text-black/70 dark:text-white/70">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={5}
          placeholder="Describe tu objetivo comercial y el volumen de cuentas que gestionas."
          className={inputClasses}
          required
        />
      </div>

      {feedback ? (
        <p
          className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
            status === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
          }`}
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-black/50 dark:text-white/50">
          Al enviar aceptas nuestra <Link href="/legal/privacy" className="underline hover:text-foreground">Política de Privacidad</Link> y los <Link href="/legal/terms" className="underline hover:text-foreground">Términos de Servicio</Link>.
        </p>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-full bg-leadby-500 px-6 py-3 text-sm font-semibold text-foreground shadow-leadby transition-colors hover:bg-leadby-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? "Enviando..." : "Enviar solicitud"}
        </button>
      </div>
    </form>
  );
}
