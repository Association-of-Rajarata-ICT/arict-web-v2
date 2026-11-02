"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ONE_TIME_PARAMS = ["saved", "denied"];

/**
 * Shows a message passed in the URL by a redirect (e.g. ?denied=1) as a toast, then
 * removes it from the address bar so refreshing or going Back doesn't repeat it.
 */
export function UrlToast({ message, tone }: { message: string; tone: "success" | "warning" }) {
  const router = useRouter();
  // Next.js re-runs effects when returning to a page it kept in the background.
  const shown = useRef<string | null>(null);

  useEffect(() => {
    if (shown.current === message) return;
    shown.current = message;
    if (tone === "warning") toast.warning(message);
    else toast.success(message);

    const url = new URL(window.location.href);
    ONE_TIME_PARAMS.forEach((p) => url.searchParams.delete(p));
    router.replace(url.pathname + url.search + url.hash, { scroll: false });
  }, [message, tone, router]);

  return null;
}
