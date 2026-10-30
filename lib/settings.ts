import { z } from "zod";
import { SITE } from "./site";

/**
 * Site settings are stored as one JSON document per section in `site_settings`.
 * These schemas validate admin input, and the defaults are used for any section
 * that has not been saved yet.
 */

const text = (max: number) => z.string().trim().max(max);
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Enter a valid URL starting with http:// or https://");
const link = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\/[^\s]+$/i.test(v), "Enter a path like /join or a full URL");
const imagePath = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || /^https:\/\/[^\s]+$/i.test(v), "Enter an uploaded image URL");

export const WHAT_WE_DO_ICONS = [
  "calendar",
  "folder",
  "users",
  "lightbulb",
  "code",
  "rocket",
  "trophy",
  "graduation",
  "cpu",
  "globe",
] as const;

export const settingsSchemas = {
  general: z.object({
    siteName: text(40).min(1),
    fullName: text(160).min(1),
    description: text(400).min(1),
    logo: imagePath,
    defaultOgImage: imagePath,
    seoDescription: text(170).min(1),
  }),
  contact: z.object({
    email: z.union([z.literal(""), z.email().max(254)]),
    phone: text(40),
    address: text(300),
    mapEmbedUrl: optionalUrl,
    mapLink: optionalUrl,
    officeHours: text(120),
  }),
  social: z.object({
    facebook: optionalUrl,
    linkedin: optionalUrl,
    instagram: optionalUrl,
    youtube: optionalUrl,
    github: optionalUrl,
  }),
  hero: z.object({
    badge: text(120),
    headingLine1: text(60).min(1),
    headingLine2: text(60),
    highlight: text(40),
    text: text(240).min(1),
    backgroundImage: imagePath,
    backgroundAlt: text(200),
    videoUrl: optionalUrl,
    primaryCtaLabel: text(40).min(1),
    primaryCtaHref: link,
    secondaryCtaLabel: text(40),
  }),
  aboutPreview: z.object({
    eyebrow: text(40),
    heading: text(120).min(1),
    description: text(900).min(1),
    ctaLabel: text(60),
    ctaHref: link,
    image: imagePath,
  }),
  stats: z.object({
    items: z
      .array(
        z.object({
          label: text(40).min(1),
          value: z.coerce.number().int().min(0).max(1_000_000),
          suffix: text(4),
        }),
      )
      .max(6),
  }),
  whatWeDo: z.object({
    eyebrow: text(40),
    heading: text(120).min(1),
    description: text(300),
    items: z
      .array(
        z.object({
          title: text(60).min(1),
          description: text(240).min(1),
          icon: z.enum(WHAT_WE_DO_ICONS),
        }),
      )
      .min(1)
      .max(8),
  }),
  homeSections: z.object({
    eventsEyebrow: text(40),
    eventsHeading: text(120).min(1),
    eventsCount: z.coerce.number().int().min(1).max(6),
    projectsEyebrow: text(40),
    projectsHeading: text(120).min(1),
    projectsCount: z.coerce.number().int().min(1).max(6),
    teamEyebrow: text(40),
    teamHeading: text(120).min(1),
    teamMode: z.enum(["featured", "leadership"]),
  }),
  joinCta: z.object({
    eyebrow: text(40),
    heading: text(140).min(1),
    text: text(300),
    points: z.array(text(60).min(1)).max(5),
    ctaLabel: text(40).min(1),
    ctaHref: link,
  }),
  about: z.object({
    intro: text(800).min(1),
    story: text(3000),
    history: text(3000),
    mission: text(600),
    vision: text(600),
    objectives: z.array(text(240).min(1)).max(12),
    values: z.array(z.object({ title: text(60).min(1), description: text(240) })).max(8),
    achievements: z.array(text(240).min(1)).max(12),
    universityRelationship: text(1500),
    futureDirection: text(1500),
  }),
  footer: z.object({
    tagline: text(300),
  }),
} as const;

export type SettingsKey = keyof typeof settingsSchemas;
export type SiteSettings = { [K in SettingsKey]: z.infer<(typeof settingsSchemas)[K]> };

export const SETTINGS_KEYS = Object.keys(settingsSchemas) as SettingsKey[];

export const DEFAULT_SETTINGS: SiteSettings = {
  general: {
    siteName: SITE.name,
    fullName: SITE.fullName,
    description: SITE.description,
    logo: "/brand/arict-logo.png",
    defaultOgImage: "/og-default.jpg",
    seoDescription:
      "ARICT is the student technology community at Rajarata University of Sri Lanka: events, student projects, leadership and innovation.",
  },
  contact: {
    email: "",
    phone: "",
    address: "Rajarata University of Sri Lanka, Mihintale 50300, Sri Lanka",
    mapEmbedUrl: "https://www.google.com/maps?q=Rajarata+University+of+Sri+Lanka+Mihintale&output=embed",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Rajarata+University+of+Sri+Lanka",
    officeHours: "Monday – Friday, 9:00 AM – 4:00 PM",
  },
  social: { facebook: "", linkedin: "", instagram: "", youtube: "", github: "" },
  hero: {
    badge: "",
    headingLine1: "Empowering Innovation",
    headingLine2: "Through",
    highlight: "Technology.",
    text: "A student-driven community creating opportunities, building skills, and shaping the next generation of innovators.",
    backgroundImage: "/images/hero-campus.jpg",
    backgroundAlt: "Rajarata University campus building surrounded by trees under a bright blue sky",
    videoUrl: "",
    primaryCtaLabel: "Explore Events",
    primaryCtaHref: "/events",
    secondaryCtaLabel: "Watch Video",
  },
  aboutPreview: {
    eyebrow: "About ARICT",
    heading: "A Student Community Driven by Technology.",
    description:
      "ARICT brings together students of Rajarata University who are curious about technology. We run workshops, hackathons and talks, build real projects together, and create space for students to grow as engineers, designers and leaders.",
    ctaLabel: "Learn More About Us",
    ctaHref: "/about",
    image: "",
  },
  stats: {
    items: [
      { label: "Events", value: 20, suffix: "+" },
      { label: "Students", value: 500, suffix: "+" },
      { label: "Projects", value: 10, suffix: "+" },
    ],
  },
  whatWeDo: {
    eyebrow: "What We Do",
    heading: "More Than Just a Student Association.",
    description: "Four areas guide everything ARICT plans, builds and supports.",
    items: [
      {
        title: "Events",
        description: "Workshops, seminars, competitions, hackathons and technology-focused activities.",
        icon: "calendar",
      },
      {
        title: "Projects",
        description: "Student-built systems, applications and real-world technology initiatives.",
        icon: "folder",
      },
      {
        title: "Community",
        description: "Bring students together and create opportunities for collaboration.",
        icon: "users",
      },
      {
        title: "Innovation",
        description: "Encourage experimentation, creativity and technology-driven problem solving.",
        icon: "lightbulb",
      },
    ],
  },
  homeSections: {
    eventsEyebrow: "Upcoming Events",
    eventsHeading: "Be Part of What's Next.",
    eventsCount: 3,
    projectsEyebrow: "Featured Projects",
    projectsHeading: "Ideas Into Real Impact.",
    projectsCount: 3,
    teamEyebrow: "Our Team",
    teamHeading: "Meet the People Behind ARICT.",
    teamMode: "leadership",
  },
  joinCta: {
    eyebrow: "Join Our Journey",
    heading: "Let's Build a Brighter Tech Community Together.",
    text: "Membership is open to Rajarata University students who want to learn, build and lead.",
    points: ["Meet like-minded peers", "Gain new skills", "Make an impact"],
    ctaLabel: "Join ARICT",
    ctaHref: "/join",
  },
  about: {
    intro:
      "ARICT, the Association of Rajarata Information & Communication Technology, is a student-led community at Rajarata University of Sri Lanka for everyone who wants to learn, build and lead with technology.",
    story:
      "ARICT started with a small group of students who wanted more than lectures: a place to experiment, to share what they were learning and to build things together.\n\nThat group grew into an association that now runs workshops, hackathons and talks across the year, supports student projects and connects members with industry.",
    history:
      "Since its founding, ARICT has been run by an elected student committee that changes each academic year. Every committee has added something new: a workshop series, a hackathon, a mentoring circle, a project showcase. All of it remains part of the association's record.",
    mission:
      "To create opportunities for Rajarata University students to build practical technology skills, work on meaningful projects and grow as leaders.",
    vision:
      "A connected, confident student tech community whose members shape Sri Lanka's digital future.",
    objectives: [
      "Organise workshops, seminars and competitions that build practical skills",
      "Support student-built projects from idea to launch",
      "Connect students with industry professionals and alumni",
      "Develop leadership through committee and event roles",
      "Promote ethical, inclusive and responsible use of technology",
    ],
    values: [
      { title: "Curiosity", description: "We ask questions, try things and learn in public." },
      { title: "Collaboration", description: "Good work is done together, across years and disciplines." },
      { title: "Integrity", description: "We build honestly and give credit where it is due." },
      { title: "Impact", description: "We favour work that helps real people." },
    ],
    achievements: [
      "20+ technology events organised for students",
      "500+ students reached through workshops and talks",
      "10+ student projects showcased",
    ],
    universityRelationship:
      "ARICT operates as a recognised student association of Rajarata University of Sri Lanka, working with academic staff and the university administration to complement the curriculum with hands-on learning.",
    futureDirection:
      "Over the coming years ARICT plans to grow its project incubation programme, expand industry partnerships and open more of its events to students across the region.",
  },
  footer: {
    tagline:
      "A student-driven technology community at Rajarata University of Sri Lanka focused on innovation, collaboration and student development.",
  },
};

/** Shallow-merges stored values over defaults and validates the result. */
export function resolveSettings(stored: Partial<Record<string, unknown>>): SiteSettings {
  const out = {} as Record<SettingsKey, unknown>;
  for (const key of SETTINGS_KEYS) {
    const merged = { ...DEFAULT_SETTINGS[key], ...((stored[key] as object | undefined) ?? {}) };
    const parsed = settingsSchemas[key].safeParse(merged);
    out[key] = parsed.success ? parsed.data : DEFAULT_SETTINGS[key];
  }
  return out as SiteSettings;
}
