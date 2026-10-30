import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SITE } from "./site";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

/** Today's date in Sri Lanka as YYYY-MM-DD. */
export function todayInColombo(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Formats a YYYY-MM-DD date string without timezone drift. */
export function formatDate(
  value: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
) {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function formatDateRange(start: string, end?: string | null) {
  if (!end || end === start) return formatDate(start, { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  return `${formatDate(start, { day: "numeric", month: "short" })} – ${formatDate(end)}`;
}

/** "14:30:00" → "2:30 PM" */
export function formatTime(value: string | null | undefined) {
  if (!value) return "";
  const [h, m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatTimeRange(start?: string | null, end?: string | null) {
  if (!start) return "";
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);
}

export function dateParts(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return {
    day: String(d).padStart(2, "0"),
    month: new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(date),
    year: String(y),
  };
}

/** Builds an ISO 8601 timestamp in Sri Lanka time for structured data. */
export function toIsoInColombo(date: string, time?: string | null) {
  if (!time) return date;
  return `${date}T${time.slice(0, 8).padEnd(8, ":00")}${SITE.utcOffset}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

/** Keeps a meta description within ~155 characters. */
export function metaDescription(text: string) {
  return truncate(text.replace(/\s+/g, " ").trim(), 155);
}

export function nullIfEmpty<T extends string | null | undefined>(value: T) {
  return value && value.trim() !== "" ? value.trim() : null;
}

export function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
