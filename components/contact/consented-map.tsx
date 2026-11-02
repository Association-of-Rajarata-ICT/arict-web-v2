"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useConsent } from "@/lib/consent";

/**
 * Google Maps sets third-party cookies, so the embed only loads after the
 * visitor accepts in the consent banner, or clicks "Show map" for this visit.
 */
export function ConsentedMap({ src, title }: { src: string; title: string }) {
  const consent = useConsent();
  const [loadOnce, setLoadOnce] = useState(false);
  const show = consent === "accepted" || loadOnce;

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-mist">
      {show ? (
        <iframe src={src} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[4/3] w-full" />
      ) : (
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 p-6 text-center">
          <MapPin aria-hidden className="size-7 text-muted" />
          <p className="max-w-xs text-sm text-body">The map is provided by Google Maps, which may set its own cookies.</p>
          <button
            type="button"
            onClick={() => setLoadOnce(true)}
            className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            Show map
          </button>
        </div>
      )}
    </div>
  );
}
