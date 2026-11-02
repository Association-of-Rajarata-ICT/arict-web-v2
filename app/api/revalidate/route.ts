import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { TAGS } from "@/lib/data/public";

const ALLOWED = new Set<string>(Object.values(TAGS));

/**
 * Clears this deployment's public caches for the given tags. Used when content
 * is edited from another environment (e.g. the admin running on a laptop
 * against the production database), whose own cache clearing can't reach here.
 *
 *   POST /api/revalidate   Authorization: Bearer <REVALIDATE_SECRET>   { "tags": ["events"] }
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const given = Buffer.from((request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, ""));
  const expected = Buffer.from(secret);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === "string" && ALLOWED.has(t)) : [];
  if (tags.length === 0) return NextResponse.json({ error: "No valid tags." }, { status: 400 });

  // expire: 0 → the next visitor gets fresh content instead of a stale copy.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: tags });
}
