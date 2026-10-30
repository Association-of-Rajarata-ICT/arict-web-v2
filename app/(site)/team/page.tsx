import { Users } from "lucide-react";
import { PastCommittees } from "@/components/team/past-committees";
import { TermRoster } from "@/components/team/term-roster";
import { EmptyState, PageHero } from "@/components/ui/misc";
import { getCurrentTerm, getPastTerms } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Team",
  description:
    "Meet the ARICT committee at Rajarata University of Sri Lanka — the executive committee, year representatives and past committees that built ARICT.",
  path: "/team",
});

export default async function TeamPage() {
  const [term, pastTerms] = await Promise.all([getCurrentTerm(), getPastTerms()]);

  return (
    <>
      <PageHero
        eyebrow="Our Team"
        title="The people behind ARICT."
        description={
          term
            ? `${term.title}${term.description ? ` — ${term.description}` : ""}`
            : "Our committee is elected by members each academic year to plan events, support projects and represent students."
        }
        crumbs={[{ name: "Home", path: "/" }, { name: "Team", path: "/team" }]}
      />
      <div className="container-page py-16 sm:py-24">
        {term && term.members.length > 0 ? (
          <TermRoster members={term.members} current />
        ) : (
          <EmptyState icon={<Users className="size-8" />} title="Our new committee will be announced soon" description="In the meantime, browse the committees that came before." />
        )}
      </div>
      <PastCommittees terms={pastTerms} />
    </>
  );
}
