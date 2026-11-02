"use client";

import type { ActionState } from "@/lib/validations/common";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";
import { useFormAction } from "@/components/ui/use-form-action";

/** Status + internal notes form shared by project submissions and join applications. */
export function ReviewForm({
  id,
  action,
  status,
  notes,
  options,
  successHref,
}: {
  id: string;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  status: string;
  notes: string | null;
  options: { value: string; label: string; disabled?: boolean }[];
  successHref: string;
}) {
  const { state, onSubmit, pending, formKey } = useFormAction(action, { successHref, version: `${status}:${notes ?? ""}` });
  return (
    <form key={formKey} onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <Field label="Status" name="status" required>
        <Select name="status" defaultValue={status}>
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Internal notes" name="adminNotes" hint="Only visible to admins. Never shown publicly." error={state.fieldErrors?.adminNotes}>
        <Textarea name="adminNotes" rows={5} defaultValue={notes ?? ""} maxLength={4000} hasHint />
      </Field>
      <Button type="submit" variant="dark" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Save review"}
      </Button>
    </form>
  );
}
