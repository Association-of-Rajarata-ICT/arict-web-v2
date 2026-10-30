import "server-only";
import path from "node:path";

/**
 * Local-disk storage used only when NEXT_PUBLIC_UPLOAD_MODE=local and not on Vercel.
 * Files live outside /public so they are served by app/uploads/[...path]/route.ts
 * (Next.js only serves /public files that existed at build time).
 */
export const LOCAL_UPLOAD_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "uploads");

export function localUploadsEnabled() {
  return process.env.NEXT_PUBLIC_UPLOAD_MODE === "local" && !process.env.VERCEL;
}

/** Checks magic bytes so a renamed non-image can't slip through. */
export function sniffImageType(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return "image/avif";
  return null;
}

export const EXT_FOR_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
