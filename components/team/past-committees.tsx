import Link from "next/link";
import { ArrowUpRight, History } from "lucide-react";
import type { getPastTerms } from "@/lib/data/public";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/motion/reveal";
import { EmptyState } from "@/components/ui/misc";
import { formatDate } from "@/lib/utils";

type Term = Awaited<ReturnType<typeof getPastTerms>>[number];

export function PastCommittees({ terms, activeYear }: { terms: Term[]; activeYear?: number }) {
  return (
    <section aria-labelledby="past-committees-heading" className="border-t border-line bg-mist py-24">
      <div className="container-page">
        <FadeUp>
          <p className="eyebrow">Team History</p>
          <h2 id="past-committees-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Past Committees
          </h2>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Celebrating the members who helped shape and grow ARICT through the years.
          </p>
        </FadeUp>
        {terms.length > 0 ? (
          <StaggerContainer as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {terms.map((t) => {
              const active = t.year === activeYear;
              return (
                <StaggerItem as="li" key={t.id}>
                  <Link
                    href={`/team/${t.year}`}
                    aria-current={active ? "page" : undefined}
                    className={`group flex h-full flex-col rounded-3xl border bg-white p-6 transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgb(0_0_0/0.35)] ${active ? "border-ink" : "border-line"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-display text-4xl font-semibold tracking-[-0.04em] text-ink/90">{t.year}</span>
                      <ArrowUpRight aria-hidden className="size-5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
                    </div>
                    <p className="mt-4 font-semibold text-ink">View the {t.title}</p>
                    {t.startDate && t.endDate && (
                      <p className="mt-1 text-sm text-muted">
                        {formatDate(t.startDate, { month: "short", year: "numeric" })} – {formatDate(t.endDate, { month: "short", year: "numeric" })}
                      </p>
                    )}
                    <p className="mt-auto pt-5 text-xs text-muted">{t.memberCount} members</p>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        ) : (
          <div className="mt-12">
            <EmptyState icon={<History className="size-7" />} title="Past committees will appear here" description="When a new committee takes office, the previous one is preserved in ARICT's team history." />
          </div>
        )}
      </div>
    </section>
  );
}
