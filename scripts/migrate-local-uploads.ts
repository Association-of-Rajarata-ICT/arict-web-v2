/**
 * One-time fix for images uploaded while the site stored files on local disk
 * (links like /uploads/media/<id>.jpg). Uploads each local file from
 * .data/uploads to Cloudinary and replaces its link everywhere in the database.
 *
 *   npx tsx scripts/migrate-local-uploads.ts           # dry run: shows what would change
 *   npx tsx scripts/migrate-local-uploads.ts --apply   # uploads and updates the database
 */
import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const APPLY = process.argv.includes("--apply");
const LOCAL_DIR = path.join(process.cwd(), ".data", "uploads");
const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

// Single-value text columns that can hold an image link.
const TEXT_COLUMNS: [table: string, column: string][] = [
  ["users", "image"],
  ["announcements", "image"],
  ["events", "cover_image"],
  ["event_images", "image_url"],
  ["team_members", "image"],
  ["projects", "cover_image"],
  ["project_images", "image_url"],
  ["project_submissions", "cover_image"],
];

function cloudinary() {
  const raw = (process.env.CLOUDINARY_URL ?? "").trim().replace(/^["']|["']$/g, "").replace(/^(CLOUDINARY_URL=)+/i, "");
  const u = new URL(raw);
  if (u.protocol !== "cloudinary:" || !u.username || !u.password || !u.hostname) throw new Error("CLOUDINARY_URL is not valid.");
  return { cloudName: u.hostname, apiKey: decodeURIComponent(u.username), apiSecret: decodeURIComponent(u.password) };
}

async function upload(localPath: string, cfg: ReturnType<typeof cloudinary>) {
  const rel = localPath.replace(/^\/uploads\//, "");
  if (rel.includes("..")) throw new Error("Invalid path");
  const folder = rel.startsWith("submissions/") ? "submissions" : "media";
  const ext = path.extname(rel).slice(1).toLowerCase();
  const bytes = await readFile(path.join(LOCAL_DIR, rel));
  const params = { public_id: `arict/${folder}/${randomUUID()}`, timestamp: String(Math.floor(Date.now() / 1000)) };
  const signature = createHash("sha1")
    .update(`public_id=${params.public_id}&timestamp=${params.timestamp}${cfg.apiSecret}`)
    .digest("hex");
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(bytes)], { type: TYPES[ext] ?? "application/octet-stream" }));
  form.append("api_key", cfg.apiKey);
  form.append("public_id", params.public_id);
  form.append("timestamp", params.timestamp);
  form.append("signature", signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cfg.cloudName)}/image/upload`, { method: "POST", body: form });
  const data = (await res.json()) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok || !data.secure_url) throw new Error(data.error?.message ?? `HTTP ${res.status}`);
  return data.secure_url;
}

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const cfg = cloudinary();
  const sql = postgres(url, { max: 1, prepare: false });

  try {
    // 1. Collect every /uploads/... link still in the database.
    const found = new Set<string>();
    for (const [table, column] of TEXT_COLUMNS) {
      const rows = await sql`select ${sql(column)} as v from ${sql(table)} where ${sql(column)} like '/uploads/%'`;
      rows.forEach((r) => found.add(r.v as string));
    }
    const shots = await sql`select unnest(screenshots) as v from project_submissions`;
    shots.filter((r) => String(r.v).startsWith("/uploads/")).forEach((r) => found.add(r.v as string));
    const settings = await sql`select value::text as v from site_settings`;
    settings.forEach((r) => (String(r.v).match(/\/uploads\/(?:media|submissions)\/[\w.-]+/g) ?? []).forEach((m) => found.add(m)));

    if (found.size === 0) {
      console.log("✓ No locally stored images are referenced in the database. Nothing to do.");
      return;
    }
    console.log(`Found ${found.size} locally stored image link(s):`);
    [...found].forEach((f) => console.log("  ", f));
    if (!APPLY) {
      console.log("\nDry run only. Re-run with --apply to upload them to Cloudinary and update the database.");
      return;
    }

    // 2. Upload each file to Cloudinary.
    const map = new Map<string, string>();
    for (const local of found) {
      try {
        const remote = await upload(local, cfg);
        map.set(local, remote);
        console.log(`  ↑ ${local}\n    → ${remote}`);
      } catch (error) {
        console.error(`  ✗ ${local}: ${error instanceof Error ? error.message : error}`);
      }
    }

    // 3. Replace the links everywhere, in one transaction.
    let updated = 0;
    await sql.begin(async (tx) => {
      for (const [local, remote] of map) {
        for (const [table, column] of TEXT_COLUMNS) {
          const r = await tx`update ${tx(table)} set ${tx(column)} = ${remote} where ${tx(column)} = ${local}`;
          updated += r.count;
        }
        const s = await tx`update project_submissions set screenshots = array_replace(screenshots, ${local}, ${remote}) where ${local} = any(screenshots)`;
        updated += s.count;
        const j = await tx`update site_settings set value = replace(value::text, ${local}, ${remote})::jsonb where value::text like ${"%" + local + "%"}`;
        updated += j.count;
      }
    });
    console.log(`\n✓ Uploaded ${map.size}/${found.size} image(s) and updated ${updated} database row(s).`);
    if (map.size < found.size) process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
});
