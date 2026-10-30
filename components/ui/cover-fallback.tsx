import { cn } from "@/lib/utils";

/** Branded placeholder for items without a cover image. Decorative. */
export function CoverFallback({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 flex items-end bg-[radial-gradient(circle_at_80%_10%,rgb(160_0_0/0.10),transparent_45%),linear-gradient(135deg,#f7f7f7,#ececec)] p-5 dark:bg-[radial-gradient(circle_at_80%_10%,rgb(229_72_77/0.12),transparent_45%),linear-gradient(135deg,#18181b,#111113)]",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgb(0_0_0/0.14)_1px,transparent_0)] dark:[background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.07)_1px,transparent_0)] [background-size:18px_18px]" />
      {label && <span className="relative text-xs font-semibold tracking-[0.16em] text-ink/40 uppercase">{label}</span>}
    </div>
  );
}
