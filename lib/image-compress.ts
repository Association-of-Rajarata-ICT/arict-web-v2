/**
 * Shrinks large photos in the browser before upload so phone/camera images
 * (often 5–15 MB) fit comfortably under the 4 MB limit. Small files and
 * formats the browser can't safely re-encode are returned unchanged; the
 * 4 MB validation still runs on whatever comes out.
 */
const MAX_SIDE = 2400;
const SKIP_BELOW_BYTES = 1.5 * 1024 * 1024;
const RESIZABLE = ["image/jpeg", "image/png", "image/webp"];

export async function prepareImage(file: File): Promise<File> {
  if (typeof window === "undefined" || !RESIZABLE.includes(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file); // respects EXIF orientation
  } catch {
    return file;
  }

  const longest = Math.max(bitmap.width, bitmap.height);
  if (file.size <= SKIP_BELOW_BYTES && longest <= MAX_SIDE) {
    bitmap.close();
    return file;
  }

  const scale = Math.min(1, MAX_SIDE / longest);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const encode = (quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));

  let blob = await encode(0.85);
  if (blob && blob.size > 3.5 * 1024 * 1024) blob = await encode(0.7);
  // WebP keeps transparency, but fall back to the original if re-encoding didn't help.
  if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type: "image/webp", lastModified: Date.now() });
}
