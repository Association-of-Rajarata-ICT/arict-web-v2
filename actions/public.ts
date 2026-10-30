"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { joinApplications, projectSubmissions } from "@/lib/db/schema";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { checkSpam, createFormToken } from "@/lib/spam";
import { verifySubmissionImage } from "@/lib/upload-verify";
import { slugify } from "@/lib/utils";
import { fieldErrorsFrom, formToObject, type ActionState } from "@/lib/validations/common";
import { joinSchema, submissionSchema } from "@/lib/validations/public";

/** Issues a signed timestamp the form sends back, used for the minimum fill-time check. */
export async function getFormToken() {
  return createFormToken();
}

const done = (state: Omit<ActionState, "at">): ActionState => ({ ...state, at: Date.now() });

async function guard(formData: FormData, action: string, limit: number, windowSeconds: number) {
  const spam = checkSpam(formData);
  if (!spam.ok) {
    // Silently "succeed" for obvious bots so they don't learn what tripped them.
    if (spam.reason === "honeypot") return { blocked: true as const, state: done({ ok: true, message: "Thanks! Your submission has been received." }) };
    return {
      blocked: true as const,
      state: done({ ok: false, message: spam.reason === "expired" ? "This form expired. Please refresh the page and try again." : "Please take a moment to complete the form, then try again." }),
    };
  }
  const ip = clientKey(await headers());
  if (!(await rateLimit(`${action}:${ip}`, limit, windowSeconds))) {
    return { blocked: true as const, state: done({ ok: false, message: "Too many submissions. Please try again later." }) };
  }
  return { blocked: false as const };
}

export async function submitProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = submissionSchema.safeParse(formToObject(formData, ["screenshots", "technologies", "teamMembers"]));
    if (!parsed.success) {
      return done({ ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) });
    }
    const data = parsed.data;

    const g = await guard(formData, "submit-project", 5, 60 * 60);
    if (g.blocked) return g.state;

    if (!(await rateLimit(`submit-project:email:${data.submitterEmail}`, 3, 24 * 60 * 60))) {
      return done({ ok: false, message: "You've reached today's submission limit. Please try again tomorrow." });
    }

    const images = [data.coverImage, ...data.screenshots].filter((u): u is string => !!u);
    for (const url of images) {
      const error = await verifySubmissionImage(url);
      if (error) {
        const field = url === data.coverImage ? "coverImage" : "screenshots";
        return done({ ok: false, message: "One of your images couldn't be verified.", fieldErrors: { [field]: error } });
      }
    }

    await db.insert(projectSubmissions).values({
      title: data.title,
      slugCandidate: slugify(data.title) || "project",
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      category: data.category,
      technologies: data.technologies,
      projectYear: data.projectYear,
      coverImage: data.coverImage,
      screenshots: data.screenshots,
      githubUrl: data.githubUrl,
      liveUrl: data.liveUrl,
      portfolioUrl: data.portfolioUrl,
      linkedinUrl: data.linkedinUrl,
      videoUrl: data.videoUrl,
      teamMembers: data.teamMembers,
      submitterName: data.submitterName,
      submitterEmail: data.submitterEmail,
      status: "pending",
    });

    return done({
      ok: true,
      message: "Thanks for sharing your project! The ARICT team will review it and contact you by email.",
    });
  } catch (error) {
    console.error("submitProject failed", error);
    return done({ ok: false, message: "We couldn't submit your project right now. Please try again." });
  }
}

export async function submitJoinApplication(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = joinSchema.safeParse(formToObject(formData, ["interests"]));
    if (!parsed.success) {
      return done({ ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) });
    }
    const data = parsed.data;

    const g = await guard(formData, "join", 5, 60 * 60);
    if (g.blocked) return g.state;

    if (!(await rateLimit(`join:email:${data.email}`, 2, 24 * 60 * 60))) {
      return done({ ok: false, message: "We've already received an application from this email today." });
    }

    await db.insert(joinApplications).values({ ...data, status: "pending" });
    return done({
      ok: true,
      message: "Your application has been received. Welcome aboard — the ARICT committee will be in touch soon.",
    });
  } catch (error) {
    console.error("submitJoinApplication failed", error);
    return done({ ok: false, message: "We couldn't submit your application right now. Please try again." });
  }
}
