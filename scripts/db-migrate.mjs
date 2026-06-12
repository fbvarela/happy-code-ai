// Runs every SQL file in src/db/migrations in order, statement by statement.
// Usage: npm run db:migrate   (loads .env.local via --env-file)
import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run via `npm run db:migrate`.");
  process.exit(1);
}

const sql = neon(url);
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "db", "migrations");
const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

let total = 0;
for (const file of files) {
  const text = readFileSync(join(migrationsDir, file), "utf8");
  // Neon's HTTP driver runs one statement per call; split on top-level `;`.
  const statements = text
    .split(/;\s*(?:\r?\n|$)/)
    // Strip full-line SQL comments, then trim; keep only non-empty statements.
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
  for (const stmt of statements) {
    // neon() is a tagged-template fn; emulate a no-interpolation literal.
    const literal = Object.assign([stmt], { raw: [stmt] });
    await sql(literal);
    total++;
  }
  console.log(`✓ ${file} (${statements.length} statements)`);
}
console.log(`Migration complete — ${total} statements across ${files.length} file(s).`);
