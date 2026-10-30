"use client";

import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/form";
import { useFormAction } from "@/components/ui/use-form-action";

export function LoginForm({ next }: { next: string }) {
  const { state, onSubmit, pending } = useFormAction(login);
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}
      <Field label="Email" name="email" required>
        <Input name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field label="Password" name="password" required>
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" variant="dark" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
