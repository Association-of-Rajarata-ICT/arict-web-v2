import { z } from "zod";
import { eventStatus, joinStatus, projectStatus, submissionStatus, teamPosition } from "../db/schema";
import { CUSTOM_POSITION_MAX_LENGTH, CUSTOM_YEAR_MAX_LENGTH, OTHER_YEAR } from "../team";
import { otherCategoryFields, resolveOtherCategory, validateOtherCategory } from "./other-category";
import {
  checkbox,
  dateField,
  listField,
  optionalDate,
  optionalFacebookAlbumUrl,
  optionalImage,
  optionalText,
  optionalTime,
  optionalUrl,
  requiredText,
  slugField,
  yearField,
} from "./common";

const imageList = z
  .array(z.string())
  .optional()
  .transform((v) => (v ?? []).map((s) => s.trim()).filter(Boolean))
  .pipe(z.array(z.string().max(500)).max(20, "Add at most 20 images."));

export const eventSchema = z
  .object({
    title: requiredText("Title", 160, 3),
    slug: slugField,
    excerpt: requiredText("Excerpt", 300, 10),
    content: optionalText(20000, "Description").transform((v) => v ?? ""),
    coverImage: optionalImage,
    startDate: dateField("Start date"),
    endDate: optionalDate("End date"),
    startTime: optionalTime("Start time"),
    endTime: optionalTime("End time"),
    location: optionalText(200, "Venue"),
    organizer: optionalText(160, "Organizer"),
    registrationUrl: optionalUrl("Registration URL"),
    facebookAlbumUrl: optionalFacebookAlbumUrl,
    status: z.enum(eventStatus.enumValues),
    ...otherCategoryFields,
    featured: checkbox,
    published: checkbox,
    images: imageList,
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    message: "End date cannot be before the start date.",
    path: ["endDate"],
  })
  .superRefine(validateOtherCategory)
  .transform(resolveOtherCategory);

export const projectSchema = z.object({
  title: requiredText("Title", 160, 3),
  slug: slugField,
  excerpt: requiredText("Excerpt", 300, 10),
  content: optionalText(20000, "Description").transform((v) => v ?? ""),
  coverImage: optionalImage,
  githubUrl: optionalUrl("GitHub URL"),
  liveUrl: optionalUrl("Live demo URL"),
  videoUrl: optionalUrl("Video URL"),
  year: yearField(),
  ...otherCategoryFields,
  status: z.enum(projectStatus.enumValues),
  featured: checkbox,
  published: checkbox,
  technologies: listField("technology", 20, 40),
  contributors: z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [name, ...role] = line.split(/\s+[-–—|]\s+/);
          return { name: name!.trim().slice(0, 120), role: role.join(" - ").trim().slice(0, 80) || null };
        }),
    )
    .pipe(z.array(z.object({ name: z.string().min(1), role: z.string().nullable() })).max(30)),
  screenshots: imageList,
}).superRefine(validateOtherCategory).transform(resolveOtherCategory);

export const teamTermSchema = z
  .object({
    title: requiredText("Title", 120, 3),
    year: yearField(),
    startDate: optionalDate("Start date"),
    endDate: optionalDate("End date"),
    description: optionalText(1000, "Description"),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    message: "End date cannot be before the start date.",
    path: ["endDate"],
  });

export const teamMemberSchema = z
  .object({
    teamTermId: z.uuid("Choose a committee term."),
    fullName: requiredText("Full name", 120, 2),
    position: z.enum(teamPosition.enumValues, { error: "Choose a position." }),
    customPosition: optionalText(CUSTOM_POSITION_MAX_LENGTH, "Position title"),
    academicYear: z.coerce.number().int().min(OTHER_YEAR, "Choose an academic year.").max(4, "Choose an academic year."),
    customYear: optionalText(CUSTOM_YEAR_MAX_LENGTH, "Year details"),
    image: optionalImage,
    linkedinUrl: optionalUrl("LinkedIn URL"),
    portfolioUrl: optionalUrl("Portfolio URL"),
    featuredOnHome: checkbox,
  })
  .superRefine((v, ctx) => {
    if (v.academicYear === OTHER_YEAR && !v.customYear) {
      ctx.addIssue({ code: "custom", path: ["customYear"], message: "Please specify, e.g. Senior Lecturer." });
    }
    if (v.position === "other" && !v.customPosition) {
      ctx.addIssue({ code: "custom", path: ["customPosition"], message: "Enter the position title." });
    }
  })
  // The typed-in text only belongs with "Other".
  .transform((v) => ({
    ...v,
    customPosition: v.position === "other" ? v.customPosition : null,
    customYear: v.academicYear === OTHER_YEAR ? v.customYear : null,
  }));

export const submissionReviewSchema = z.object({
  id: z.uuid(),
  status: z.enum(submissionStatus.enumValues),
  adminNotes: optionalText(4000, "Notes"),
});

export const joinReviewSchema = z.object({
  id: z.uuid(),
  status: z.enum(joinStatus.enumValues),
  adminNotes: optionalText(4000, "Notes"),
});

export const userSchema = z.object({
  name: requiredText("Name", 120, 2),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
  role: z.enum(["super_admin", "admin", "editor"]),
  password: z.string().min(10, "Password must be at least 10 characters.").max(200),
});
