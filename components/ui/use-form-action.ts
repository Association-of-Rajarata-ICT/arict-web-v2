"use client";

import { startTransition, useActionState, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FORM_NOTIFICATION_DURATION_MS } from "@/lib/form-feedback";
import { initialActionState, type ActionState } from "@/lib/validations/common";

/**
 * Runs a Server Action from a form. Failed submissions keep their values; after a
 * successful one the form starts fresh (put `key={formKey}` on the <form>).
 *
 * With Cache Components, Next.js keeps visited pages mounted but hidden (React
 * <Activity>), so leaving "New event" for the list and coming back would otherwise
 * show the previous result and filled-in fields. The stale result is dropped and
 * the form remounted with its defaults when the page is hidden.
 */
export function useFormAction(
  fn: (prev: ActionState, formData: FormData) => Promise<ActionState>,
  {
    successHref,
    refreshOnSuccess = false,
    onClear,
    version,
  }: {
    successHref?: string;
    refreshOnSuccess?: boolean;
    /** Resets state that lives outside the <form> (it isn't remounted with it). */
    onClear?: () => void;
    /** For edit forms, e.g. the record's updatedAt: fields reload from the props when it changes. */
    version?: Date | string | number | null;
  } = {},
) {
  const router = useRouter();
  const [formKey, setFormKey] = useState(0);
  const versionKey = version instanceof Date ? version.getTime() : (version ?? "");
  const [seenVersion, setSeenVersion] = useState(versionKey);
  if (seenVersion !== versionKey) {
    setSeenVersion(versionKey);
    onClear?.();
  }
  // A successful result that should be discarded once the user moves on.
  const stale = useRef(false);
  // True between a successful save and the redirect hiding this page, to block double submits.
  const leaving = useRef(false);
  const onClearRef = useRef(onClear);

  const clear = () => {
    setFormKey((k) => k + 1);
    onClearRef.current?.();
  };

  // `null` discards the last result. It goes through the action queue, so it always lands after the save.
  const [state, dispatch, pending] = useActionState(async (prev: ActionState, formData: FormData | null) => {
    if (!formData) return initialActionState;
    const result = await fn(prev, formData);
    if (result.ok) {
      stale.current = true;
      if (successHref) {
        leaving.current = true;
        const separator = successHref.includes("?") ? "&" : "?";
        router.replace(`${successHref}${separator}saved=${encodeURIComponent(result.message ?? "Changes saved.")}`);
      } else {
        startTransition(clear);
        if (refreshOnSuccess) router.refresh();
      }
    }
    return result;
  }, initialActionState);
  const [dismissedState, setDismissedState] = useState<ActionState | null>(null);
  const [resetState, setResetState] = useState<ActionState | null>(null);

  useLayoutEffect(() => {
    onClearRef.current = onClear;
  });

  // Runs when Activity hides the page (or it unmounts): forget a finished submission.
  useLayoutEffect(
    () => () => {
      leaving.current = false;
      if (!stale.current) return;
      stale.current = false;
      startTransition(() => {
        dispatch(null);
        clear();
      });
    },
    [dispatch], // stable: the cleanup runs only when the page is hidden or unmounted
  );

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
    if (pending || leaving.current) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };
  // Reopening is explicit; expiring a success notification never reopens a form.
  const reset = () => {
    stale.current = false;
    setResetState(state);
  };
  return { state: visibleState, onSubmit, pending, reset, formKey: `${formKey}:${versionKey}` };
}
