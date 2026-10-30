"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitProject } from "@/actions/public";
import { MAX_SUBMISSION_SCREENSHOTS } from "@/lib/uploads";
import { PROJECT_CATEGORIES } from "@/lib/validations/public";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, FormMessage, Honeypot, Input, Select, Textarea } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { useFormAction } from "@/components/ui/use-form-action";
import { useFormToken } from "@/components/ui/use-form-token";

export function SubmissionForm({ currentYear }: { currentYear: number }) {
  const { state, onSubmit, pending } = useFormAction(submitProject);
  const token = useFormToken();
  const [uploading, setUploading] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const e = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.at && !state.ok) {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    }
  }, [state]);

  if (state.ok) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-8 text-center shadow-soft sm:p-12" role="status">
        <CheckCircle2 aria-hidden className="mx-auto size-12 text-emerald-600 dark:text-emerald-400" />
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Submission received</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">{state.message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/projects" variant="dark" arrow>
            View student projects
          </LinkButton>
          <Button variant="outline" onClick={() => location.reload()}>
            Submit another project
          </Button>
        </div>
      </div>
    );
  }

  const busy = pending || uploading > 0;
  const onBusy = (b: boolean) => setUploading((n) => Math.max(0, n + (b ? 1 : -1)));

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative space-y-12">
      <Honeypot />
      <input type="hidden" name="form_token" value={token} />

      {state.message && !state.ok && <FormMessage tone="error">{state.message}</FormMessage>}

      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold tracking-tight">About the project</legend>
        <Field label="Project Title" name="title" required error={e.title}>
          <Input name="title" required maxLength={160} error={e.title} placeholder="e.g. CampusConnect" />
        </Field>
        <Field label="Short Description" name="shortDescription" required error={e.shortDescription} hint="One or two sentences shown on project cards (20–300 characters).">
          <Textarea name="shortDescription" required maxLength={300} rows={3} error={e.shortDescription} hasHint />
        </Field>
        <Field
          label="Full Project Description"
          name="fullDescription"
          required
          error={e.fullDescription}
          hint="Explain the problem, what you built, how it works and the outcome. Separate paragraphs with a blank line; start a line with “- ” for bullet points."
        >
          <Textarea name="fullDescription" required maxLength={8000} rows={9} error={e.fullDescription} hasHint />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Project Category" name="category" required error={e.category}>
            <Select name="category" required defaultValue="" error={e.category}>
              <option value="" disabled>
                Choose a category
              </option>
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Project Year" name="projectYear" required error={e.projectYear}>
            <Input name="projectYear" type="number" inputMode="numeric" min={2000} max={currentYear + 1} defaultValue={currentYear} required error={e.projectYear} />
          </Field>
        </div>
        <Field label="Technologies Used" name="technologies" required error={e.technologies} hint="Separate with commas, e.g. Next.js, PostgreSQL, Tailwind CSS (up to 15).">
          <Input name="technologies" required maxLength={700} error={e.technologies} hasHint placeholder="React, Node.js, Firebase" />
        </Field>
        <Field label="Team Member Names" name="teamMembers" error={e.teamMembers} hint="Everyone who worked on the project, separated by commas.">
          <Input name="teamMembers" maxLength={1500} error={e.teamMembers} hasHint />
        </Field>
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold tracking-tight">Images</legend>
        <p className="-mt-3 text-sm text-muted">Each image must be 4 MB or less. JPG, PNG, WebP and AVIF are supported.</p>
        <ImageUpload name="coverImage" label="Cover Image" scope="submission" error={e.coverImage} hint="A wide image (16:10 works best) used on project cards." onBusyChange={onBusy} />
        <ImageUpload
          name="screenshots"
          label="Additional Screenshots"
          scope="submission"
          max={MAX_SUBMISSION_SCREENSHOTS}
          error={e.screenshots}
          hint={`Up to ${MAX_SUBMISSION_SCREENSHOTS} screenshots.`}
          onBusyChange={onBusy}
        />
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold tracking-tight">Links</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="GitHub URL" name="githubUrl" error={e.githubUrl}>
            <Input name="githubUrl" type="url" inputMode="url" placeholder="https://github.com/…" error={e.githubUrl} />
          </Field>
          <Field label="Live Demo URL" name="liveUrl" error={e.liveUrl}>
            <Input name="liveUrl" type="url" inputMode="url" placeholder="https://…" error={e.liveUrl} />
          </Field>
          <Field label="Project Video URL" name="videoUrl" error={e.videoUrl} hint="YouTube, Vimeo or Google Drive link.">
            <Input name="videoUrl" type="url" inputMode="url" error={e.videoUrl} hasHint />
          </Field>
          <Field label="Portfolio URL" name="portfolioUrl" error={e.portfolioUrl}>
            <Input name="portfolioUrl" type="url" inputMode="url" error={e.portfolioUrl} />
          </Field>
          <Field label="LinkedIn URL" name="linkedinUrl" error={e.linkedinUrl}>
            <Input name="linkedinUrl" type="url" inputMode="url" placeholder="https://www.linkedin.com/in/…" error={e.linkedinUrl} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold tracking-tight">About you</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Submitter Name" name="submitterName" required error={e.submitterName}>
            <Input name="submitterName" required autoComplete="name" maxLength={120} error={e.submitterName} />
          </Field>
          <Field label="Submitter Email" name="submitterEmail" required error={e.submitterEmail} hint="We'll only use this to contact you about your submission.">
            <Input name="submitterEmail" type="email" required autoComplete="email" maxLength={254} error={e.submitterEmail} hasHint />
          </Field>
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Submissions are reviewed by the ARICT team before anything is published.</p>
        <Button type="submit" variant="dark" size="lg" arrow={!busy} disabled={busy || !token} aria-disabled={busy || !token}>
          {pending ? "Submitting…" : uploading > 0 ? "Uploading images…" : "Submit Project"}
        </Button>
      </div>
    </form>
  );
}
