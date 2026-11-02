"use client";

import { useState } from "react";
import { saveMember, saveTerm } from "@/actions/admin/team";
import type { TeamMember, TeamPosition, TeamTerm } from "@/lib/db/schema";
import {
  CUSTOM_POSITION_MAX_LENGTH,
  CUSTOM_YEAR_MAX_LENGTH,
  EXECUTIVE_POSITIONS,
  HOME_TEAM_LIMIT,
  OTHER_YEAR,
  POSITION_LABELS,
} from "@/lib/team";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { useFormAction } from "@/components/ui/use-form-action";
import { FormComplete } from "@/components/ui/form-complete";
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
  const defaultPosition = member?.position ?? "committee_member";
  const defaultCustom = member?.customPosition ?? "";
  const defaultYear = String(member?.academicYear ?? 1);
  const defaultCustomYear = member?.customYear ?? "";
  const [position, setPosition] = useState<TeamPosition | "">(defaultPosition);
  const [customPosition, setCustomPosition] = useState(defaultCustom);
  const [year, setYear] = useState(defaultYear);
  const [customYear, setCustomYear] = useState(defaultCustomYear);
  const { state, onSubmit, pending, formKey } = useFormAction(saveMember, {
    successHref: "/admin/team",
    onClear: () => {
      setPosition(defaultPosition);
      setCustomPosition(defaultCustom);
      setYear(defaultYear);
      setCustomYear(defaultCustomYear);
    },
    version: member?.updatedAt,
  });
  const [uploading, setUploading] = useState(false);
  const e = state.fieldErrors ?? {};
  const committee = position === "committee_member";

  return (
    <form key={formKey} onSubmit={onSubmit} noValidate className="space-y-6">
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
            <Select
              name="position"
              value={position}
              onChange={(ev) => {
                const next = ev.target.value as TeamPosition;
                setPosition(next);
                // Committee seats are for 1st–3rd year students only.
                if (next === "committee_member" && (year === "4" || year === String(OTHER_YEAR))) setYear("");
              }}
              error={e.position}
            >
              <option value="" disabled>Select position</option>
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
              {/* Only for members saved with a typed-in position before it was retired. */}
              {member?.position === "other" && <option value="other">Custom position</option>}
            </Select>
          </Field>
          <Field
            label="Current Status"
            name="academicYear"
            required
            error={e.academicYear}
            hint={committee ? "Each year has 4 committee seats." : undefined}
          >
            <Select name="academicYear" value={year} onChange={(ev) => setYear(ev.target.value)} error={e.academicYear} hasHint={committee}>
              <option value="" disabled>Select current status</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              {!committee && <option value="4">4th Year</option>}
              {!committee && <option value={OTHER_YEAR}>Other (e.g. Lecturer)</option>}
            </Select>
          </Field>
          {year === String(OTHER_YEAR) && (
            <Field
              label="Please specify"
              name="customYear"
              required
              error={e.customYear}
              hint={`Shown as the current status. ${customYear.length}/${CUSTOM_YEAR_MAX_LENGTH} characters`}
              className="sm:col-span-3"
            >
              <Input
                name="customYear"
                value={customYear}
                onChange={(ev) => setCustomYear(ev.target.value)}
                required
                maxLength={CUSTOM_YEAR_MAX_LENGTH}
                placeholder="e.g. Senior Lecturer"
                autoFocus={!member?.customYear}
                error={e.customYear}
                hasHint
              />
            </Field>
          )}
          {position === "other" && (
            <Field
              label="Position title"
              name="customPosition"
              required
              error={e.customPosition}
              hint={`${customPosition.length}/${CUSTOM_POSITION_MAX_LENGTH} characters`}
              className="sm:col-span-3"
            >
              <Input
                name="customPosition"
                value={customPosition}
                onChange={(ev) => setCustomPosition(ev.target.value)}
                required
                maxLength={CUSTOM_POSITION_MAX_LENGTH}
                error={e.customPosition}
                hasHint
              />
            </Field>
          )}
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
        </div>
      </Card>

      <Card
        title="Display"
        description={`New members appear at the end of their section; change the order from Team members → Display order. The homepage shows up to ${HOME_TEAM_LIMIT} featured members of the current term.`}
      >
        <Checkbox name="featuredOnHome" defaultChecked={member?.featuredOnHome ?? false} label="Feature on the homepage" />
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
  const { state, onSubmit, pending, reset } = useFormAction(saveTerm, {
    successHref: term ? "/admin/team/terms" : undefined,
    refreshOnSuccess: !term,
  });
  const e = state.fieldErrors ?? {};
  if (state.ok) return <FormComplete message={state.message} reopenLabel={term ? "Edit term" : "Add another term"} onReopen={reset} />;
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
