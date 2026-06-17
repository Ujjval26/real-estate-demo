/**
 * Push the SQL schema (prisma/schema.sql) directly to Turso via the libSQL
 * client. This is the libSQL equivalent of `prisma db push`.
 *
 * Run with:  bun run scripts/push-schema.ts
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error(
    "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment variables.",
  );
  process.exit(1);
}

const client = createClient({ url, authToken });

const schemaPath = join(process.cwd(), "prisma", "schema.sql");
const sql = readFileSync(schemaPath, "utf-8");

/**
 * Strip SQL line comments (dash dash to end of line) and split into
 * statements on semicolons. Naive but fine for our hand-written schema.
 */
function parseStatements(sql: string): string[] {
  const noComments = sql
    .split("\n")
    .map((line) => {
      const dashIdx = line.indexOf("--");
      // Only strip if `--` is not inside a string literal — for our schema
      // there are no `--` inside strings, so this is safe.
      if (dashIdx >= 0) return line.slice(0, dashIdx);
      return line;
    })
    .join("\n");

  return noComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const statements = parseStatements(sql);

async function main() {
  console.log(`Applying ${statements.length} statements to Turso…`);
  for (const [i, stmt] of statements.entries()) {
    const preview = stmt.replace(/\s+/g, " ").slice(0, 70);
    try {
      await client.execute(stmt);
      console.log(`  [${i + 1}/${statements.length}] OK  ${preview}`);
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "";
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate column")
      ) {
        console.log(`  [${i + 1}/${statements.length}] SKIP (exists)  ${preview}`);
        continue;
      }
      console.error(`  [${i + 1}/${statements.length}] FAIL  ${preview}`);
      console.error("    →", msg);
      throw err;
    }
  }
  console.log("\n✅ Schema applied successfully.");

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  );
  console.log(
    "Tables in database:",
    tables.rows.map((r) => r.name).join(", "),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
