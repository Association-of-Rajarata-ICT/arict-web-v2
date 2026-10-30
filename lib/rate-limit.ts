import "server-only";
import { createHash } from "node:crypto";
import { and, count, eq, gte, lt } from "drizzle-orm";
import { db } from "./db";
import { rateLimitHits } from "./db/schema";

/**
 * Fixed-window rate limiter backed by Postgres, so limits hold across
 * serverless instances without extra infrastructure.
 * Returns true when the request is allowed.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const hashed = hashKey(key);
  const since = new Date(Date.now() - windowSeconds * 1000);
  const [{ value }] = await db
    .select({ value: count() })
    .from(rateLimitHits)
    .where(and(eq(rateLimitHits.key, hashed), gte(rateLimitHits.createdAt, since)));
  if (value >= limit) return false;
  await db.insert(rateLimitHits).values({ key: hashed });

  // Occasionally prune old rows to keep the table small.
  if (Math.random() < 0.02) {
    await db.delete(rateLimitHits).where(lt(rateLimitHits.createdAt, new Date(Date.now() - 2 * 86400_000)));
  }
  return true;
}

function hashKey(key: string) {
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? "arict"}:${key}`)
    .digest("hex")
    .slice(0, 64);
}

/** Best-effort client identifier from proxy headers (Vercel sets x-forwarded-for). */
export function clientKey(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}
