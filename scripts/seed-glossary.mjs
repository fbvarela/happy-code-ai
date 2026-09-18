// One-off: (re)generate the baseline glossary definitions with Agnes 2.0 and
// print them. The committed definitions in src/lib/glossary.js are the source
// of truth at render time (0 runtime tokens); run this only when curating the
// seed.
//
//   npm run glossary:seed            # generate for every seed term
//   npm run glossary:seed -- mcp rag # only these ids
//
// It does NOT write the file automatically — review the output and paste the
// definitions you want into src/lib/glossary.js.
//
// Uses the same Agnes gateway/model as the runtime generator (src/lib/agnes.js),
// so there is no extra provider or key to maintain.
import { generateObject } from "ai";
import { z } from "zod";
import { GLOSSARY_SEED, GLOSSARY_CATEGORY_IDS } from "../src/lib/glossary.js";
import { isAgnesConfigured, getAgnesModel } from "../src/lib/agnes.js";

if (!isAgnesConfigured()) {
  console.error("AGNES_API_KEY is not set. Run via `npm run glossary:seed` (loads .env.local).");
  process.exit(1);
}

const schema = z.object({
  definition: z.string(),
  category: z.enum(GLOSSARY_CATEGORY_IDS).default("concept"),
  links: z.array(z.object({ label: z.string(), url: z.string().url() })).max(3).default([]),
});

const model = getAgnesModel(); // honors AGNES_MODEL, else agnes-2.0-flash
const onlyIds = process.argv.slice(2);
const targets = onlyIds.length ? GLOSSARY_SEED.filter((e) => onlyIds.includes(e.id)) : GLOSSARY_SEED;

for (const entry of targets) {
  try {
    const { object } = await generateObject({
      model,
      schema,
      messages: [
        {
          role: "system",
          content:
            "Escribes entradas de glosario sobre términos de IA y de agentes de programación. " +
            "Sé preciso y neutral, en español, en 2-3 frases. Incluye solo enlaces oficiales.",
        },
        { role: "user", content: `Define el término: ${entry.term}` },
      ],
    });
    console.log(`\n## ${entry.id} — ${entry.term}`);
    console.log(object.definition);
    if (object.links?.length) console.log("links:", JSON.stringify(object.links));
  } catch (err) {
    // One flaky response shouldn't kill a long curation run.
    console.error(`\n## ${entry.id} — ${entry.term}\nFAILED: ${err.message || err}`);
  }
}
