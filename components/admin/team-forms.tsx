"use client";

import { useState } from "react";
import { saveMember, saveTerm } from "@/actions/admin/team";
import type { TeamMember, TeamPosition, TeamTerm } from "@/lib/db/schema";
import { EXECUTIVE_POSITIONS, POSITION_LABELS } from "@/lib/team";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { useFormAction } from "@/components/ui/use-form-action";
import { Card } from "./ui";

export function MemberForm({
  member,
  terms,
  defaultTermId,
}: {
  member?: TeamMember;
  terms: Pick<TeamTerm, "id" | "title" | "isCurrent">[];
  defaultTermId?: string;
}) {
  const { state, onSubmit, pending } = useFormAction(saveMember);
  const [position, setPosition] = useState<TeamPosition>(member?.position ?? "committee_member");
  const [uploading, setUploading] = useState(false);
  const e = state.fieldErrors ?? {};
  const committee = position === "committee_member";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {member && <input type="hidden" name="id" value={member.id} />}
      {state.message && <FormMessage tone={state.ok ? "success" : "error"}>{state.message}</FormMessage>}

      <Card title="Role">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Committee term" name="teamTermId" required error={e.teamTermId}>
            <Select name="teamTermId" defaultValue={member?.teamTermId ?? defaultTermId} error={e.teamTermId}>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                  {t.isCurrent ? " (current)" : ""}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Position" name="position" required error={e.position}>
            <Select name="position" value={position} onChange={(ev) => setPosition(ev.target.value as TeamPosition)} error={e.position}>
              <optgroup label="Executive Committee">
                {EXECUTIVE_POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {POSITION_LABELS[p]}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Committee">
                <option value="committee_member">Committee Member</option>
              </optgroup>
            </Select>
          </Field>
          <Field
            label="Academic year"
            name="academicYear"
            required
            error={e.academicYear}
            hint={committee ? "Each year has 4 committee seats." : undefined}
          >
            <Select name="academicYear" defaultValue={String(member?.academicYear ?? 1)} error={e.academicYear} hasHint={committee}>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              {!committee && <option value="4">4th Year</option>}
            </Select>
          </Field>
        </div>
      </Card>

      <Card title="Profile">
        <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
          <ImageUpload
            name="image"
            label="Profile photo"
            scope="admin"
            aspect="aspect-square"
            defaultValue={member?.image ? [member.image] : []}
            error={e.image}
            hint="Square, max 4 MB."
            onBusyChange={setUploading}
          />
          <div className="space-y-5">
            <Field label="Full name" name="fullName" required error={e.fullName}>
              <Input name="fullName" defaultValue={member?.fullName} required maxLength={120} error={e.fullName} />
            </Field>
            <Field label="Short bio" name="bio" error={e.bio}>
              <Textarea name="bio" defaultValue={member?.bio ?? ""} rows={3} maxLength={400} error={e.bio} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Links" description="Only links that are filled in are shown on the site.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="LinkedIn" name="linkedinUrl" error={e.linkedinUrl}>
            <Input name="linkedinUrl" type="url" defaultValue={member?.linkedinUrl ?? ""} error={e.linkedinUrl} />
          </Field>
          <Field label="Portfolio" name="portfolioUrl" error={e.portfolioUrl}>
            <Input name="portfolioUrl" type="url" defaultValue={member?.portfolioUrl ?? ""} error={e.portfolioUrl} />
          </Field>
          <Field label="GitHub" name="githubUrl" error={e.githubUrl}>
            <Input name="githubUrl" type="url" defaultValue={member?.githubUrl ?? ""} error={e.githubUrl} />
          </Field>
          <Field label="Public email" name="email" error={e.email}>
            <Input name="email" type="email" defaultValue={member?.email ?? ""} error={e.email} />
          </Field>
        </div>
      </Card>

      <Card title="Display">
        <div className="flex flex-wrap items-end gap-6">
          <Field label="Display order" name="displayOrder" error={e.displayOrder} className="w-36">
            <Input name="displayOrder" type="number" min={0} max={999} defaultValue={member?.displayOrder ?? 0} error={e.displayOrder} />
          </Field>
          <Checkbox name="featuredOnHome" defaultChecked={member?.featuredOnHome ?? false} label="Feature on the homepage" className="pb-3" />
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="submit" variant="dark" size="lg" disabled={pending || uploading} className="shadow-float">
          {pending ? "Saving…" : member ? "Save member" : "Add member"}
        </Button>
      </div>
    </form>
  );
}

export function TermForm({ term }: { term?: TeamTerm }) {
  const { state, onSubmit, pending } = useFormAction(saveTerm);
  const e = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {term && <input type="hidden" name="id" value={term.id} />}
      {state.message && <FormMessage tone={state.ok ? "success" : "error"}>{state.message}</FormMessage>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" name="title" required error={e.title}>
          <Input name="title" defaultValue={term?.title} placeholder="e.g. 2027/28 Committee" required error={e.title} />
        </Field>
        <Field label="Year" name="year" required error={e.year} hint="Used in the public URL, e.g. /team/2027">
          <Input name="year" type="number" min={2000} max={2100} defaultValue={term?.year} required error={e.year} hasHint />
        </Field>
        <Field label="Start date" name="startDate" error={e.startDate}>
          <Input name="startDate" type="date" defaultValue={term?.startDate ?? ""} error={e.startDate} />
        </Field>
        <Field label="End date" name="endDate" error={e.endDate}>
          <Input name="endDate" type="date" defaultValue={term?.endDate ?? ""} error={e.endDate} />
        </Field>
      </div>
      <Field label="Description" name="description" error={e.description}>
        <Textarea name="description" rows={3} defaultValue={term?.description ?? ""} maxLength={1000} error={e.description} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? "Saving…" : term ? "Save term" : "Create term"}
        </Button>
      </div>
    </form>
  );
}
