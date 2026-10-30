import type { MetadataRoute } from "next";
import { getPastTerms, getPublishedEventSlugs, getPublishedProjectSlugs } from "@/lib/data/public";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, projects, terms] = await Promise.all([
    getPublishedEventSlugs(),
    getPublishedProjectSlugs(),
    getPastTerms(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/events"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/projects"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/team"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl("/join"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/projects/submit"), changeFrequency: "yearly", priority: 0.5 },
  ];

  return [
    ...staticPages,
    ...events.map((e) => ({ url: absoluteUrl(`/events/${e.slug}`), lastModified: e.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...projects.map((p) => ({ url: absoluteUrl(`/projects/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...terms.map((t) => ({ url: absoluteUrl(`/team/${t.year}`), lastModified: t.updatedAt, changeFrequency: "yearly" as const, priority: 0.4 })),
  ];
}
