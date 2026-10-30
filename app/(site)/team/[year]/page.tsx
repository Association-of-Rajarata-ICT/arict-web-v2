import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PastCommittees } from "@/components/team/past-committees";
import { TermRoster } from "@/components/team/term-roster";
import { LinkButton } from "@/components/ui/button";
import { PageHero, Skeleton } from "@/components/ui/misc";
import { getPastTerms, getTermWithMembers } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const terms = await getPastTerms();
  return terms.length ? terms.map((t) => ({ year: String(t.year) })) : [{ year: "0" }];
}

function parseYear(value: string) {
  return /^\d{4}$/.test(value) ? Number(value) : null;
}

export async function generateMetadata({ params }: PageProps<"/team/[year]">): Promise<Metadata> {
  const year = parseYear((await params).year);
  const term = year ? await getTermWithMembers(year) : null;
  if (!term) return { title: "Committee not found", robots: { index: false } };
  return pageMetadata({
    title: `${term.title}`,
    description: `Meet the ARICT ${term.title} at Rajarata University of Sri Lanka: executive committee members and year representatives who served in ${term.year}.`,
    // The current term lives at /team; avoid duplicate URLs.
    path: term.isCurrent ? "/team" : `/team/${term.year}`,
  });
}

export default function TermPage({ params }: PageProps<"/team/[year]">) {
  return (
    <Suspense
      fallback={
        <div aria-busy="true" className="container-page pt-40 pb-24">
          <Skeleton className="h-12 w-80" />
          <Skeleton className="mt-6 h-5 w-full max-w-lg" />
        </div>
      }
    >
      <TermDetail params={params} />
    </Suspense>
  );
}

async function TermDetail({ params }: Pick<PageProps<"/team/[year]">, "params">) {
  const year = parseYear((await params).year);
  if (!year) notFound();
  const [term, pastTerms] = await Promise.all([getTermWithMembers(year), getPastTerms()]);
  if (!term) notFound();

  const period =
    term.startDate && term.endDate
      ? `${formatDate(term.startDate, { month: "long", year: "numeric" })} – ${formatDate(term.endDate, { month: "long", year: "numeric" })}`
      : String(term.year);

  return (
    <>
      <PageHero
        eyebrow={term.isCurrent ? "Current Committee" : "Past Committee"}
        title={term.title}
        description={term.description ? `${period}. ${term.description}` : period}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Team", path: "/team" },
          { name: term.title, path: `/team/${term.year}` },
        ]}
      >
        <LinkButton href="/team" variant="outline" arrow>
          Meet the current ARICT team
        </LinkButton>
      </PageHero>
      <div className="container-page py-16 sm:py-24">
        {term.members.length > 0 ? (
          <TermRoster members={term.members} current={term.isCurrent} />
        ) : (
          <p className="text-muted">No members have been recorded for this committee yet.</p>
        )}
      </div>
      <PastCommittees terms={pastTerms} activeYear={term.year} />
    </>
  );
}
