import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";
import { isOwnCloudinaryUrl } from "./cloudinary";
import { LOCAL_UPLOAD_DIR, localUploadsEnabled } from "./local-uploads";
import { ALLOWED_IMAGE_TYPES, IMAGE_SIZE_ERROR, IMAGE_TYPE_ERROR, MAX_IMAGE_BYTES } from "./uploads";

const REUPLOAD = "Please upload the image again.";

/**
 * Server-side check for images referenced by a public submission: the file must
 * come from our submission upload flow (our Cloudinary account, or local disk in
 * development), be an allowed image type and be ≤ 4 MB.
 * Returns an error message, or null when the image is acceptable.
 */
export async function verifySubmissionImage(url: string): Promise<string | null> {
  if (url.startsWith("/uploads/submissions/")) {
    if (!localUploadsEnabled() || url.includes("..")) return REUPLOAD;
    const file = path.resolve(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, url.replace(/^\/uploads\//, ""));
    if (!file.startsWith(LOCAL_UPLOAD_DIR + path.sep)) return REUPLOAD;
    try {
      const s = await stat(file);
      return s.size > MAX_IMAGE_BYTES ? IMAGE_SIZE_ERROR : null;
    } catch {
      return REUPLOAD;
    }
  }

  if (!isOwnCloudinaryUrl(url, "submissions")) return REUPLOAD;
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return REUPLOAD;
    const type = res.headers.get("content-type") ?? "";
    const size = Number(res.headers.get("content-length") ?? 0);
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(type.split(";")[0]!.trim())) return IMAGE_TYPE_ERROR;
    if (size > MAX_IMAGE_BYTES) return IMAGE_SIZE_ERROR;
    return null;
  } catch {
    return REUPLOAD;
  }
}
