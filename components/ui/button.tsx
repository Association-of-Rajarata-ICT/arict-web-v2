import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "dark" | "outline" | "ghost" | "light" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,color,box-shadow,transform,border-color] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark shadow-soft",
  dark: "bg-ink text-paper hover:bg-ink-soft shadow-soft",
  outline: "border border-line bg-surface text-ink hover:border-ink/30 hover:bg-mist",
  ghost: "text-ink hover:bg-black/5 dark:hover:bg-white/10",
  light: "bg-surface text-ink shadow-float hover:shadow-[0_16px_40px_-14px_rgb(0_0_0/0.35)]",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export function buttonClasses({
  variant = "dark",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

function Arrow() {
  return (
    <ArrowRight
      aria-hidden
      className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5"
    />
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size; arrow?: boolean };

export function Button({ variant, size, arrow, className, children, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses({ variant, size, className })} {...props}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

export function LinkButton({ variant, size, arrow, className, children, ...props }: LinkButtonProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

/** Inline text link with an animated arrow, for "View all" style CTAs. */
export function ArrowLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "group/btn inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-offset-4 hover:underline",
        className,
      )}
      {...props}
    >
      {children}
      <Arrow />
    </Link>
  );
}
