import { Upload } from "lucide-react";
import { FadeUp } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";

export function ShareProjectCta() {
  return (
    <FadeUp>
      <div className="relative isolate flex flex-col items-start gap-6 overflow-hidden rounded-[2rem] border border-line bg-white p-8 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div aria-hidden className="absolute -top-24 -left-24 -z-10 size-72 rounded-full bg-brand/[0.07] blur-3xl" />
        <div className="flex items-start gap-5">
          <span aria-hidden className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-white sm:inline-flex">
            <Upload className="size-5" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Share your Project</h2>
            <p className="mt-2 max-w-xl text-muted">Built something worth sharing? Submit your project to be featured by ARICT.</p>
          </div>
        </div>
        <LinkButton href="/projects/submit" variant="dark" size="lg" arrow className="shrink-0">
          Share your Project
        </LinkButton>
      </div>
    </FadeUp>
  );
}
