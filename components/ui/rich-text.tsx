import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders admin/user-authored plain text safely (no HTML is ever injected).
 * Supports a small Markdown-like subset: blank-line paragraphs, "## " / "### "
 * headings, "- " bullet lists and **bold**.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return (
    <div className={cn("prose-arict", className)}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (lines[0]!.startsWith("### ")) return <Heading key={i} level={3} lines={lines} />;
        if (lines[0]!.startsWith("## ")) return <Heading key={i} level={2} lines={lines} />;
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function Heading({ level, lines }: { level: 2 | 3; lines: string[] }) {
  const [first, ...rest] = lines;
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <>
      <Tag>{first!.replace(/^#{2,3}\s+/, "")}</Tag>
      {rest.length > 0 && <RichText text={rest.join("\n")} className="contents" />}
    </>
  );
}

function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}
