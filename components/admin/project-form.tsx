"use client";

import { useState } from "react";
import { saveProject } from "@/actions/admin/projects";
import type { ActionState } from "@/lib/validations/common";
import { PROJECT_CATEGORIES } from "@/lib/validations/public";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { useFormAction } from "@/components/ui/use-form-action";
import { Card } from "./ui";
import { TitleSlugFields } from "./slug-field";

export type ProjectFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  videoUrl: string | null;
  year: number;
  category: string;
  status: "in_progress" | "completed" | "archived";
  featured: boolean;
  published: boolean;
  technologies: string[];
  contributors: { name: string; role: string | null }[];
  screenshots: string[];
};

const STATUS = { in_progress: "In progress", completed: "Completed", archived: "Archived (hidden from the public site)" };

export function ProjectForm({
  project,
  action = saveProject,
  extraFields,
  submitLabel,
  showVisibility = true,
}: {
  project?: Partial<ProjectFormValues>;
  action?: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  extraFields?: Record<string, string>;
  submitLabel?: string;
  showVisibility?: boolean;
}) {
  const { state, onSubmit, pending } = useFormAction(action);
  const [uploading, setUploading] = useState(0);
  const e = state.fieldErrors ?? {};
  const onBusy = (b: boolean) => setUploading((n) => Math.max(0, n + (b ? 1 : -1)));
  const categories = [...new Set([...PROJECT_CATEGORIES, ...(project?.category ? [project.category] : [])])];

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {project?.id && <input type="hidden" name="id" value={project.id} />}
      {Object.entries(extraFields ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {state.message && <FormMessage tone={state.ok ? "success" : "error"}>{state.message}</FormMessage>}

      <Card title="Basics">
        <div className="space-y-5">
          <TitleSlugFields defaultTitle={project?.title} defaultSlug={project?.slug} errors={e} basePath="/projects" />
          <Field label="Excerpt" name="excerpt" required error={e.excerpt} hint="Shown on project cards (10–300 characters).">
            <Textarea name="excerpt" defaultValue={project?.excerpt} rows={2} maxLength={300} required error={e.excerpt} hasHint />
          </Field>
          <Field label="Full description" name="content" error={e.content} hint="Blank line = new paragraph. “## ” for headings, “- ” for bullet points.">
            <Textarea name="content" defaultValue={project?.content} rows={12} error={e.content} hasHint />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Category" name="category" required error={e.category}>
              <Select name="category" defaultValue={project?.category ?? PROJECT_CATEGORIES[0]} error={e.category}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Year" name="year" required error={e.year}>
              <Input name="year" type="number" defaultValue={project?.year} min={2000} max={2100} required error={e.year} />
            </Field>
            <Field label="Status" name="status" required error={e.status}>
              <Select name="status" defaultValue={project?.status ?? "completed"} error={e.status}>
                {Object.entries(STATUS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Technologies" name="technologies" error={e.technologies} hint="Comma separated, e.g. Next.js, PostgreSQL">
            <Input name="technologies" defaultValue={project?.technologies?.join(", ")} error={e.technologies} hasHint />
          </Field>
          <Field label="Contributors" name="contributors" error={e.contributors} hint="One per line as “Name - Role” (role optional).">
            <Textarea
              name="contributors"
              rows={4}
              defaultValue={project?.contributors?.map((c) => (c.role ? `${c.name} - ${c.role}` : c.name)).join("\n")}
              error={e.contributors}
              hasHint
            />
          </Field>
        </div>
      </Card>

      <Card title="Links">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="GitHub URL" name="githubUrl" error={e.githubUrl}>
            <Input name="githubUrl" type="url" defaultValue={project?.githubUrl ?? ""} error={e.githubUrl} />
          </Field>
          <Field label="Live demo URL" name="liveUrl" error={e.liveUrl}>
            <Input name="liveUrl" type="url" defaultValue={project?.liveUrl ?? ""} error={e.liveUrl} />
          </Field>
          <Field label="Video URL" name="videoUrl" error={e.videoUrl}>
            <Input name="videoUrl" type="url" defaultValue={project?.videoUrl ?? ""} error={e.videoUrl} />
          </Field>
        </div>
      </Card>

      <Card title="Images" description="Every image must be 4 MB or less (JPG, PNG, WebP or AVIF).">
        <div className="space-y-6">
          <ImageUpload name="coverImage" label="Cover image" scope="admin" defaultValue={project?.coverImage ? [project.coverImage] : []} error={e.coverImage} onBusyChange={onBusy} />
          <ImageUpload name="screenshots" label="Screenshots" scope="admin" max={10} defaultValue={project?.screenshots ?? []} error={e.screenshots} onBusyChange={onBusy} />
        </div>
      </Card>

      {showVisibility ? (
        <Card title="Visibility">
          <div className="flex flex-wrap gap-6">
            <Checkbox name="published" defaultChecked={project?.published ?? false} label="Published (visible on the public site)" />
            <Checkbox name="featured" defaultChecked={project?.featured ?? false} label="Featured on the homepage" />
          </div>
        </Card>
      ) : (
        <FormMessage tone="info">The new project will be created as an unpublished draft. Publish it from the project page when it&apos;s ready.</FormMessage>
      )}

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="submit" variant="dark" size="lg" disabled={pending || uploading > 0} className="shadow-float">
          {pending ? "Saving…" : uploading > 0 ? "Uploading…" : (submitLabel ?? (project?.id ? "Save changes" : "Create project"))}
        </Button>
      </div>
    </form>
  );
}
