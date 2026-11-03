"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { onOpenConsentSettings, openConsentSettings, setConsent, useConsent } from "@/lib/consent";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Non-blocking consent card. Shown until the visitor accepts or declines, and
 * again whenever "Cookie settings" is used in the footer.
 */
export function ConsentBanner() {
  const consent = useConsent();
  const [reopened, setReopened] = useState(false);

  useEffect(() => onOpenConsentSettings(() => setReopened(true)), []);

  const visible = consent === "unset" || reopened;
  const choose = (value: "accepted" | "declined") => {
    setConsent(value);
    setReopened(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          key="consent"
          role="region"
          aria-label="Cookie and privacy choices"
          initial={{ opacity: 0, y: 24 }}
          // Wait a moment on first load so the banner doesn't compete with the hero; close immediately.
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE, delay: reopened ? 0 : 1.2 } }}
          exit={{ opacity: 0, y: 16, transition: { duration: 0.2, ease: EASE } }}
          className="fixed inset-x-3 bottom-3 z-[65] mx-auto max-w-md rounded-3xl border border-line bg-surface/95 p-4 text-ink shadow-float backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:left-5 sm:mx-0 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-mist text-ink/80 sm:inline-flex">
              <Cookie className="size-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-semibold">Your privacy choices</h2>
              <p className="mt-1 text-[13px] leading-snug text-body sm:mt-1.5 sm:text-sm sm:leading-relaxed">
                We&apos;d like to use privacy-friendly analytics to see which pages are useful, and show Google Maps on the
                Contact page (Google may set its own cookies). Essential storage, like your theme choice, is always on.{" "}
                <Link href="/privacy" className="font-medium text-ink underline underline-offset-2">
                  Privacy policy
                </Link>
              </p>
            </div>
            {reopened && consent !== "unset" && (
              <button
                type="button"
                onClick={() => setReopened(false)}
                aria-label="Close"
                className="-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-mist hover:text-ink"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          {reopened && consent !== "unset" && (
            <p className="mt-3 text-xs text-muted">
              Current choice: <span className="font-medium text-ink">{consent === "accepted" ? "Accepted" : "Declined"}</span>
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
            <button
              type="button"
              onClick={() => choose("declined")}
              className="inline-flex h-9 items-center justify-center rounded-full sm:h-10 border border-line bg-surface text-sm font-medium text-ink transition-colors hover:bg-mist"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="inline-flex h-9 items-center justify-center rounded-full sm:h-10 bg-ink text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
            >
              Accept
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/** Footer link that reopens the banner so visitors can change their choice. */
export function ConsentSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      Cookie settings
    </button>
  );
}
