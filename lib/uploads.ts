/** Shared upload rules, used by both the browser and the server. */

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB
export const MAX_SUBMISSION_SCREENSHOTS = 5;
export const IMAGE_SIZE_ERROR = "Image size must be 4 MB or less.";
export const IMAGE_TYPE_ERROR = "Use a JPG, PNG, WebP or AVIF image.";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"] as const;
export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",") + ",.jpg,.jpeg,.png,.webp,.avif";

export type UploadScope = "admin" | "submission";

export function fileExtension(name: string) {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1]!.toLowerCase() : "";
}

export function validateImageFile(file: { name: string; size: number; type: string }): string | null {
  if (file.size > MAX_IMAGE_BYTES) return IMAGE_SIZE_ERROR;
  const ext = fileExtension(file.name);
  if (!(ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext)) return IMAGE_TYPE_ERROR;
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) return IMAGE_TYPE_ERROR;
  return null;
}

const BLOB_HOST = /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i;

/** Images we are willing to render: our Blob store, local static/uploaded files, and seed photos. */
export function isAllowedImageUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return !value.includes("..");
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return BLOB_HOST.test(url.hostname) || url.hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}

/** Public submissions may only reference files uploaded through our submission upload flow. */
export function isSubmissionUploadUrl(value: string) {
  if (value.startsWith("/uploads/submissions/")) return !value.includes("..");
  try {
    const url = new URL(value);
    return url.protocol === "https:" && BLOB_HOST.test(url.hostname) && url.pathname.startsWith("/submissions/");
  } catch {
    return false;
  }
}
