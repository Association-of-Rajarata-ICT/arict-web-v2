import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "./json-ld";

/** Visible breadcrumb trail plus matching BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1">
                {last ? (
                  <span aria-current="page" className="line-clamp-1 text-ink/80">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="hover:text-ink">
                      {item.name}
                    </Link>
                    <ChevronRight aria-hidden className="size-3.5 text-muted/60" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
