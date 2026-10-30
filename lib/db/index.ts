import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { arictDb?: Database };

function createDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon (Vercel Marketplace) connection string to .env.",
    );
  }
  const client = postgres(url, {
    // Neon's pooled endpoint (PgBouncer) does not support prepared statements.
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 5 : 10,
    idle_timeout: 20,
    connect_timeout: 15,
  });
  return drizzle(client, { schema });
}

function getDb() {
  globalForDb.arictDb ??= createDb();
  return globalForDb.arictDb;
}

/** Lazily connects on first use so importing this module never requires DATABASE_URL. */
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
