"use client";

import { useState } from "react";
import { saveEvent } from "@/actions/admin/events";
import type { Event, EventImage } from "@/lib/db/schema";
import { EVENT_CATEGORIES } from "@/lib/validations/public";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { useFormAction } from "@/components/ui/use-form-action";
import { Card } from "./ui";
import { TitleSlugFields } from "./slug-field";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  postponed: "Postponed",
  cancelled: "Cancelled",
  completed: "Completed",
  archived: "Archived (hidden from the public site)",
};

export function EventForm({ event, categories }: { event?: Event & { images: EventImage[] }; categories: string[] }) {
  const { state, onSubmit, pending } = useFormAction(saveEvent);
  const [uploading, setUploading] = useState(0);
  const e = state.fieldErrors ?? {};
  const onBusy = (b: boolean) => setUploading((n) => Math.max(0, n + (b ? 1 : -1)));
  const allCategories = [...new Set([...EVENT_CATEGORIES, ...categories])];

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {event && <input type="hidden" name="id" value={event.id} />}
      {state.message && <FormMessage tone={state.ok ? "success" : "error"}>{state.message}</FormMessage>}

      <Card title="Basics">
        <div className="space-y-5">
          <TitleSlugFields defaultTitle={event?.title} defaultSlug={event?.slug} errors={e} basePath="/events" />
          <Field label="Excerpt" name="excerpt" required error={e.excerpt} hint="Shown on event cards and in search results (10–300 characters).">
            <Textarea name="excerpt" defaultValue={event?.excerpt} rows={2} maxLength={300} required error={e.excerpt} hasHint />
          </Field>
          <Field
            label="Full description"
            name="content"
            error={e.content}
            hint="Blank line = new paragraph. Start lines with “## ” for headings and “- ” for bullet points."
          >
            <Textarea name="content" defaultValue={event?.content} rows={12} error={e.content} hasHint />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" name="category" required error={e.category}>
              <Select name="category" defaultValue={event?.category ?? "Workshop"} error={e.category}>
                {allCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Status" name="status" required error={e.status}>
              <Select name="status" defaultValue={event?.status ?? "scheduled"} error={e.status}>
                {Object.keys(STATUS_LABELS).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Date, time & venue">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Start date" name="startDate" required error={e.startDate}>
            <Input name="startDate" type="date" defaultValue={event?.startDate} required error={e.startDate} />
          </Field>
          <Field label="End date" name="endDate" error={e.endDate} hint="Leave empty for single-day events.">
            <Input name="endDate" type="date" defaultValue={event?.endDate ?? ""} error={e.endDate} hasHint />
          </Field>
          <Field label="Start time" name="startTime" error={e.startTime}>
            <Input name="startTime" type="time" defaultValue={event?.startTime?.slice(0, 5) ?? ""} error={e.startTime} />
          </Field>
          <Field label="End time" name="endTime" error={e.endTime}>
            <Input name="endTime" type="time" defaultValue={event?.endTime?.slice(0, 5) ?? ""} error={e.endTime} />
          </Field>
          <Field label="Venue" name="location" error={e.location} hint="Include “Online” for virtual events.">
            <Input name="location" defaultValue={event?.location ?? ""} maxLength={200} error={e.location} hasHint />
          </Field>
          <Field label="Organizer" name="organizer" error={e.organizer}>
            <Input name="organizer" defaultValue={event?.organizer ?? "ARICT"} maxLength={160} error={e.organizer} />
          </Field>
          <Field label="Registration URL" name="registrationUrl" error={e.registrationUrl} className="sm:col-span-2">
            <Input name="registrationUrl" type="url" defaultValue={event?.registrationUrl ?? ""} placeholder="https://forms.gle/…" error={e.registrationUrl} />
          </Field>
        </div>
      </Card>

      <Card title="Images" description="Every image must be 4 MB or less (JPG, PNG, WebP or AVIF).">
        <div className="space-y-6">
          <ImageUpload name="coverImage" label="Cover image" scope="admin" defaultValue={event?.coverImage ? [event.coverImage] : []} error={e.coverImage} onBusyChange={onBusy} />
          <ImageUpload
            name="images"
            label="Event photos"
            scope="admin"
            max={12}
            defaultValue={event?.images.map((i) => i.imageUrl) ?? []}
            error={e.images}
            hint="Shown on the event page. Up to 12 photos."
            onBusyChange={onBusy}
            aspect="aspect-[4/3]"
          />
          <Field label="Photo descriptions (alt text)" name="imageAltText" hint="One line per photo, in the same order. Describe what each photo shows.">
            <Textarea name="imageAltText" rows={4} defaultValue={event?.images.map((i) => i.altText).join("\n") ?? ""} hasHint />
          </Field>
        </div>
      </Card>

      <Card title="Visibility">
        <div className="flex flex-wrap gap-6">
          <Checkbox name="published" defaultChecked={event?.published ?? false} label="Published (visible on the public site)" />
          <Checkbox name="featured" defaultChecked={event?.featured ?? false} label="Featured" />
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="submit" variant="dark" size="lg" disabled={pending || uploading > 0} className="shadow-float">
          {pending ? "Saving…" : uploading > 0 ? "Uploading…" : event ? "Save changes" : "Create event"}
        </Button>
      </div>
    </form>
  );
}
