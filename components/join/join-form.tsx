"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitJoinApplication } from "@/actions/public";
import { JOIN_INTERESTS } from "@/lib/validations/public";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, FormMessage, Honeypot, Input, Select, Textarea } from "@/components/ui/form";
import { useFormAction } from "@/components/ui/use-form-action";
import { useFormToken } from "@/components/ui/use-form-token";

export function JoinForm() {
  const { state, onSubmit, pending } = useFormAction(submitJoinApplication);
  const token = useFormToken();
  const formRef = useRef<HTMLFormElement>(null);
  const e = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.at && !state.ok) formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state]);

  if (state.ok) {
    return (
      <div role="status" className="rounded-3xl border border-line bg-white p-8 text-center shadow-soft sm:p-12">
        <CheckCircle2 aria-hidden className="mx-auto size-12 text-emerald-600" />
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Application received</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">{state.message}</p>
        <LinkButton href="/events" variant="dark" arrow className="mt-8">
          Explore upcoming events
        </LinkButton>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative space-y-10 rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
      <Honeypot />
      <input type="hidden" name="form_token" value={token} />
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold tracking-tight">Your details</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="fullName" required error={e.fullName}>
            <Input name="fullName" autoComplete="name" required maxLength={120} error={e.fullName} />
          </Field>
          <Field label="Email" name="email" required error={e.email}>
            <Input name="email" type="email" autoComplete="email" required maxLength={254} error={e.email} />
          </Field>
          <Field label="Phone" name="phone" required error={e.phone}>
            <Input name="phone" type="tel" autoComplete="tel" required maxLength={20} placeholder="+94 7X XXX XXXX" error={e.phone} />
          </Field>
          <Field label="Registration number" name="registrationNumber" required error={e.registrationNumber}>
            <Input name="registrationNumber" required maxLength={40} placeholder="e.g. ICT/2025/001" error={e.registrationNumber} />
          </Field>
          <Field label="Academic year" name="academicYear" required error={e.academicYear}>
            <Select name="academicYear" required defaultValue="" error={e.academicYear}>
              <option value="" disabled>
                Select year
              </option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </Select>
          </Field>
          <Field label="Degree / program" name="degree" required error={e.degree}>
            <Input name="degree" required maxLength={120} placeholder="e.g. BSc in ICT" error={e.degree} />
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-semibold tracking-tight">
          Areas of interest <span className="text-brand">*</span>
        </legend>
        <p className="mt-1 text-sm text-muted">Choose everything that interests you.</p>
        <div className="mt-4 flex flex-wrap gap-2" aria-describedby={e.interests ? "interests-error" : undefined}>
          {JOIN_INTERESTS.map((interest) => (
            <label
              key={interest}
              className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm text-ink/80 transition-colors select-none has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand"
            >
              <input type="checkbox" name="interests" value={interest} className="sr-only" />
              {interest}
            </label>
          ))}
        </div>
        {e.interests && (
          <p id="interests-error" role="alert" className="mt-2 text-xs font-medium text-red-600">
            {e.interests}
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold tracking-tight">About you</legend>
        <Field label="Technical skills" name="skills" required error={e.skills} hint="Languages, tools or design skills — beginners are welcome.">
          <Textarea name="skills" required rows={3} maxLength={1000} error={e.skills} hasHint />
        </Field>
        <Field label="Why do you want to join ARICT?" name="reason" required error={e.reason}>
          <Textarea name="reason" required rows={5} maxLength={2000} error={e.reason} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="LinkedIn" name="linkedinUrl" error={e.linkedinUrl}>
            <Input name="linkedinUrl" type="url" inputMode="url" placeholder="https://www.linkedin.com/in/…" error={e.linkedinUrl} />
          </Field>
          <Field label="GitHub" name="githubUrl" error={e.githubUrl}>
            <Input name="githubUrl" type="url" inputMode="url" placeholder="https://github.com/…" error={e.githubUrl} />
          </Field>
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">Your details are only shared with the ARICT committee.</p>
        <Button type="submit" variant="dark" size="lg" arrow={!pending} disabled={pending || !token}>
          {pending ? "Submitting…" : "Submit Application"}
        </Button>
      </div>
    </form>
  );
}
