/**
 * Creates (or resets) a Super Admin account without touching any other data.
 * Safe to run against production.
 *
 *   SEED_ADMIN_EMAIL=you@arict.lk SEED_ADMIN_PASSWORD='a-long-password' npm run db:create-admin
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../lib/db/schema";

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!url) throw new Error("DATABASE_URL is not set.");
  if (!email || !password) throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.");
  if (password.length < 10) throw new Error("Use a password of at least 10 characters.");

  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client, { schema });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const updated = await db
      .update(schema.users)
      .set({ passwordHash, role: "super_admin", active: true })
      .where(sql`lower(${schema.users.email}) = ${email}`)
      .returning({ id: schema.users.id });
    if (updated.length === 0) {
      await db.insert(schema.users).values({ name: "ARICT Admin", email, role: "super_admin", passwordHash });
      console.log(`✓ Created Super Admin ${email}`);
    } else {
      console.log(`✓ Reset Super Admin ${email}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
