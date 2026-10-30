import { cacheLife } from "next/cache";
import { CheckCircle2 } from "lucide-react";
import { SubmissionForm } from "@/components/projects/submission-form";
import { PageHero } from "@/components/ui/misc";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Share Your Project",
  description:
    "Built something worth sharing? Submit your student project to ARICT for review and a chance to be featured on the ARICT website.",
  path: "/projects/submit",
});

async function SubmitFormSection() {
  "use cache";
  cacheLife("days");
  return <SubmissionForm currentYear={new Date().getFullYear()} />;
}

const STEPS = [
  "Fill in the form with your project details and images.",
  "The ARICT team reviews your submission.",
  "We may contact you for changes or more information.",
  "Accepted projects are published on the Projects page.",
];

export default function SubmitProjectPage() {
  return (
    <>
      <PageHero
        eyebrow="Share your Project"
        title="Share your project with ARICT."
        description="Built something worth sharing? Submit your project to be featured by ARICT."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
          { name: "Share Your Project", path: "/projects/submit" },
        ]}
      />
      <div className="container-page grid gap-12 py-14 sm:py-20 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
            <ol className="mt-5 space-y-4">
              {STEPS.map((s, i) => (
                <li key={s} className="flex gap-3 text-sm text-ink/80">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-8 rounded-2xl bg-mist p-5 text-sm text-ink/75">
              <p className="flex items-center gap-2 font-medium text-ink">
                <CheckCircle2 aria-hidden className="size-4 text-emerald-600" /> Good submissions include
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>A clear cover image</li>
                <li>What problem the project solves</li>
                <li>Working GitHub or demo links</li>
              </ul>
            </div>
          </div>
        </aside>
        <div className="lg:col-span-8">
          <SubmitFormSection />
        </div>
      </div>
    </>
  );
}
