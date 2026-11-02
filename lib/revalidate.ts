import "server-only";
import { updateTag } from "next/cache";
import { after } from "next/server";
import { TAGS } from "./data/public";

/**
 * Expires public caches after an admin mutation so changes show on the next request.
 *
 * When the admin runs somewhere other than the live site (e.g. `npm run dev`
 * against the production database), this deployment's cache is cleared locally
 * and the live site is also told to clear its cache, via REVALIDATE_REMOTE_URL
 * and REVALIDATE_SECRET. That call runs after the response, so saving stays fast.
 */
export function invalidate(...tags: (keyof typeof TAGS)[]) {
  for (const tag of tags) updateTag(TAGS[tag]);

  const url = process.env.REVALIDATE_REMOTE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret || process.env.VERCEL) return;

  const names = tags.map((t) => TAGS[t]);
  after(async () => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
        body: JSON.stringify({ tags: names }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) console.error(`Live-site cache refresh failed (HTTP ${res.status}) for: ${names.join(", ")}`);
    } catch (error) {
      console.error(`Live-site cache refresh failed for: ${names.join(", ")}`, error);
    }
  });
}
