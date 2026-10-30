import Image from "next/image";
import type { ReactNode } from "react";
import { cn, initials } from "@/lib/utils";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h2",
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <Tag
          className={cn(
            "font-semibold tracking-[-0.025em] text-balance text-ink",
            Tag === "h1" ? "text-4xl leading-[1.05] sm:text-5xl lg:text-6xl" : "text-3xl leading-[1.1] sm:text-4xl lg:text-[2.75rem]",
          )}
        >
          {title}
        </Tag>
        {description && <p className="mt-4 text-base leading-relaxed text-pretty text-muted sm:text-lg">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Pill({ children, className, tone = "neutral" }: { children: ReactNode; className?: string; tone?: "neutral" | "brand" | "dark" | "success" | "warning" }) {
  const tones = {
    neutral: "bg-mist text-ink/80 border-line",
    brand: "bg-brand-soft text-brand border-brand/15",
    dark: "bg-ink text-paper border-ink",
    success: "bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 border-emerald-200",
    warning: "bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25 text-amber-800 border-amber-200",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Avatar({ name, src, size = 96, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`Portrait of ${name}`}
        width={size}
        height={size}
        sizes={`${size}px`}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-mist to-line font-semibold tracking-tight text-ink/70",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {initials(name)}
    </span>
  );
}

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-mist/60 px-6 py-14 text-center">
      {icon && <div className="mb-4 text-muted">{icon}</div>}
      <p className="text-lg font-semibold text-ink">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-mist", className)} />;
}

/** Page intro used at the top of inner pages; holds the single H1. */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  crumbs?: { name: string; path: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-mist to-paper pt-36 pb-14 sm:pt-40 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgb(0_0_0/0.12)_1px,transparent_0)] dark:[background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.07)_1px,transparent_0)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div className="container-page relative">
        {crumbs && (
          <div className="mb-8">
            <Breadcrumbs items={crumbs} />
          </div>
        )}
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} description={description} />
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
