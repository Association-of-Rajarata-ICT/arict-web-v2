import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-ink placeholder:text-muted/70 shadow-[0_1px_0_rgb(0_0_0/0.02)] transition-[border-color,box-shadow] duration-150 outline-none focus:border-ink/40 focus:ring-4 focus:ring-ink/5 disabled:cursor-not-allowed disabled:bg-mist aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-100";

export function Field({
  label,
  name,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="ml-0.5 text-brand" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-muted">Optional</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${name}-hint`} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(name: string, error?: string, hint?: boolean) {
  return error ? `${name}-error` : hint ? `${name}-hint` : undefined;
}

type ControlExtra = { error?: string; hasHint?: boolean };

export function Input({ className, error, hasHint, ...props }: ComponentProps<"input"> & ControlExtra) {
  return (
    <input
      id={props.id ?? props.name}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(props.name ?? "", error, hasHint)}
      className={cn(control, "h-11", className)}
      {...props}
    />
  );
}

export function Textarea({ className, error, hasHint, ...props }: ComponentProps<"textarea"> & ControlExtra) {
  return (
    <textarea
      id={props.id ?? props.name}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(props.name ?? "", error, hasHint)}
      className={cn(control, "min-h-28 resize-y leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({ className, error, hasHint, children, ...props }: ComponentProps<"select"> & ControlExtra) {
  return (
    <div className="relative">
      <select
        id={props.id ?? props.name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(props.name ?? "", error, hasHint)}
        className={cn(control, "h-11 appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
    </div>
  );
}

export function Checkbox({ label, className, ...props }: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink select-none", className)}>
      <input type="checkbox" className="size-4 rounded border-line accent-brand" {...props} />
      {label}
    </label>
  );
}

/** Hidden anti-spam field. Real users never see it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="company_website">Company website</label>
      <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: "success" | "error" | "info"; children: ReactNode }) {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-line bg-mist text-ink/80",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-2xl border px-4 py-3 text-sm leading-relaxed", tones[tone])}>
      {children}
    </div>
  );
}
