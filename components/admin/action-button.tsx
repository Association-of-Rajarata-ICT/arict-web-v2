"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/validations/common";
import { cn } from "@/lib/utils";

/**
 * Small button that runs a Server Action with hidden fields, optionally after a
 * confirmation prompt, and shows any error inline.
 */
export function ActionButton({
  action,
  fields,
  children,
  confirm: confirmText,
  tone = "default",
  className,
  title,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  children: ReactNode;
  confirm?: string;
  tone?: "default" | "danger" | "primary";
  className?: string;
  title?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const run = () => {
    if (confirmText && !window.confirm(confirmText)) return;
    setError(null);
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.append(k, v);
    start(async () => {
      const result = await action({ ok: false }, fd);
      if (!result.ok) setError(result.message ?? "Action failed.");
      else router.refresh();
    });
  };

  const tones = {
    default: "border-line bg-white text-ink hover:bg-mist",
    danger: "border-red-200 bg-white text-red-700 hover:bg-red-50",
    primary: "border-ink bg-ink text-white hover:bg-ink-soft",
  };

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        title={title}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-60",
          tones[tone],
          className,
        )}
      >
        {pending && <Loader2 aria-hidden className="size-3.5 animate-spin" />}
        {children}
      </button>
      {error && (
        <span role="alert" className="mt-1 max-w-56 text-xs text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
