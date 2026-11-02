"use client";

import { useSyncExternalStore } from "react";

/**
 * Visitor consent for optional third-party features (Vercel Analytics,
 * embedded Google Maps). Stored on the device for 12 months; essential
 * storage (theme, this choice, form cooldowns) never needs consent.
 */
export type ConsentStatus = "pending" | "unset" | "accepted" | "declined";

const KEY = "arict-consent";
const CHANGE = "arict-consent-change";
const OPEN = "arict-consent-open";
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

function read(): Exclude<ConsentStatus, "pending"> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return "unset";
    const { value, at } = JSON.parse(raw) as { value?: string; at?: number };
    if ((value !== "accepted" && value !== "declined") || !at || Date.now() - at > MAX_AGE_MS) return "unset";
    return value;
  } catch {
    return "unset";
  }
}

export function setConsent(value: "accepted" | "declined") {
  try {
    localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() }));
  } catch {
    // Storage unavailable: the choice applies to this page view only.
  }
  window.dispatchEvent(new Event(CHANGE));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** "pending" during server render and hydration, then the stored choice. */
export function useConsent(): ConsentStatus {
  return useSyncExternalStore(subscribe, read, () => "pending");
}

/** Reopens the consent banner (used by the footer "Cookie settings" link). */
export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN));
}

export function onOpenConsentSettings(handler: () => void) {
  window.addEventListener(OPEN, handler);
  return () => window.removeEventListener(OPEN, handler);
}
