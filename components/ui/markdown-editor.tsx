"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Bold, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Quote, Table } from "lucide-react";
import { toast } from "sonner";
import { prepareImage } from "@/lib/image-compress";
import { uploadImage } from "@/lib/upload-client";
import { IMAGE_ACCEPT, validateImageFile, type UploadScope } from "@/lib/uploads";
import { cn } from "@/lib/utils";
import { RichText } from "./rich-text";
import { Textarea } from "./form";

const TABLE_TEMPLATE = "| Heading | Heading |\n| --- | --- |\n| Cell | Cell |\n| Cell | Cell |";

type Tool = "heading" | "bold" | "italic" | "link" | "bullets" | "numbers" | "quote" | "table";
const TOOLS: { tool: Tool; label: string; shortcut?: string; icon: ReactNode }[] = [
  { tool: "heading", label: "Heading", icon: <Heading2 /> },
  { tool: "bold", label: "Bold", shortcut: "Ctrl+B", icon: <Bold /> },
  { tool: "italic", label: "Italic", shortcut: "Ctrl+I", icon: <Italic /> },
  { tool: "link", label: "Link", shortcut: "Ctrl+K", icon: <Link2 /> },
  { tool: "bullets", label: "Bulleted list", icon: <List /> },
  { tool: "numbers", label: "Numbered list", icon: <ListOrdered /> },
  { tool: "quote", label: "Quote", icon: <Quote /> },
  { tool: "table", label: "Table", icon: <Table /> },
];
const SHORTCUTS: Record<string, Tool> = { b: "bold", i: "italic", k: "link" };

/**
 * Markdown text area with a formatting toolbar, image upload and a live preview.
 * Submits as a normal field (`name`), so forms read it like any textarea.
 */
export function MarkdownEditor({
  name,
  defaultValue = "",
  rows = 12,
  maxLength,
  error,
  hasHint,
  uploadScope = "admin",
  onBusyChange,
}: {
  name: string;
  defaultValue?: string;
  rows?: number;
  maxLength?: number;
  error?: string;
  hasHint?: boolean;
  uploadScope?: UploadScope;
  /** Called while an image uploads, so the form can wait before saving. */
  onBusyChange?: (busy: boolean) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const id = useId();

  type Make = (selected: string, before: string, after: string) => { text: string; select?: [number, number] };

  /**
   * Replaces the selection (or, for `afterBlock`, inserts after the current paragraph or
   * table) and then selects `select` inside the inserted text. Reads the live textarea
   * value, so text typed while an image was uploading is kept.
   */
  const replaceSelection = (make: Make, { afterBlock = false } = {}) => {
    const el = textRef.current;
    if (!el) return;
    const current = el.value;
    let start = el.selectionStart;
    let end = el.selectionEnd;
    if (afterBlock) {
      // The current block ends at the next blank line (or the end of the text).
      const blockEnd = current.slice(end).search(/\n\s*\n/);
      start = end = blockEnd === -1 ? current.length : end + blockEnd;
    }
    const { text, select } = make(current.slice(start, end), current.slice(0, start), current.slice(end));
    const next = current.slice(0, start) + text + current.slice(end);
    if (maxLength && next.length > maxLength) {
      toast.error(`This field is limited to ${maxLength.toLocaleString()} characters.`);
      return;
    }
    // Render the new text right away so the cursor can be placed before the next keystroke.
    flushSync(() => setValue(next));
    el.focus();
    const [a, b] = select ?? [text.length, text.length];
    el.setSelectionRange(start + a, start + b);
  };

  const wrap = (mark: string, placeholder: string) =>
    replaceSelection((sel) => {
      const inner = sel || placeholder;
      return { text: `${mark}${inner}${mark}`, select: [mark.length, mark.length + inner.length] };
    });

  /** Adds a prefix to every selected line ("## ", "- ", "1. ", "> "). */
  const prefixLines = (prefix: string | ((i: number) => string), placeholder: string) =>
    replaceSelection((sel, before) => {
      const atLineStart = before === "" || before.endsWith("\n");
      const lines = (sel || placeholder).split("\n");
      const p = (i: number) => (typeof prefix === "string" ? prefix : prefix(i));
      const text = (atLineStart ? "" : "\n") + lines.map((l, i) => p(i) + l).join("\n");
      return sel ? { text } : { text, select: [text.length - placeholder.length, text.length] };
    });

  /** Inserts a block (table, image) as its own paragraph after the current one, never inside it. */
  const insertBlock = (block: string, select?: [number, number]) =>
    replaceSelection(
      (_sel, before, after) => {
        const lead = before.trim() === "" ? "" : before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
        const trail = after === "" ? "\n" : after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
        return { text: `${lead}${block}${trail}`, select: select && [lead.length + select[0], lead.length + select[1]] };
      },
      { afterBlock: true },
    );

  const link = () =>
    replaceSelection((sel) => {
      const label = sel || "link text";
      const text = `[${label}](https://)`;
      // Select the URL part when there's text, otherwise the label.
      return { text, select: sel ? [label.length + 3, text.length - 1] : [1, 1 + label.length] };
    });

  async function onImage(file: File | undefined) {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    const prepared = await prepareImage(file);
    const invalid = validateImageFile(prepared);
    if (invalid) {
      toast.error(`${file.name}: ${invalid}`);
      return;
    }
    setUploading(true);
    onBusyChange?.(true);
    try {
      const url = await uploadImage(prepared, uploadScope);
      const alt = "Describe the image";
      // Select the alt text so it can be typed over straight away.
      insertBlock(`![${alt}](${url})`, [2, 2 + alt.length]);
    } catch (err) {
      toast.error(`${file.name}: ${err instanceof Error ? err.message : "Upload failed."}`);
    } finally {
      setUploading(false);
      onBusyChange?.(false);
    }
  }

  function runTool(tool: Tool) {
    if (tool === "heading") prefixLines("## ", "Heading");
    else if (tool === "bold") wrap("**", "bold text");
    else if (tool === "italic") wrap("*", "italic text");
    else if (tool === "link") link();
    else if (tool === "bullets") prefixLines("- ", "List item");
    else if (tool === "numbers") prefixLines((i) => `${i + 1}. `, "List item");
    else if (tool === "quote") prefixLines("> ", "Quote");
    else insertBlock(TABLE_TEMPLATE, [2, 9]);
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const tool = e.ctrlKey || e.metaKey ? SHORTCUTS[e.key.toLowerCase()] : undefined;
    if (!tool) return;
    e.preventDefault();
    runTool(tool);
  };
  const toolClass =
    "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink/70 hover:bg-mist hover:text-ink disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4";

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-surface", error ? "border-red-400" : "border-line")}>
      <div className="flex flex-wrap items-center gap-1 border-b border-line bg-mist/50 px-1.5 py-1">
        <div role="tablist" aria-label="Editor mode" className="mr-1 flex rounded-lg bg-surface p-0.5 shadow-[0_1px_0_rgb(0_0_0/0.04)]">
          {(["write", "preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              aria-controls={`${id}-${m}`}
              onClick={() => setMode(m)}
              className={cn("rounded-md px-2.5 py-1 text-xs font-medium capitalize", mode === m ? "bg-ink text-paper" : "text-ink/70 hover:text-ink")}
            >
              {m}
            </button>
          ))}
        </div>
        {mode === "write" && (
          <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5">
            {TOOLS.map((t) => (
              <button key={t.tool} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runTool(t.tool)} title={t.shortcut ? `${t.label} (${t.shortcut})` : t.label} aria-label={t.label} className={toolClass}>
                {t.icon}
              </button>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} title="Upload an image (max 4 MB)" aria-label="Upload image" className={toolClass}>
              {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            </button>
          </div>
        )}
        {maxLength && (
          <span className="ml-auto px-1.5 text-[11px] text-muted tabular-nums" aria-live="polite">
            {value.length.toLocaleString()}/{maxLength.toLocaleString()}
          </span>
        )}
      </div>

      {/* The textarea stays mounted (just hidden) in preview mode, so the form still submits it. */}
      <div id={`${id}-write`} role="tabpanel" hidden={mode !== "write"}>
        <Textarea
          ref={textRef}
          id={name}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={rows}
          maxLength={maxLength}
          error={error}
          hasHint={hasHint}
          spellCheck
          className="rounded-none border-0 font-mono text-[13.5px] shadow-none focus:ring-0 aria-[invalid=true]:focus:ring-0"
        />
      </div>
      <div id={`${id}-preview`} role="tabpanel" hidden={mode !== "preview"} className="max-h-[36rem] min-h-40 overflow-y-auto px-4 py-3">
        {value.trim() ? <RichText text={value} /> : <p className="text-sm text-muted">Nothing to preview yet.</p>}
      </div>
      <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => onImage(e.target.files?.[0])} />
    </div>
  );
}
