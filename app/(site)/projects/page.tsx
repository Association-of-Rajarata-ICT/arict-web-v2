import { ProjectsExplorer } from "@/components/projects/projects-explorer";
import { ShareProjectCta } from "@/components/projects/share-project-cta";
import { LinkButton } from "@/components/ui/button";
import { PageHero } from "@/components/ui/misc";
import { getPublicProjects } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Explore apps, systems and research built by ARICT members at Rajarata University of Sri Lanka, or submit your own student project.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getPublicProjects();
  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Student ideas, built into real technology."
        description="Apps, systems, hardware and research created by ARICT members — from hackathon prototypes to tools used across campus."
        crumbs={[{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }]}
      >
        <LinkButton href="/projects/submit" variant="dark" size="lg" arrow>
          Share your Project
        </LinkButton>
      </PageHero>
      <ProjectsExplorer projects={projects} />
      <div className="container-page pb-24">
        <ShareProjectCta />
      </div>
    </>
  );
}
