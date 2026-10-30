"use client";

import { useState } from "react";
import { createUser, resetPassword } from "@/actions/admin/users";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select } from "@/components/ui/form";
import { useFormAction } from "@/components/ui/use-form-action";

export function CreateUserForm() {
  const { state, onSubmit, pending } = useFormAction(createUser);
  const e = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {state.message && <FormMessage tone={state.ok ? "success" : "error"}>{state.message}</FormMessage>}
      <Field label="Name" name="name" required error={e.name}>
        <Input name="name" required error={e.name} />
      </Field>
      <Field label="Email" name="email" required error={e.email}>
        <Input name="email" type="email" required error={e.email} />
      </Field>
      <Field label="Role" name="role" required>
        <Select name="role" defaultValue="editor">
          <option value="editor">Editor — Events, Projects, Team</option>
          <option value="admin">Admin — content, applications, settings</option>
          <option value="super_admin">Super Admin — full access</option>
        </Select>
      </Field>
      <Field label="Temporary password" name="password" required error={e.password} hint="At least 10 characters.">
        <Input name="password" type="password" autoComplete="new-password" required minLength={10} error={e.password} hasHint />
      </Field>
      <Button type="submit" variant="dark" disabled={pending} className="w-full">
        {pending ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const { state, onSubmit, pending } = useFormAction(resetPassword);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="h-8 rounded-lg border border-line px-3 text-xs font-medium hover:bg-mist">
        Reset password
      </button>
    );
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-1">
      <input type="hidden" name="id" value={id} />
      <div className="flex gap-1.5">
        <input name="password" type="password" autoComplete="new-password" minLength={10} required placeholder="New password" aria-label="New password" className="h-8 w-36 rounded-lg border border-line px-2 text-xs" />
        <button type="submit" disabled={pending} className="h-8 rounded-lg bg-ink px-3 text-xs font-medium text-paper disabled:opacity-60">
          Save
        </button>
      </div>
      {state.message && <span className={`text-xs ${state.ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{state.message}</span>}
    </form>
  );
}
