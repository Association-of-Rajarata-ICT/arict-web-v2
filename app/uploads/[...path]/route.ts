import { readFile } from "node:fs/promises";
import path from "node:path";
import { EXT_FOR_TYPE, LOCAL_UPLOAD_DIR, localUploadsEnabled } from "@/lib/local-uploads";

const TYPE_FOR_EXT = Object.fromEntries(Object.entries(EXT_FOR_TYPE).map(([t, e]) => [e, t]));

/** Serves files saved by the development upload endpoint. */
export async function GET(_request: Request, { params }: RouteContext<"/uploads/[...path]">) {
  if (!localUploadsEnabled()) return new Response("Not found", { status: 404 });
  const segments = (await params).path;
  const file = path.resolve(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, ...segments);
  if (!file.startsWith(LOCAL_UPLOAD_DIR + path.sep)) return new Response("Not found", { status: 404 });
  const type = TYPE_FOR_EXT[path.extname(file).slice(1).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(file);
    return new Response(data, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
