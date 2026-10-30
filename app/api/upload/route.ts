import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdmin, can } from "@/lib/auth/session";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, fileExtension } from "@/lib/uploads";

/**
 * Issues short-lived client upload tokens for Vercel Blob.
 * The token itself enforces the 4 MB limit and allowed image types, so files
 * never pass through (or depend on) our function's request body limit.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let scope: unknown;
        try {
          scope = (JSON.parse(clientPayload ?? "{}") as { scope?: unknown }).scope;
        } catch {
          throw new Error("Invalid upload request.");
        }

        if (!(ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(fileExtension(pathname))) {
          throw new Error("File type not allowed.");
        }

        if (scope === "admin") {
          const admin = await getAdmin();
          if (!can(admin, "content")) throw new Error("Not authorised.");
          if (!pathname.startsWith("media/")) throw new Error("Invalid upload path.");
        } else if (scope === "submission") {
          if (!pathname.startsWith("submissions/")) throw new Error("Invalid upload path.");
          const ok = await rateLimit(`upload:${clientKey(request.headers)}`, 30, 60 * 60);
          if (!ok) throw new Error("Too many uploads. Please try again later.");
        } else {
          throw new Error("Invalid upload request.");
        }

        return {
          allowedContentTypes: [...ALLOWED_IMAGE_TYPES],
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        };
      },
      // No onUploadCompleted callback: the form that triggered the upload stores the URL,
      // and omitting it lets uploads work from localhost (Vercel can't call back to it).
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
