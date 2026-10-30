import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed form-start tokens: the server issues one when a form mounts and checks
 * on submit that a human-plausible amount of time has passed.
 */
const MIN_FILL_MS = 3_000;
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

function sign(value: string) {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "arict-dev-secret").update(value).digest("base64url");
}

export function createFormToken(now = Date.now()) {
  const ts = String(now);
  return `${ts}.${sign(ts)}`;
}

export type SpamCheck = { ok: true } | { ok: false; reason: "honeypot" | "token" | "too_fast" | "expired" };

export function checkSpam(formData: FormData, now = Date.now()): SpamCheck {
  // Honeypot: real users never see or fill this field.
  const trap = formData.get("company_website");
  if (typeof trap === "string" && trap.trim() !== "") return { ok: false, reason: "honeypot" };

  const token = formData.get("form_token");
  if (typeof token !== "string") return { ok: false, reason: "token" };
  const [ts, sig] = token.split(".");
  if (!ts || !sig) return { ok: false, reason: "token" };
  const expected = Buffer.from(sign(ts));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: "token" };

  const elapsed = now - Number(ts);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return { ok: false, reason: "too_fast" };
  if (elapsed > MAX_AGE_MS) return { ok: false, reason: "expired" };
  return { ok: true };
}
