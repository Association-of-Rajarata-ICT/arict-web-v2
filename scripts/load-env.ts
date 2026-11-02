import { existsSync } from "node:fs";
import { config } from "dotenv";

/**
 * Loads environment variables for a script from `--env <file>` (or `--env=<file>`),
 * or from `.env` when no file is given. Values in the chosen file take priority.
 * Prints which file and database are being used, so it's always clear where a
 * script is about to make changes.
 */
export function loadEnv() {
  const args = process.argv.slice(2);
  const i = args.findIndex((a) => a === "--env" || a.startsWith("--env="));
  const file = i === -1 ? ".env" : args[i]!.includes("=") ? args[i]!.split("=")[1]! : args[i + 1];
  if (!file || !existsSync(file)) {
    throw new Error(`Env file not found: ${file ?? "(missing after --env)"}`);
  }
  config({ path: file, override: true, quiet: true });

  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  let host = "(DATABASE_URL not set)";
  try {
    if (url) host = new URL(url).hostname.split(".")[0]!;
  } catch {
    host = "(invalid DATABASE_URL)";
  }
  console.log(`Using ${file} → database ${host}`);
  return file;
}
