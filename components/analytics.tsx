"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/** Vercel Web Analytics for public pages. Admin activity is not tracked. */
export function SiteAnalytics() {
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
