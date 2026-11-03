import Markdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Images in Markdown must be https (or a path on this site); anything else is dropped. */
const safeImageSrc = (src: unknown) =>
  typeof src === "string" && (/^https:\/\//i.test(src) || (src.startsWith("/") && !src.startsWith("//"))) ? src : null;

const components: Components = {
  // The page already has its own h1; a "# Heading" in the content becomes a section heading.
  h1: "h2",
  h5: "h4",
  h6: "h4",
  // `node` (react-markdown's syntax tree) must not be passed on to the DOM element.
  a: ({ node, href, ...props }) => {
    void node;
    const external = typeof href === "string" && /^https?:\/\//i.test(href);
    return <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props} />;
  },
  img: ({ src, alt }) => {
    const safe = safeImageSrc(src);
    if (!safe) return null;
    // Plain <img>: Markdown images have no known size and may come from any https host.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={safe} alt={alt ?? ""} loading="lazy" decoding="async" />;
  },
  // Wide tables scroll inside their own box on phones instead of widening the page.
  table: ({ node, ...props }) => {
    void node;
    return (
      <div className="prose-table">
        <table {...props} />
      </div>
    );
  },
};

/**
 * Renders admin/user-written Markdown safely: raw HTML is never rendered and unsafe
 * links are removed. Supports headings, bold/italic, lists, links, images, tables
 * (GitHub style), quotes and code. A single line break starts a new line.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("prose-arict", className)}>
      <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {text}
      </Markdown>
    </div>
  );
}
