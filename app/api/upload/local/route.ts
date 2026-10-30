import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { can, getAdmin } from "@/lib/auth/session";
import { EXT_FOR_TYPE, LOCAL_UPLOAD_DIR, localUploadsEnabled, sniffImageType } from "@/lib/local-uploads";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { IMAGE_SIZE_ERROR, IMAGE_TYPE_ERROR, MAX_IMAGE_BYTES, validateImageFile } from "@/lib/uploads";

/** Development-only upload endpoint that mirrors the Blob upload rules. */
export async function POST(request: Request) {
  if (!localUploadsEnabled()) return NextResponse.json({ error: "Not found." }, { status: 404 });

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
  const sniffed = sniffImageType(bytes);
  if (!sniffed) return NextResponse.json({ error: IMAGE_TYPE_ERROR }, { status: 400 });

  const folder = scope === "submission" ? "submissions" : "media";
  const name = `${randomUUID()}.${EXT_FOR_TYPE[sniffed]}`;
  await mkdir(path.join(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, folder), { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, folder, name), bytes);
  return NextResponse.json({ url: `/uploads/${folder}/${name}` });
}
