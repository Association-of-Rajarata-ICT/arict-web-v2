"use client";

import { startTransition, useActionState, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { clearForm } from "@/lib/clear-form";
import { FORM_NOTIFICATION_DURATION_MS } from "@/lib/form-feedback";
import { initialActionState, type ActionState } from "@/lib/validations/common";

/**
 * Clears forms only after a successful Server Action. Failed submissions retain
 * their values, and the action still receives only FormData, never the DOM form.
 */
export function useFormAction(
  fn: (prev: ActionState, formData: FormData) => Promise<ActionState>,
  { successHref, refreshOnSuccess = false }: { successHref?: string; refreshOnSuccess?: boolean } = {},
) {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState(
    async (prev: ActionState, { form, formData }: { form: HTMLFormElement; formData: FormData }) => {
      const result = await fn(prev, formData);
      if (result.ok) {
        clearForm(form);
        if (successHref) {
          const separator = successHref.includes("?") ? "&" : "?";
          router.replace(`${successHref}${separator}saved=${encodeURIComponent(result.message ?? "Changes saved.")}`);
        } else if (refreshOnSuccess) {
          router.refresh();
        }
      }
      return result;
    },
    initialActionState,
  );
  const [dismissedState, setDismissedState] = useState<ActionState | null>(null);
  const [resetState, setResetState] = useState<ActionState | null>(null);

  useEffect(() => {
    if (!state.message || state === resetState) return;
    const timer = setTimeout(() => setDismissedState(state), FORM_NOTIFICATION_DURATION_MS);
    return () => clearTimeout(timer);
  }, [state, resetState]);

  // Keep validation errors and submission state; only expire the notification.
  const visibleState = useMemo(
    () => state === resetState ? initialActionState : state === dismissedState ? { ...state, message: undefined } : state,
    [state, dismissedState, resetState],
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || visibleState.ok) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(() => dispatch({ form, formData }));
  };
  // Reopening is explicit; expiring a success notification never reopens a form.
  const reset = () => setResetState(state);
  return { state: visibleState, onSubmit, pending, reset };
}
