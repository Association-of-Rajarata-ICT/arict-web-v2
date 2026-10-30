import { z } from "zod";
import { isAllowedImageUrl } from "../uploads";

export type FieldErrors = Record<string, string>;

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
  /** Monotonic marker so client components can react to each submission result. */
  at?: number;
};

export const initialActionState: ActionState = { ok: false };

export function fieldErrorsFrom(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/** Converts FormData into a plain object. Repeated keys become arrays; files are skipped. */
export function formToObject(formData: FormData, arrayKeys: string[] = []) {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue;
    const values = formData.getAll(key).filter((v): v is string => typeof v === "string");
    out[key] = arrayKeys.includes(key) || values.length > 1 ? values : (values[0] ?? "");
  }
  for (const key of arrayKeys) out[key] ??= [];
  return out;
}

// Strips ASCII control characters (except tab/newline) from user text.
const clean = (v: string) => v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

export const requiredText = (label: string, max: number, min = 1) =>
  z
    .string({ error: `${label} is required.` })
    .transform(clean)
    .pipe(
      z
        .string()
        .min(min, min > 1 ? `${label} must be at least ${min} characters.` : `${label} is required.`)
        .max(max, `${label} must be ${max} characters or fewer.`),
    );

export const optionalText = (max: number, label = "This field") =>
  z
    .string()
    .optional()
    .transform((v) => (v ? clean(v) : ""))
    .pipe(z.string().max(max, `${label} must be ${max} characters or fewer.`))
    .transform((v) => (v === "" ? null : v));

export const emailField = z
  .string({ error: "Email is required." })
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address.").max(254, "Email is too long."));

export const optionalEmail = z
  .string()
  .optional()
  .transform((v) => (v ?? "").trim().toLowerCase())
  .pipe(z.union([z.literal(""), z.email("Enter a valid email address.").max(254)]))
  .transform((v) => (v === "" ? null : v));

export const optionalUrl = (label = "URL") =>
  z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim())
    .pipe(
      z.union([
        z.literal(""),
        z
          .url({ protocol: /^https?$/, error: `${label} must be a valid http(s) link.` })
          .max(500, `${label} is too long.`),
      ]),
    )
    .transform((v) => (v === "" ? null : v));

export const optionalImage = z
  .string()
  .optional()
  .transform((v) => (v ?? "").trim())
  .refine((v) => v === "" || isAllowedImageUrl(v), "Upload the image again.")
  .transform((v) => (v === "" ? null : v));

export const checkbox = z
  .union([z.string(), z.boolean()])
  .optional()
  .transform((v) => v === true || v === "on" || v === "true" || v === "1");

/** Comma / newline separated list → deduplicated array. */
export const listField = (label: string, maxItems: number, maxLen: number) =>
  z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      const raw = Array.isArray(v) ? v : (v ?? "").split(/[,\n]/);
      const items = raw.map((s) => clean(s)).filter(Boolean);
      return Array.from(new Map(items.map((i) => [i.toLowerCase(), i])).values());
    })
    .pipe(
      z
        .array(z.string().max(maxLen, `Each ${label} must be ${maxLen} characters or fewer.`))
        .max(maxItems, `Add at most ${maxItems} ${label}s.`),
    );

export const dateField = (label: string) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be a valid date.`);

export const optionalDate = (label: string) =>
  z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim())
    .pipe(z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be a valid date.`)]))
    .transform((v) => (v === "" ? null : v));

export const optionalTime = (label: string) =>
  z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim())
    .pipe(z.union([z.literal(""), z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, `${label} must be a valid time.`)]))
    .transform((v) => (v === "" ? null : v.length === 5 ? `${v}:00` : v));

export const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .max(180, "Slug is too long.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.");

export const yearField = (label = "Year") =>
  z.coerce
    .number({ error: `${label} is required.` })
    .int(`${label} must be a whole number.`)
    .min(2000, `${label} looks too early.`)
    .max(2100, `${label} looks too far ahead.`);
