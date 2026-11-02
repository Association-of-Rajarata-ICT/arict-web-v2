"use client";

import { startTransition, useActionState, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { initialActionState, type ActionState } from "@/lib/validations/common";

/**
 * Runs a Server Action from a form. The result's message is shown as a toast (field
 * errors stay next to their fields). Failed submissions keep their values; after a
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
    successToast = true,
  }: {
    successHref?: string;
    refreshOnSuccess?: boolean;
    /** Set to false when the form shows its own confirmation screen instead. */
    successToast?: boolean;
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
    if (!result.ok) {
      toast.error(result.message ?? "Something went wrong. Please try again.");
    } else {
      // The toaster lives in the root layout, so the message stays visible across the redirect.
      if (successToast) toast.success(result.message ?? "Changes saved.");
      stale.current = true;
      if (successHref) {
        leaving.current = true;
        router.replace(successHref);
      } else {
        startTransition(clear);
        if (refreshOnSuccess) router.refresh();
      }
    }
    return result;
  }, initialActionState);

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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || leaving.current) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };
  return { state, onSubmit, pending, formKey: `${formKey}:${versionKey}` };
}
