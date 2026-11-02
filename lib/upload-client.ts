import { validateImageFile, type UploadScope } from "./uploads";

/**
 * Uploads an image from the browser and returns its public URL.
 * The server (/api/upload) re-validates the file and stores it in Cloudinary
 * (or on local disk in development).
 */
export async function uploadImage(file: File, scope: UploadScope): Promise<string> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  const body = new FormData();
  body.append("file", file);
  body.append("scope", scope);

  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body });
  } catch {
    throw new Error("Upload failed. Check your connection and try again.");
  }
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    if (res.status === 413) throw new Error("Image size must be 4 MB or less.");
    throw new Error(data.error ?? "Upload failed. Please try again.");
  }
  return data.url;
}
