/**
 * Applies pending SQL migrations from ./drizzle.
 * Uses the unpooled connection when available (recommended for Neon).
 *
 *   npm run db:migrate
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const client = postgres(url, { max: 1, prepare: false });
  try {
    await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
    console.log("✓ Migrations applied");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void main();
