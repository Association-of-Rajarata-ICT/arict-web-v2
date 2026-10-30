import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import {
  AboutPreview,
  FeaturedProjects,
  TeamPreview,
  UpcomingEvents,
  WhatWeDo,
} from "@/components/home/sections";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getFeaturedProjects,
  getHomeTeam,
  getSiteSettings,
  getUpcomingEvents,
} from "@/lib/data/public";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  "use cache";
  const { general } = await getSiteSettings();
  return pageMetadata({
    title: `${SITE.name} — ${general.fullName}`,
    absoluteTitle: true,
    description: general.seoDescription,
    path: "/",
    image: general.defaultOgImage || null,
  });
}

export default async function HomePage() {
  const settings = await getSiteSettings();
  const { homeSections } = settings;
  const [events, projects, team] = await Promise.all([
    getUpcomingEvents(homeSections.eventsCount),
    getFeaturedProjects(homeSections.projectsCount),
    getHomeTeam(homeSections.teamMode),
  ]);

  return (
    <>
      <JsonLd data={[websiteJsonLd(), organizationJsonLd(settings)]} />
      <Hero hero={settings.hero} />
      <AboutPreview about={settings.aboutPreview} stats={settings.stats} />
      <WhatWeDo data={settings.whatWeDo} />
      <UpcomingEvents eyebrow={homeSections.eventsEyebrow} heading={homeSections.eventsHeading} events={events} />
      <FeaturedProjects eyebrow={homeSections.projectsEyebrow} heading={homeSections.projectsHeading} projects={projects} />
      <TeamPreview eyebrow={homeSections.teamEyebrow} heading={homeSections.teamHeading} members={team} />
    </>
  );
}
