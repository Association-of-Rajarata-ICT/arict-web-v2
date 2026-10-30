"use client";

import { useState, type ReactNode } from "react";
import { saveSettings } from "@/actions/admin/settings";
import { WHAT_WE_DO_ICONS, type SettingsKey, type SiteSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { useFormAction } from "@/components/ui/use-form-action";
import { Card } from "./ui";

function SectionForm({ section, children, busy }: { section: SettingsKey; children: (errors: Record<string, string>) => ReactNode; busy?: boolean }) {
  const { state, onSubmit, pending } = useFormAction(saveSettings);
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <input type="hidden" name="section" value={section} />
      {state.message && <FormMessage tone={state.ok ? "success" : "error"}>{state.message}</FormMessage>}
      {children(state.fieldErrors ?? {})}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="submit" variant="dark" size="lg" disabled={pending || busy} className="shadow-float">
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

const T = (props: { name: string; label: string; value: string; error?: string; hint?: string; rows?: number; required?: boolean; max?: number }) =>
  props.rows ? (
    <Field label={props.label} name={props.name} error={props.error} hint={props.hint} required={props.required}>
      <Textarea name={props.name} defaultValue={props.value} rows={props.rows} maxLength={props.max} error={props.error} hasHint={!!props.hint} />
    </Field>
  ) : (
    <Field label={props.label} name={props.name} error={props.error} hint={props.hint} required={props.required}>
      <Input name={props.name} defaultValue={props.value} maxLength={props.max} error={props.error} hasHint={!!props.hint} />
    </Field>
  );

export function SettingsForms({ tab, settings }: { tab: SettingsKey | "homepage" | "contactSocial"; settings: SiteSettings }) {
  const [busy, setBusy] = useState(false);
  const s = settings;

  if (tab === "general")
    return (
      <SectionForm section="general" busy={busy}>
        {(e) => (
          <Card title="Site identity & SEO">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <T name="siteName" label="Site name" value={s.general.siteName} error={e.siteName} required max={40} />
                <T name="fullName" label="Full organization name" value={s.general.fullName} error={e.fullName} required max={160} />
              </div>
              <T name="description" label="Organization description" value={s.general.description} error={e.description} rows={3} required max={400} />
              <T name="seoDescription" label="Default SEO description" value={s.general.seoDescription} error={e.seoDescription} rows={2} required max={170} hint="Used for the homepage meta description (aim for 120–155 characters)." />
              <div className="grid gap-6 sm:grid-cols-2">
                <ImageUpload name="logo" label="Logo (used in structured data)" scope="admin" defaultValue={s.general.logo ? [s.general.logo] : []} aspect="aspect-[4/1]" onBusyChange={setBusy} />
                <ImageUpload name="defaultOgImage" label="Default social share image (1200×630)" scope="admin" defaultValue={s.general.defaultOgImage ? [s.general.defaultOgImage] : []} aspect="aspect-[1200/630]" onBusyChange={setBusy} />
              </div>
            </div>
          </Card>
        )}
      </SectionForm>
    );

  if (tab === "contactSocial")
    return (
      <div className="space-y-10">
        <SectionForm section="contact">
          {(e) => (
            <Card title="Contact information" description="Shown on the Contact page and in the footer. The Contact Us form itself is delivered by EmailJS (configured with environment variables).">
              <div className="grid gap-5 sm:grid-cols-2">
                <T name="email" label="Official email" value={s.contact.email} error={e.email} />
                <T name="phone" label="Phone" value={s.contact.phone} error={e.phone} />
                <div className="sm:col-span-2">
                  <T name="address" label="Address" value={s.contact.address} error={e.address} rows={2} />
                </div>
                <T name="officeHours" label="Office hours" value={s.contact.officeHours} error={e.officeHours} />
                <T name="mapLink" label="Map link" value={s.contact.mapLink} error={e.mapLink} hint="A Google Maps share link." />
                <div className="sm:col-span-2">
                  <T name="mapEmbedUrl" label="Map embed URL" value={s.contact.mapEmbedUrl} error={e.mapEmbedUrl} hint="The src URL of a Google Maps embed (…/maps?q=…&output=embed). Leave empty to hide the map." />
                </div>
              </div>
            </Card>
          )}
        </SectionForm>
        <SectionForm section="social">
          {(e) => (
            <Card title="Social links" description="Only filled links are shown. They are also used as sameAs in Organization structured data.">
              <div className="grid gap-5 sm:grid-cols-2">
                {(["facebook", "linkedin", "instagram", "youtube", "github"] as const).map((k) => (
                  <T key={k} name={k} label={k[0]!.toUpperCase() + k.slice(1)} value={s.social[k]} error={e[k]} />
                ))}
              </div>
            </Card>
          )}
        </SectionForm>
      </div>
    );

  if (tab === "homepage")
    return (
      <div className="space-y-10">
        <SectionForm section="hero" busy={busy}>
          {(e) => (
            <Card title="Hero">
              <div className="space-y-5">
                <T name="badge" label="Badge text" value={s.hero.badge} error={e.badge} hint="Small pill shown above the heading. Leave empty to hide it." />
                <div className="grid gap-5 sm:grid-cols-3">
                  <T name="headingLine1" label="Heading line 1" value={s.hero.headingLine1} error={e.headingLine1} required />
                  <T name="headingLine2" label="Heading line 2" value={s.hero.headingLine2} error={e.headingLine2} />
                  <T name="highlight" label="Highlighted word (red)" value={s.hero.highlight} error={e.highlight} />
                </div>
                <T name="text" label="Supporting text" value={s.hero.text} error={e.text} rows={2} required />
                <div className="grid gap-5 sm:grid-cols-3">
                  <T name="primaryCtaLabel" label="Primary button label" value={s.hero.primaryCtaLabel} error={e.primaryCtaLabel} required />
                  <T name="primaryCtaHref" label="Primary button link" value={s.hero.primaryCtaHref} error={e.primaryCtaHref} />
                  <T name="secondaryCtaLabel" label="Video button label" value={s.hero.secondaryCtaLabel} error={e.secondaryCtaLabel} />
                </div>
                <T name="videoUrl" label="Hero video URL" value={s.hero.videoUrl} error={e.videoUrl} hint="YouTube, Vimeo or .mp4 link. The “Watch Video” button only shows when this is set." />
                <ImageUpload name="backgroundImage" label="Background image" scope="admin" defaultValue={s.hero.backgroundImage ? [s.hero.backgroundImage] : []} aspect="aspect-[16/9]" hint="A wide, bright photo. Max 4 MB. Leave empty to use the default campus image." onBusyChange={setBusy} />
                <T name="backgroundAlt" label="Background image description (alt text)" value={s.hero.backgroundAlt} error={e.backgroundAlt} />
              </div>
            </Card>
          )}
        </SectionForm>

        <SectionForm section="aboutPreview">
          {(e) => (
            <Card title="About preview">
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <T name="eyebrow" label="Eyebrow" value={s.aboutPreview.eyebrow} error={e.eyebrow} />
                  <T name="heading" label="Heading" value={s.aboutPreview.heading} error={e.heading} required />
                </div>
                <T name="description" label="Description" value={s.aboutPreview.description} error={e.description} rows={4} required />
                <div className="grid gap-5 sm:grid-cols-2">
                  <T name="ctaLabel" label="Button label" value={s.aboutPreview.ctaLabel} error={e.ctaLabel} />
                  <T name="ctaHref" label="Button link" value={s.aboutPreview.ctaHref} error={e.ctaHref} />
                </div>
                <input type="hidden" name="image" value={s.aboutPreview.image} />
              </div>
            </Card>
          )}
        </SectionForm>

        <SectionForm section="stats">
          {() => (
            <Card title="Statistics" description="Animated counters on the homepage and About page. Leave a label empty to remove a row.">
              <div className="space-y-3">
                {Array.from({ length: 6 }, (_, i) => {
                  const st = s.stats.items[i];
                  return (
                    <div key={i} className="grid grid-cols-[1fr_110px_80px] gap-3">
                      <Input name={`stat_label_${i}`} defaultValue={st?.label ?? ""} placeholder="Label, e.g. Events" aria-label={`Statistic ${i + 1} label`} />
                      <Input name={`stat_value_${i}`} type="number" min={0} defaultValue={st?.value ?? ""} placeholder="20" aria-label={`Statistic ${i + 1} value`} />
                      <Input name={`stat_suffix_${i}`} defaultValue={st?.suffix ?? ""} placeholder="+" maxLength={4} aria-label={`Statistic ${i + 1} suffix`} />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </SectionForm>

        <SectionForm section="whatWeDo">
          {(e) => (
            <Card title="What We Do">
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <T name="eyebrow" label="Eyebrow" value={s.whatWeDo.eyebrow} error={e.eyebrow} />
                  <T name="heading" label="Heading" value={s.whatWeDo.heading} error={e.heading} required />
                </div>
                <T name="description" label="Intro text" value={s.whatWeDo.description} error={e.description} />
                <p className="text-sm font-medium">Cards (in display order — leave a title empty to remove a card)</p>
                {Array.from({ length: 8 }, (_, i) => {
                  const it = s.whatWeDo.items[i];
                  return (
                    <div key={i} className="grid gap-3 rounded-xl bg-mist/60 p-3 sm:grid-cols-[1fr_2fr_140px]">
                      <Input name={`item_title_${i}`} defaultValue={it?.title ?? ""} placeholder="Title" aria-label={`Card ${i + 1} title`} />
                      <Input name={`item_desc_${i}`} defaultValue={it?.description ?? ""} placeholder="Description" aria-label={`Card ${i + 1} description`} />
                      <Select name={`item_icon_${i}`} defaultValue={it?.icon ?? "lightbulb"} aria-label={`Card ${i + 1} icon`}>
                        {WHAT_WE_DO_ICONS.map((ic) => (
                          <option key={ic} value={ic}>
                            {ic}
                          </option>
                        ))}
                      </Select>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </SectionForm>

        <SectionForm section="homeSections">
          {(e) => (
            <Card title="Events, Projects & Team sections" description="Upcoming events are chosen automatically (next published events by date). Featured projects are published projects marked “Featured”.">
              <div className="grid gap-5 sm:grid-cols-3">
                <T name="eventsEyebrow" label="Events eyebrow" value={s.homeSections.eventsEyebrow} error={e.eventsEyebrow} />
                <T name="eventsHeading" label="Events heading" value={s.homeSections.eventsHeading} error={e.eventsHeading} required />
                <Field label="Events to show" name="eventsCount" error={e.eventsCount}>
                  <Input name="eventsCount" type="number" min={1} max={6} defaultValue={s.homeSections.eventsCount} />
                </Field>
                <T name="projectsEyebrow" label="Projects eyebrow" value={s.homeSections.projectsEyebrow} error={e.projectsEyebrow} />
                <T name="projectsHeading" label="Projects heading" value={s.homeSections.projectsHeading} error={e.projectsHeading} required />
                <Field label="Projects to show" name="projectsCount" error={e.projectsCount}>
                  <Input name="projectsCount" type="number" min={1} max={6} defaultValue={s.homeSections.projectsCount} />
                </Field>
                <T name="teamEyebrow" label="Team eyebrow" value={s.homeSections.teamEyebrow} error={e.teamEyebrow} />
                <T name="teamHeading" label="Team heading" value={s.homeSections.teamHeading} error={e.teamHeading} required />
                <Field label="Team members shown" name="teamMode">
                  <Select name="teamMode" defaultValue={s.homeSections.teamMode}>
                    <option value="leadership">President, VP, Secretary, Sr. Treasurer</option>
                    <option value="featured">Members marked “Feature on homepage”</option>
                  </Select>
                </Field>
              </div>
            </Card>
          )}
        </SectionForm>

        <SectionForm section="joinCta">
          {(e) => (
            <Card title="Join ARICT call to action">
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <T name="eyebrow" label="Eyebrow" value={s.joinCta.eyebrow} error={e.eyebrow} />
                  <T name="heading" label="Heading" value={s.joinCta.heading} error={e.heading} required />
                </div>
                <T name="text" label="Supporting text" value={s.joinCta.text} error={e.text} rows={2} />
                <T name="points" label="Points (one per line)" value={s.joinCta.points.join("\n")} error={e.points} rows={3} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <T name="ctaLabel" label="Button label" value={s.joinCta.ctaLabel} error={e.ctaLabel} required />
                  <T name="ctaHref" label="Button link" value={s.joinCta.ctaHref} error={e.ctaHref} />
                </div>
              </div>
            </Card>
          )}
        </SectionForm>
      </div>
    );

  if (tab === "about")
    return (
      <SectionForm section="about">
        {(e) => (
          <Card title="About page" description="Blank line = new paragraph in long text fields.">
            <div className="space-y-5">
              <T name="intro" label="Introduction" value={s.about.intro} error={e.intro} rows={3} required />
              <T name="story" label="Our story" value={s.about.story} error={e.story} rows={6} />
              <T name="history" label="History" value={s.about.history} error={e.history} rows={5} />
              <div className="grid gap-5 sm:grid-cols-2">
                <T name="mission" label="Mission" value={s.about.mission} error={e.mission} rows={3} />
                <T name="vision" label="Vision" value={s.about.vision} error={e.vision} rows={3} />
              </div>
              <T name="objectives" label="Objectives (one per line)" value={s.about.objectives.join("\n")} error={e.objectives} rows={5} />
              <T name="values" label="Values (one per line: Title - description)" value={s.about.values.map((v) => (v.description ? `${v.title} - ${v.description}` : v.title)).join("\n")} error={e.values} rows={4} />
              <T name="achievements" label="Achievements (one per line)" value={s.about.achievements.join("\n")} error={e.achievements} rows={4} />
              <T name="universityRelationship" label="Relationship with the university" value={s.about.universityRelationship} error={e.universityRelationship} rows={4} />
              <T name="futureDirection" label="Future direction" value={s.about.futureDirection} error={e.futureDirection} rows={4} />
            </div>
          </Card>
        )}
      </SectionForm>
    );

  return (
    <SectionForm section="footer">
      {(e) => (
        <Card title="Footer">
          <T name="tagline" label="Footer description" value={s.footer.tagline} error={e.tagline} rows={3} />
        </Card>
      )}
    </SectionForm>
  );
}
