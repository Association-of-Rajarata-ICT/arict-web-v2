"use client";

import { useState } from "react";
import { slugify } from "@/lib/utils";
import { Field, Input } from "@/components/ui/form";

/** Title + slug inputs; the slug follows the title until edited manually. */
export function TitleSlugFields({
  defaultTitle = "",
  defaultSlug = "",
  errors,
  basePath,
  titleLabel = "Title",
}: {
  defaultTitle?: string;
  defaultSlug?: string;
  errors: Record<string, string>;
  basePath: string;
  titleLabel?: string;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState(defaultSlug);
  const [touched, setTouched] = useState(Boolean(defaultSlug));
  const value = touched ? slug : slugify(title);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label={titleLabel} name="title" required error={errors.title}>
        <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={160} error={errors.title} />
      </Field>
      <Field label="Slug" name="slug" required error={errors.slug} hint={`URL: ${basePath}/${value || "…"}`}>
        <Input
          name="slug"
          value={value}
          onChange={(e) => {
            setTouched(true);
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
          }}
          required
          maxLength={180}
          error={errors.slug}
          hasHint
        />
      </Field>
    </div>
  );
}
