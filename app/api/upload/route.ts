import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { can, getAdmin } from "@/lib/auth/session";
import { cloudinaryConfig, uploadToCloudinary } from "@/lib/cloudinary";
import { EXT_FOR_TYPE, LOCAL_UPLOAD_DIR, localUploadsEnabled, sniffImageType } from "@/lib/local-uploads";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { IMAGE_SIZE_ERROR, IMAGE_TYPE_ERROR, MAX_IMAGE_BYTES, validateImageFile } from "@/lib/uploads";

/**
 * Receives one image from the browser, validates it on the server (permission
 * or rate limit, 4 MB limit, real file type from its magic bytes) and stores it:
 *  - in Cloudinary when CLOUDINARY_* is configured (production), or
 *  - on local disk when LOCAL_UPLOADS=true and not on Vercel (development only).
 * Returns { url } for the form to save.
 */
export async function POST(request: Request) {
  const useCloudinary = cloudinaryConfig() !== null;
  if (!useCloudinary && !localUploadsEnabled()) {
    return NextResponse.json(
      { error: "Image storage isn't set up yet. Add the Cloudinary keys to the environment variables." },
      { status: 503 },
    );
  }

  // Reject oversized bodies before reading them (4 MB file + a little multipart overhead).
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_IMAGE_BYTES + 64 * 1024) return NextResponse.json({ error: IMAGE_SIZE_ERROR }, { status: 413 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const scope = form?.get("scope");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });

  if (scope === "admin") {
    if (!can(await getAdmin(), "content")) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  } else if (scope === "submission") {
    if (!(await rateLimit(`upload:${clientKey(request.headers)}`, 30, 60 * 60))) {
      return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });
    }
  } else {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const invalid = validateImageFile(file);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength > MAX_IMAGE_BYTES) return NextResponse.json({ error: IMAGE_SIZE_ERROR }, { status: 413 });
  const type = sniffImageType(bytes);
  if (!type) return NextResponse.json({ error: IMAGE_TYPE_ERROR }, { status: 400 });

  const folder = scope === "submission" ? "submissions" : "media";

  if (useCloudinary) {
    try {
      return NextResponse.json({ url: await uploadToCloudinary(bytes, type, folder) });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
    }
  }

  const name = `${randomUUID()}.${EXT_FOR_TYPE[type]}`;
  await mkdir(path.join(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, folder), { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, folder, name), bytes);
  return NextResponse.json({ url: `/uploads/${folder}/${name}` });
}
