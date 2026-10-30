import "server-only";
import { updateTag } from "next/cache";
import { TAGS } from "./data/public";

/** Expires public caches after an admin mutation so changes show on the next request. */
export function invalidate(...tags: (keyof typeof TAGS)[]) {
  for (const tag of tags) updateTag(TAGS[tag]);
}
