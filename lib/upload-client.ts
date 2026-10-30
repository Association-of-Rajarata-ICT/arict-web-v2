import { fileExtension, validateImageFile, type UploadScope } from "./uploads";
import { slugify } from "./utils";

/**
 * Uploads an image from the browser and returns its public URL.
 *  - Production: direct-to-Vercel-Blob client upload. The token issued by
 *    /api/upload enforces the 4 MB limit and image MIME types server-side.
 *  - Local development (NEXT_PUBLIC_UPLOAD_MODE=local): posts to /api/upload/local.
 *    Ignored on Vercel deployments (NEXT_PUBLIC_VERCEL_ENV is set there), so a
 *    stray local-mode variable can't break production uploads.
 */
const useLocalUploads = process.env.NEXT_PUBLIC_UPLOAD_MODE === "local" && !process.env.NEXT_PUBLIC_VERCEL_ENV;

export async function uploadImage(file: File, scope: UploadScope): Promise<string> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 60) || "image";
  const ext = fileExtension(file.name);

  if (useLocalUploads) {
    const body = new FormData();
    body.append("file", file);
    body.append("scope", scope);
    const res = await fetch("/api/upload/local", { method: "POST", body });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed. Please try again.");
    return data.url;
  }

  const { upload } = await import("@vercel/blob/client");
  try {
    const blob = await upload(`${scope === "submission" ? "submissions" : "media"}/${base}.${ext}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      clientPayload: JSON.stringify({ scope }),
      contentType: file.type,
    });
    return blob.url;
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (/size|too large|maximum/i.test(message)) throw new Error("Image size must be 4 MB or less.");
    if (/content type|not allowed/i.test(message)) throw new Error("Use a JPG, PNG, WebP or AVIF image.");
    if (/rate|too many/i.test(message)) throw new Error("Too many uploads. Please wait a few minutes.");
    if (/token/i.test(message)) throw new Error("Image storage isn't set up yet. Connect Vercel Blob to the project.");
    throw new Error("Upload failed. Please try again.");
  }
}
