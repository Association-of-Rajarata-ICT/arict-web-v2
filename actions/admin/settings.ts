"use server";

import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { invalidate } from "@/lib/revalidate";
import { SETTINGS_KEYS, settingsSchemas, type SettingsKey } from "@/lib/settings";
import { fieldErrorsFrom, type ActionState } from "@/lib/validations/common";
import { adminAction, fail, ok } from "./_helpers";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");
const lines = (fd: FormData, k: string) =>
  str(fd, k)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** Maps the flat form fields of each settings section onto its stored JSON shape. */
function readSection(section: SettingsKey, fd: FormData): Record<string, unknown> {
  const pick = (...keys: string[]) => Object.fromEntries(keys.map((k) => [k, str(fd, k)]));
  switch (section) {
    case "general":
      return pick("siteName", "fullName", "description", "logo", "defaultOgImage", "seoDescription");
    case "contact":
      return pick("email", "phone", "address", "mapEmbedUrl", "mapLink", "officeHours");
    case "social":
      return pick("facebook", "linkedin", "instagram", "youtube", "github");
    case "hero":
      return pick("badge", "headingLine1", "headingLine2", "highlight", "text", "backgroundImage", "backgroundAlt", "videoUrl", "primaryCtaLabel", "primaryCtaHref", "secondaryCtaLabel");
    case "aboutPreview":
      return pick("eyebrow", "heading", "description", "ctaLabel", "ctaHref", "image");
    case "stats":
      return {
        items: Array.from({ length: 6 }, (_, i) => ({
          label: str(fd, `stat_label_${i}`).trim(),
          value: str(fd, `stat_value_${i}`).trim(),
          suffix: str(fd, `stat_suffix_${i}`).trim(),
        })).filter((s) => s.label !== ""),
      };
    case "whatWeDo":
      return {
        ...pick("eyebrow", "heading", "description"),
        items: Array.from({ length: 8 }, (_, i) => ({
          title: str(fd, `item_title_${i}`).trim(),
          description: str(fd, `item_desc_${i}`).trim(),
          icon: str(fd, `item_icon_${i}`) || "lightbulb",
        })).filter((s) => s.title !== ""),
      };
    case "homeSections":
      return pick("eventsEyebrow", "eventsHeading", "eventsCount", "projectsEyebrow", "projectsHeading", "projectsCount", "teamEyebrow", "teamHeading", "teamMode");
    case "joinCta":
      return { ...pick("eyebrow", "heading", "text", "ctaLabel", "ctaHref"), points: lines(fd, "points") };
    case "about":
      return {
        ...pick("intro", "story", "history", "mission", "vision", "universityRelationship", "futureDirection"),
        objectives: lines(fd, "objectives"),
        achievements: lines(fd, "achievements"),
        values: lines(fd, "values").map((l) => {
          const [title, ...rest] = l.split(/\s+[—–-]\s+/);
          return { title: title!.trim(), description: rest.join(" - ").trim() };
        }),
      };
    case "footer":
      return pick("tagline");
  }
}

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("settings", async () => {
    const section = str(formData, "section") as SettingsKey;
    if (!SETTINGS_KEYS.includes(section)) return fail("Unknown settings section.");

    const parsed = settingsSchemas[section].safeParse(readSection(section, formData));
    if (!parsed.success) {
      const errors = fieldErrorsFrom(parsed.error);
      const first = parsed.error.issues[0];
      return fail(`Please check the form${first ? `: ${first.path.join(" › ")} — ${first.message}` : "."}`, errors);
    }

    await db
      .insert(siteSettings)
      .values({ key: section, value: parsed.data })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: parsed.data, updatedAt: new Date() } });
    invalidate("settings");
    return ok("Settings saved. The public site has been updated.");
  });
}
