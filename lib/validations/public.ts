import { z } from "zod";
import { MAX_SUBMISSION_SCREENSHOTS } from "../uploads";
import {
  emailField,
  listField,
  optionalText,
  optionalUrl,
  requiredText,
  yearField,
} from "./common";

export const PROJECT_CATEGORIES = [
  "Web Application",
  "Mobile Application",
  "AI / Machine Learning",
  "Data Science",
  "IoT / Embedded",
  "Cybersecurity",
  "Game Development",
  "Desktop Application",
  "Research",
  "Other",
] as const;

export const EVENT_CATEGORIES = [
  "Workshop",
  "Seminar",
  "Hackathon",
  "Competition",
  "Talk",
  "Bootcamp",
  "Social",
  "Other",
] as const;

export const JOIN_INTERESTS = [
  "Web Development",
  "Mobile Development",
  "AI / Machine Learning",
  "Data Science",
  "Cybersecurity",
  "UI / UX Design",
  "Cloud & DevOps",
  "IoT / Hardware",
  "Game Development",
  "Event Organising",
  "Media & Content",
] as const;

/* --------------------------------------------------------------------------
 * Contact (sent through EmailJS from the browser)
 * ----------------------------------------------------------------------- */

export const contactSchema = z.object({
  name: requiredText("Name", 100, 2),
  email: emailField,
  phone: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim())
    .pipe(z.union([z.literal(""), z.string().regex(/^[+()\d\s-]{7,20}$/, "Enter a valid phone number.")])),
  subject: requiredText("Subject", 150, 3),
  message: requiredText("Message", 3000, 10),
});

export type ContactInput = z.infer<typeof contactSchema>;

/* --------------------------------------------------------------------------
 * Join ARICT
 * ----------------------------------------------------------------------- */

export const joinSchema = z.object({
  fullName: requiredText("Full name", 120, 2),
  email: emailField,
  phone: z
    .string({ error: "Phone number is required." })
    .trim()
    .regex(/^[+()\d\s-]{7,20}$/, "Enter a valid phone number."),
  registrationNumber: requiredText("Registration number", 40, 3),
  academicYear: z.coerce
    .number({ error: "Select your academic year." })
    .int()
    .min(1, "Select your academic year.")
    .max(4, "Select your academic year."),
  degree: requiredText("Degree / program", 120, 2),
  interests: listField("interest", 11, 60).pipe(z.array(z.string()).min(1, "Choose at least one area of interest.")),
  skills: requiredText("Technical skills", 1000, 2),
  reason: requiredText("Reason for joining", 2000, 20),
  linkedinUrl: optionalUrl("LinkedIn URL"),
  githubUrl: optionalUrl("GitHub URL"),
});

export type JoinInput = z.infer<typeof joinSchema>;

/* --------------------------------------------------------------------------
 * Public project submission
 * ----------------------------------------------------------------------- */

export const submissionSchema = z.object({
  title: requiredText("Project title", 160, 3),
  shortDescription: requiredText("Short description", 300, 20),
  fullDescription: requiredText("Full description", 8000, 50),
  category: z.enum(PROJECT_CATEGORIES, { error: "Choose a project category." }),
  technologies: listField("technology", 15, 40).pipe(z.array(z.string()).min(1, "List at least one technology.")),
  projectYear: yearField("Project year"),
  submitterName: requiredText("Your name", 120, 2),
  submitterEmail: emailField,
  coverImage: optionalText(500),
  screenshots: z
    .array(z.string().trim().max(500))
    .optional()
    .transform((v) => (v ?? []).filter(Boolean))
    .pipe(z.array(z.string()).max(MAX_SUBMISSION_SCREENSHOTS, `Add at most ${MAX_SUBMISSION_SCREENSHOTS} screenshots.`)),
  githubUrl: optionalUrl("GitHub URL"),
  liveUrl: optionalUrl("Live demo URL"),
  teamMembers: listField("team member", 12, 120),
  portfolioUrl: optionalUrl("Portfolio URL"),
  linkedinUrl: optionalUrl("LinkedIn URL"),
  videoUrl: optionalUrl("Video URL"),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
