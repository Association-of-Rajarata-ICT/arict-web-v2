import { Building2, Compass, Eye, Target } from "lucide-react";
import { AnimatedCounter } from "@/components/motion/effects";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";
import { PageHero } from "@/components/ui/misc";
import { RichText } from "@/components/ui/rich-text";
import { getSiteSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "Learn about ARICT, the student-led technology association of Rajarata University of Sri Lanka: our story, mission, vision, values and achievements.",
  path: "/about",
});

export default async function AboutPage() {
  const { about, stats, aboutPreview } = await getSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="About ARICT"
        title={aboutPreview.heading}
        description={about.intro}
        crumbs={[{ name: "Home", path: "/" }, { name: "About Us", path: "/about" }]}
      />

      {stats.items.length > 0 && (
        <section aria-label="ARICT in numbers" className="border-b border-line">
          <StaggerContainer className="container-page grid grid-cols-2 divide-line sm:grid-cols-3 sm:divide-x">
            {stats.items.map((s) => (
              <StaggerItem key={s.label} className="py-10 sm:px-8 sm:first:pl-0">
                <p className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm text-muted">{s.label}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      <div className="container-page grid gap-16 py-20 sm:py-28 lg:grid-cols-12">
        {about.story && (
          <FadeUp as="section" className="lg:col-span-7">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Our story</h2>
            <RichText text={about.story} className="mt-6" />
          </FadeUp>
        )}
        {about.history && (
          <FadeUp as="section" className="lg:col-span-5" delay={0.1}>
            <div className="rounded-3xl bg-mist p-7 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight">Our history</h2>
              <RichText text={about.history} className="mt-4 text-[15px]" />
            </div>
          </FadeUp>
        )}
      </div>

      {(about.mission || about.vision) && (
        <section aria-label="Mission and vision" className="bg-night py-20 text-white dark:border-y dark:border-white/10 sm:py-28">
          <StaggerContainer className="container-page grid gap-10 md:grid-cols-2 md:gap-16">
            {about.mission && (
              <StaggerItem>
                <Target aria-hidden className="size-6 text-brand" strokeWidth={1.75} />
                <h2 className="mt-5 text-sm font-semibold tracking-[0.16em] text-white/55 uppercase">Our mission</h2>
                <p className="mt-4 text-2xl leading-snug font-medium tracking-tight text-balance sm:text-3xl">{about.mission}</p>
              </StaggerItem>
            )}
            {about.vision && (
              <StaggerItem>
                <Eye aria-hidden className="size-6 text-brand" strokeWidth={1.75} />
                <h2 className="mt-5 text-sm font-semibold tracking-[0.16em] text-white/55 uppercase">Our vision</h2>
                <p className="mt-4 text-2xl leading-snug font-medium tracking-tight text-balance sm:text-3xl">{about.vision}</p>
              </StaggerItem>
            )}
          </StaggerContainer>
        </section>
      )}

      <div className="container-page grid gap-16 py-20 sm:py-28 lg:grid-cols-2">
        {about.objectives.length > 0 && (
          <FadeUp as="section">
            <h2 className="text-3xl font-semibold tracking-tight">Objectives</h2>
            <ol className="mt-8 space-y-5">
              {about.objectives.map((o, i) => (
                <li key={o} className="flex gap-4">
                  <span className="font-mono text-sm text-brand">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-ink/85">{o}</span>
                </li>
              ))}
            </ol>
          </FadeUp>
        )}
        {about.achievements.length > 0 && (
          <FadeUp as="section" delay={0.1}>
            <h2 className="text-3xl font-semibold tracking-tight">Achievements</h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {about.achievements.map((a) => (
                <li key={a} className="py-4 text-ink/85">
                  {a}
                </li>
              ))}
            </ul>
          </FadeUp>
        )}
      </div>

      {about.values.length > 0 && (
        <section aria-labelledby="values-heading" className="bg-mist py-20 sm:py-28">
          <div className="container-page">
            <FadeUp>
              <p className="eyebrow">Values</p>
              <h2 id="values-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                What we stand for
              </h2>
            </FadeUp>
            <StaggerContainer as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {about.values.map((v) => (
                <StaggerItem as="li" key={v.title} className="rounded-3xl border border-line bg-surface p-7">
                  <h3 className="text-lg font-semibold">{v.title}</h3>
                  {v.description && <p className="mt-2 text-sm leading-relaxed text-muted">{v.description}</p>}
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      <div className="container-page grid gap-12 py-20 sm:py-28 md:grid-cols-2">
        {about.universityRelationship && (
          <FadeUp as="section">
            <Building2 aria-hidden className="size-6 text-ink/70" strokeWidth={1.75} />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Rajarata University of Sri Lanka</h2>
            <RichText text={about.universityRelationship} className="mt-4" />
          </FadeUp>
        )}
        {about.futureDirection && (
          <FadeUp as="section" delay={0.1}>
            <Compass aria-hidden className="size-6 text-ink/70" strokeWidth={1.75} />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Looking ahead</h2>
            <RichText text={about.futureDirection} className="mt-4" />
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/contact" variant="outline" arrow>
                Contact the ARICT team
              </LinkButton>
            </div>
          </FadeUp>
        )}
      </div>

    </>
  );
}
