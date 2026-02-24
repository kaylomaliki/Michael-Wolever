/**
 * One-time migration: convert project "title" from string to portable text (one block)
 * so existing content is preserved after changing the schema to block content.
 *
 * Run from project root (with env vars set):
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' sanity/scripts/migrate-project-titles-to-blocks.ts
 *
 * Or with dotenv:
 *   node -r dotenv/config -r ts-node/register sanity/scripts/migrate-project-titles-to-blocks.ts
 */

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID");
  process.exit(1);
}
if (!token) {
  console.error("Set SANITY_API_WRITE_TOKEN for write access (create in sanity.io manage)");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

function randomKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function stringToBlockContent(text: string): { _type: string; _key: string; children: { _type: string; _key: string; text: string; marks: string[] }[]; markDefs: unknown[] } {
  return {
    _type: "block",
    _key: randomKey(),
    children: [
      {
        _type: "span",
        _key: randomKey(),
        text,
        marks: [],
      },
    ],
    markDefs: [],
  };
}

async function run() {
  const docs = await client.fetch<{ _id: string; title: unknown }[]>(
    `*[_type == "project"]{ _id, title }`
  );
  let migrated = 0;
  for (const doc of docs) {
    if (typeof doc.title !== "string") continue;
    const blockTitle = [stringToBlockContent(doc.title)];
    await client.patch(doc._id).set({ title: blockTitle }).commit();
    console.log(`Migrated project ${doc._id}: string title -> 1 block`);
    migrated++;
  }
  console.log(`Done. Migrated ${migrated} project(s).`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
