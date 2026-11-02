"use client";

import { useState } from "react";
import { saveAnnouncement } from "@/actions/admin/announcements";
import type { Announcement } from "@/lib/db/schema";
import { ANNOUNCEMENT_KIND_LABELS } from "@/lib/announcements";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { useFormAction } from "@/components/ui/use-form-action";
import { Card } from "./ui";

export function AnnouncementForm({ announcement }: { announcement?: Announcement }) {
  const { state, onSubmit, pending, formKey } = useFormAction(saveAnnouncement, { successHref: "/admin/announcements", version: announcement?.updatedAt });
  const [uploading, setUploading] = useState(false);
  const errors = state.fieldErrors ?? {};

  return (
    <form key={formKey} onSubmit={onSubmit} noValidate className="space-y-6">
      {announcement && <input type="hidden" name="id" value={announcement.id} />}
      {state.message && <FormMessage tone={state.ok ? "success" : "error"}>{state.message}</FormMessage>}
      <Card title="Announcement" description="Shown in a popup when visitors open the public website.">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
            <Field label="Title" name="title" required error={errors.title}>
              <Input name="title" defaultValue={announcement?.title} maxLength={120} required error={errors.title} />
            </Field>
            <Field label="Type" name="kind" required error={errors.kind}>
              <Select name="kind" defaultValue={announcement?.kind ?? "news"} required error={errors.kind}>
                <option value="" disabled>Choose a type</option>
                {Object.entries(ANNOUNCEMENT_KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Message" name="message" required error={errors.message} hint="Shown for text-only announcements. With an image, this provides a description for screen readers. Up to 2,000 characters.">
            <Textarea name="message" defaultValue={announcement?.message} rows={6} maxLength={2000} required error={errors.message} hasHint />
          </Field>
        </div>
      </Card>
      <Card title="Image" description="Images appear at screen height without a card frame. Matching proportions fill the screen; wider images scroll sideways. Click the image or background to close.">
        <div className="space-y-5">
          <ImageUpload name="image" label="Announcement image" scope="admin" defaultValue={announcement?.image ? [announcement.image] : []} error={errors.image} onBusyChange={setUploading} aspect="aspect-[16/9]" />
          <Field label="Image description" name="imageAlt" error={errors.imageAlt} hint="Describe the image for visitors using screen readers.">
            <Input name="imageAlt" defaultValue={announcement?.imageAlt ?? ""} maxLength={200} error={errors.imageAlt} hasHint />
          </Field>
        </div>
      </Card>
      <Card title="Button" description="Optionally link to an event, registration page, or another website.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Button label" name="linkLabel" error={errors.linkLabel}>
            <Input name="linkLabel" defaultValue={announcement?.linkLabel ?? ""} maxLength={40} placeholder="e.g. Register now" error={errors.linkLabel} />
          </Field>
          <Field label="Destination" name="linkUrl" error={errors.linkUrl} hint="A page path like /events or a full https:// URL.">
            <Input name="linkUrl" defaultValue={announcement?.linkUrl ?? ""} maxLength={500} placeholder="/events" error={errors.linkUrl} hasHint />
          </Field>
        </div>
      </Card>
      <Card title="Publishing" description="Drafts are private. Published items appear in order, with the lowest number first.">
        <div className="flex flex-wrap items-end gap-6">
          <Field label="Display order" name="displayOrder" error={errors.displayOrder} className="w-40">
            <Input name="displayOrder" type="number" min={0} max={999} defaultValue={announcement?.displayOrder ?? 0} error={errors.displayOrder} />
          </Field>
          <Checkbox name="published" defaultChecked={announcement?.published ?? false} label="Publish on the website" className="pb-3" />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" variant="dark" disabled={pending || uploading}>
          {pending ? "Saving…" : uploading ? "Uploading…" : announcement ? "Save changes" : "Create announcement"}
        </Button>
      </div>
    </form>
  );
}
