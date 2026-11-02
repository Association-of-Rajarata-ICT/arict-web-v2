"use client";

import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ActionState } from "@/lib/validations/common";
import { cn } from "@/lib/utils";

/**
 * Small button that runs a Server Action with hidden fields, optionally after a
 * confirmation prompt. Errors (and any success message) are shown as toasts.
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
  const router = useRouter();

  const run = () => {
    if (confirmText && !window.confirm(confirmText)) return;
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.append(k, v);
    start(async () => {
      const result = await action({ ok: false }, fd);
      if (!result.ok) {
        toast.error(result.message ?? "Action failed. Please try again.");
        return;
      }
      if (result.message) toast.success(result.message);
      router.refresh();
    });
  };

  const tones = {
    default: "border-line bg-surface text-ink hover:bg-mist",
    danger: "border-red-200 bg-surface text-red-700 dark:text-red-400 hover:bg-red-50 dark:text-red-400 dark:border-red-500/30 dark:hover:bg-red-500/10",
    primary: "border-ink bg-ink text-paper hover:bg-ink-soft",
  };

  return (
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
  );
}
