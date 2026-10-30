"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadImage } from "@/lib/upload-client";
import { IMAGE_ACCEPT, validateImageFile, type UploadScope } from "@/lib/uploads";
import { cn } from "@/lib/utils";

type Item = { key: string; url?: string; preview?: string; status: "uploading" | "done" | "error"; error?: string };

/**
 * Uploads images as soon as they are picked and keeps their URLs in hidden
 * inputs named `name`, so the surrounding <form> submits plain URLs.
 */
export function ImageUpload({
  name,
  label,
  scope,
  max = 1,
  defaultValue = [],
  error,
  hint,
  required,
  onBusyChange,
  aspect = "aspect-[16/10]",
}: {
  name: string;
  label: string;
  scope: UploadScope;
  max?: number;
  defaultValue?: string[];
  error?: string;
  hint?: string;
  required?: boolean;
  onBusyChange?: (busy: boolean) => void;
  aspect?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>(() =>
    defaultValue.filter(Boolean).map((url, i) => ({ key: `init-${i}`, url, preview: url, status: "done" })),
  );
  const [message, setMessage] = useState<string | null>(null);
  const remaining = max - items.length;

  const update = (key: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setMessage(null);
    const picked = Array.from(files).slice(0, Math.max(remaining, 0));
    if (files.length > picked.length) setMessage(`You can add up to ${max} image${max === 1 ? "" : "s"}.`);

    const queued: { item: Item; file: File }[] = [];
    for (const file of picked) {
      const invalid = validateImageFile(file);
      if (invalid) {
        setMessage(invalid);
        continue;
      }
      queued.push({ item: { key: crypto.randomUUID(), preview: URL.createObjectURL(file), status: "uploading" }, file });
    }
    if (!queued.length) return;
    setItems((prev) => (max === 1 ? queued.slice(0, 1).map((q) => q.item) : [...prev, ...queued.map((q) => q.item)]));
    onBusyChange?.(true);
    await Promise.all(
      queued.map(async ({ item, file }) => {
        try {
          const url = await uploadImage(file, scope);
          update(item.key, { url, status: "done" });
        } catch (err) {
          update(item.key, { status: "error", error: err instanceof Error ? err.message : "Upload failed." });
        }
      }),
    );
    onBusyChange?.(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const remove = (key: string) => setItems((prev) => prev.filter((it) => it.key !== key));
  const shownError = message ?? error;

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="text-sm font-medium text-ink">
        {label}
        {required ? <span className="ml-0.5 text-brand">*</span> : <span className="ml-1.5 text-xs font-normal text-muted">Optional</span>}
      </span>
      {items.filter((i) => i.url).map((i) => (
        <input key={i.key} type="hidden" name={name} value={i.url} />
      ))}
      <div className={cn("grid gap-3", max > 1 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1")}>
        {items.map((item) => (
          <div key={item.key} className={cn("group relative overflow-hidden rounded-2xl border border-line bg-mist", aspect)}>
            {item.preview && (
              // eslint-disable-next-line @next/next/no-img-element -- local object-URL previews can't go through the optimizer
              <img src={item.preview} alt="" className={cn("absolute inset-0 size-full object-cover", item.status === "uploading" && "opacity-50")} />
            )}
            {item.status === "uploading" && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-ink" aria-label="Uploading" />
              </span>
            )}
            {item.status === "error" && (
              <span className="absolute inset-x-2 bottom-2 rounded-lg bg-red-600/90 px-2 py-1 text-xs font-medium text-white">{item.error}</span>
            )}
            <button
              type="button"
              onClick={() => remove(item.key)}
              className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full bg-surface/90 text-ink shadow-soft hover:bg-surface"
              aria-label="Remove image"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-describedby={`${id}-hint`}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface px-4 text-center text-sm text-muted transition-colors hover:border-ink/30 hover:bg-mist",
              aspect,
              shownError && "border-red-300",
            )}
          >
            <ImagePlus aria-hidden className="size-6" />
            <span className="font-medium text-ink">{items.length ? "Add another" : "Choose image"}</span>
            <span className="text-xs">JPG, PNG, WebP or AVIF · max 4 MB</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple={max > 1}
        className="sr-only"
        tabIndex={-1}
        aria-labelledby={`${id}-label`}
        onChange={(e) => onFiles(e.target.files)}
      />
      {hint && !shownError && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {shownError && (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {shownError}
        </p>
      )}
    </div>
  );
}
