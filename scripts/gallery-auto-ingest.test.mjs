import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("GPT gallery auto-ingest is wired through Vercel and Supabase", async () => {
  const [vercel, fn, migration] = await Promise.all([
    read("vercel.json"),
    read("supabase/functions/gallery-ingest-finalize/index.ts"),
    read("supabase/migrations/20260827195500_add_gallery_ingest_queue.sql"),
  ]);

  const config = JSON.parse(vercel);
  assert.equal(config.rewrites[0].source, "/api/gallery-ingest-finalize");
  assert.match(config.rewrites[0].destination, /gallery-ingest-finalize$/);
  assert.match(fn, /claim_gallery_ingest_queue/);
  assert.match(fn, /zhaowu-gallery/);
  assert.match(fn, /10 \* 1024 \* 1024/);
  assert.match(migration, /gallery_ingest_queue/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /grant execute on function public\.claim_gallery_ingest_queue\(\) to service_role/);
});
