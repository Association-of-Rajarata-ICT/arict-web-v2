import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";
import { head } from "@vercel/blob";
import { LOCAL_UPLOAD_DIR, localUploadsEnabled } from "./local-uploads";
import { ALLOWED_IMAGE_TYPES, IMAGE_SIZE_ERROR, IMAGE_TYPE_ERROR, MAX_IMAGE_BYTES, isSubmissionUploadUrl } from "./uploads";

/**
 * Server-side check for images referenced by a public submission: the file must
 * come from our submission upload flow, be an allowed image type and be ≤ 4 MB.
 * Returns an error message, or null when the image is acceptable.
 */
export async function verifySubmissionImage(url: string): Promise<string | null> {
  if (!isSubmissionUploadUrl(url)) return "Please upload the image again.";

  if (url.startsWith("/uploads/")) {
    if (!localUploadsEnabled()) return "Please upload the image again.";
    const file = path.resolve(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, url.replace(/^\/uploads\//, ""));
    if (!file.startsWith(LOCAL_UPLOAD_DIR + path.sep)) return "Please upload the image again.";
    try {
      const s = await stat(file);
      return s.size > MAX_IMAGE_BYTES ? IMAGE_SIZE_ERROR : null;
    } catch {
      return "Please upload the image again.";
    }
  }

  try {
    const meta = await head(url);
    if (meta.size > MAX_IMAGE_BYTES) return IMAGE_SIZE_ERROR;
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(meta.contentType)) return IMAGE_TYPE_ERROR;
    return null;
  } catch {
    return "Please upload the image again.";
  }
}
