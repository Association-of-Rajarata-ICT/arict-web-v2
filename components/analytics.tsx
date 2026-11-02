"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { useConsent } from "@/lib/consent";

/**
 * Vercel Web Analytics for public pages, loaded only after the visitor accepts
 * in the consent banner. Admin activity is never tracked.
 */
export function SiteAnalytics() {
  if (useConsent() !== "accepted") return null;
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => {
        const { pathname } = new URL(event.url);
        if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
        return event;
      }}
    />
  );
}
