"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { initialActionState, type ActionState } from "@/lib/validations/common";

/**
 * Wraps a Server Action for use with onSubmit. Unlike `<form action>`, this keeps
 * what the user typed when validation fails (React resets uncontrolled fields
 * after a form action completes).
 */
export function useFormAction(fn: (prev: ActionState, formData: FormData) => Promise<ActionState>) {
  const [state, dispatch, pending] = useActionState(fn, initialActionState);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };
  return { state, onSubmit, pending };
}
