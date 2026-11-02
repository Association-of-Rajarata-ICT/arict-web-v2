"use client";

import { CheckCircle2, CircleAlert, Info, Loader2, TriangleAlert } from "lucide-react";
import { Toaster as Sonner } from "sonner";

/**
 * The one place messages appear across the site and the admin: call `toast.success(...)`,
 * `toast.error(...)` or `toast.info(...)` from "sonner". Styled with the theme tokens, so it
 * follows light/dark mode. Shown top-right, below the floating navbar (top on phones), for 5 seconds.
 */
export function Toaster() {
  return (
    <Sonner
      position="top-right"
      offset={{ top: 88, right: 16 }}
      mobileOffset={{ top: 80, left: 12, right: 12 }}
      visibleToasts={4}
      duration={5_000}
      closeButton
      icons={{
        success: <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />,
        error: <CircleAlert className="size-5 text-red-600 dark:text-red-400" />,
        warning: <TriangleAlert className="size-5 text-amber-600 dark:text-amber-400" />,
        info: <Info className="size-5 text-muted" />,
        loading: <Loader2 className="size-5 animate-spin text-muted" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 pr-10 text-ink shadow-float sm:w-[22rem]",
          title: "text-sm leading-snug font-medium",
          description: "mt-0.5 text-sm text-muted",
          icon: "mt-px shrink-0",
          closeButton:
            "absolute top-3 right-3 inline-flex size-6 items-center justify-center rounded-full text-muted hover:bg-mist hover:text-ink [&_svg]:size-3.5",
          actionButton: "ml-auto shrink-0 rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper",
          error: "border-red-200 dark:border-red-500/30",
          success: "border-emerald-200 dark:border-emerald-500/30",
        },
      }}
    />
  );
}
