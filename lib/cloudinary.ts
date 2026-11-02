import "server-only";
import { createHash, randomUUID } from "node:crypto";

/**
 * Cloudinary image storage. Uploads are signed on the server with the API
 * secret, so the secret never reaches the browser. Only the resulting
 * https://res.cloudinary.com/... URL is stored in the database.
 *
 * Configure with CLOUDINARY_URL (cloudinary://<key>:<secret>@<cloud_name>)
 * or the three separate CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET variables.
 */
type CloudinaryConfig = { cloudName: string; apiKey: string; apiSecret: string };

export const CLOUDINARY_ROOT_FOLDER = "arict";
export type UploadFolder = "media" | "submissions";

export function cloudinaryConfig(): CloudinaryConfig | null {
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    try {
      const u = new URL(url);
      if (u.protocol === "cloudinary:" && u.username && u.password && u.hostname) {
        return { cloudName: u.hostname, apiKey: decodeURIComponent(u.username), apiSecret: decodeURIComponent(u.password) };
      }
    } catch {
      // fall through to the separate variables
    }
  }
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

function sign(params: Record<string, string>, secret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(payload + secret).digest("hex");
}

/** Uploads an already-validated image and returns its HTTPS delivery URL. */
export async function uploadToCloudinary(bytes: Uint8Array<ArrayBuffer>, contentType: string, folder: UploadFolder) {
  const cfg = cloudinaryConfig();
  if (!cfg) throw new Error("Cloudinary is not configured.");

  // A public_id with slashes places the file in arict/<folder>/ in every Cloudinary folder mode.
  const params = {
    public_id: `${CLOUDINARY_ROOT_FOLDER}/${folder}/${randomUUID()}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };

  const form = new FormData();
  form.append("file", new Blob([bytes], { type: contentType }));
  form.append("api_key", cfg.apiKey);
  form.append("public_id", params.public_id);
  form.append("timestamp", params.timestamp);
  form.append("signature", sign(params, cfg.apiSecret));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cfg.cloudName)}/image/upload`, {
    method: "POST",
    body: form,
  });
  const data = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok || !data.secure_url) {
    throw new Error(`Cloudinary upload failed (${res.status}): ${data.error?.message ?? "unknown error"}`);
  }
  return data.secure_url;
}

/** True when the URL is an image in *our* Cloudinary account under the given folder. */
export function isOwnCloudinaryUrl(value: string, folder: UploadFolder) {
  const cfg = cloudinaryConfig();
  if (!cfg) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.startsWith(`/${cfg.cloudName}/image/upload/`) &&
      url.pathname.includes(`/${CLOUDINARY_ROOT_FOLDER}/${folder}/`)
    );
  } catch {
    return false;
  }
}
