import { z } from "zod";
import { checkbox, optionalImage, optionalText, requiredText } from "./common";

const linkUrl = z.string().trim().max(500).optional().transform((value) => value || null).refine((value) => {
  if (!value) return true;
  if (/[\\\s\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}, "Use a page path like /events or a full http(s) URL.");

export const announcementSchema = z.object({
  title: requiredText("Title", 120),
  kind: z.enum(["news", "advertisement"], { error: "Choose News or Advertisement." }),
  message: requiredText("Message", 2000),
  image: optionalImage,
  imageAlt: optionalText(200, "Image description"),
  linkLabel: optionalText(40, "Button label"),
  linkUrl,
  published: checkbox,
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
}).superRefine((data, ctx) => {
  if (data.linkUrl && !data.linkLabel) ctx.addIssue({ code: "custom", path: ["linkLabel"], message: "Add a label for the button." });
  if (data.linkLabel && !data.linkUrl) ctx.addIssue({ code: "custom", path: ["linkUrl"], message: "Add the button destination." });
});
