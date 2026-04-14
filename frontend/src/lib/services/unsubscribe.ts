import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_TOKEN_TTL_DAYS = 45;

export interface UnsubscribeTokenPayload {
  orgId: string;
  leadId: string;
  email: string;
  exp: number;
}

interface BuildUnsubscribeTokenOptions {
  orgId: string;
  leadId: string;
  email: string;
  ttlDays?: number;
}

function getUnsubscribeSecret(): string {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET?.trim();

  if (!secret) {
    throw new Error("EMAIL_UNSUBSCRIBE_SECRET no configurada");
  }

  return secret;
}

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);

  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(rawPayload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(rawPayload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Genera un token firmado para gestionar bajas (opt-out) desde correo.
 */
export function createUnsubscribeToken(options: BuildUnsubscribeTokenOptions): string {
  const secret = getUnsubscribeSecret();
  const ttlDays = options.ttlDays && options.ttlDays > 0 ? options.ttlDays : DEFAULT_TOKEN_TTL_DAYS;

  const payload: UnsubscribeTokenPayload = {
    orgId: options.orgId,
    leadId: options.leadId,
    email: normalizeEmail(options.email),
    exp: Math.floor(Date.now() / 1000) + ttlDays * 24 * 60 * 60,
  };

  const rawPayload = JSON.stringify(payload);
  const encodedPayload = toBase64Url(rawPayload);
  const signature = sign(rawPayload, secret);

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifica token de baja y devuelve el payload si es valido.
 */
export function verifyUnsubscribeToken(token: string): UnsubscribeTokenPayload | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  try {
    const secret = getUnsubscribeSecret();
    const rawPayload = fromBase64Url(encodedPayload);
    const expectedSignature = sign(rawPayload, secret);

    const provided = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
      return null;
    }

    const parsed = JSON.parse(rawPayload) as Partial<UnsubscribeTokenPayload>;

    if (
      !parsed ||
      typeof parsed.orgId !== "string" ||
      typeof parsed.leadId !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    if (!parsed.orgId.trim() || !parsed.leadId.trim() || !parsed.email.trim()) {
      return null;
    }

    if (Math.floor(Date.now() / 1000) > parsed.exp) {
      return null;
    }

    return {
      orgId: parsed.orgId.trim(),
      leadId: parsed.leadId.trim(),
      email: normalizeEmail(parsed.email),
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}
