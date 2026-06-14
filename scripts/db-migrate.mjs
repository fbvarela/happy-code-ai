// Applies each SQL file in src/db/migrations in order, exactly once. Applied
// migrations are tracked in a `schema_migrations` table so re-running is a
// no-op (important: re-running constraint-narrowing migrations against newer
// data would fail). Usage: npm run db:migrate  (loads .env.local via --env-file)
import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run via `npm run db:migrate`.");
  process.exit(1);
}

// Migrations whose numeric prefix is <= this were applied before this runner
// started tracking. On a DB that predates tracking, they are marked applied
// (not re-run) during a one-time bootstrap. Newer migrations run normally.
const TRACKING_BASELINE = "004";

const sql = neon(url);

// neon() is a tagged-template fn; emulate a no-interpolation literal so we can
// run an arbitrary statement string.
function run(stmt) {
  return sql(Object.assign([stmt], { raw: [stmt] }));
}

function splitStatements(text) {
  return text
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
}

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "db", "migrations");
const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

// 1. Tracking table.
await run(`CREATE TABLE IF NOT EXISTS schema_migrations (
  filename   text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`);

const applied = new Set((await sql`SELECT filename FROM schema_migrations`).map((r) => r.filename));

// 2. One-time bootstrap: a DB that was migrated before tracking existed has the
//    schema but an empty tracking table. Mark the baseline (<= TRACKING_BASELINE)
//    as applied without re-running it.
if (applied.size === 0) {
  const schemaExists = (await sql`SELECT to_regclass('public.artifacts') AS t`)[0].t !== null;
  if (schemaExists) {
    for (const file of files) {
      if (file.split("_")[0] <= TRACKING_BASELINE) {
        await sql`INSERT INTO schema_migrations (filename) VALUES (${file}) ON CONFLICT DO NOTHING`;
        applied.add(file);
      }
    }
    console.log(`Bootstrapped tracking — marked ${applied.size} baseline migration(s) as applied.`);
  }
}

// 3. Apply each not-yet-applied migration, recording it on success.
let ran = 0;
let total = 0;
for (const file of files) {
  if (applied.has(file)) {
    console.log(`• ${file} (already applied)`);
    continue;
  }
  const statements = splitStatements(readFileSync(join(migrationsDir, file), "utf8"));
  for (const stmt of statements) {
    await run(stmt);
    total++;
  }
  await sql`INSERT INTO schema_migrations (filename) VALUES (${file}) ON CONFLICT DO NOTHING`;
  ran++;
  console.log(`✓ ${file} (${statements.length} statements)`);
}
console.log(`Migration complete — ${ran} new file(s), ${total} statements.`);
