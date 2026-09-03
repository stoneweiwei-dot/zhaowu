import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const client = readFileSync("src/lib/report/classic-passage.ts", "utf8");
const component = readFileSync("src/components/paid-report-pages.tsx", "utf8");
const activation = readFileSync("supabase/migrations/20260904053000_activate_supabase_directives_runtime.sql", "utf8");
const library = readFileSync("supabase/migrations/20260903213000_create_classic_passage_library.sql", "utf8");

test("verified classic passage library is wired into the continuous report without reviving legacy report pages", () => {
  assert.match(client, /rpc\/get_customer_classic_passage/);
  assert.match(client, /locale === "en"/);
  assert.match(component, /ClassicPassageLine/);
  assert.match(component, /content\.summary\.map/);
  assert.match(activation, /continuous_summary_body/);
  assert.match(activation, /legacy_nine_page_architecture', false/);
  assert.doesNotMatch(activation, /nine_page_only/);
});

test("customer RPC exposes only one verified direct-quote match and keeps base tables private", () => {
  assert.match(library, /verification_status = 'verified'/);
  assert.match(library, /p\.is_direct_quote = true/);
  assert.match(activation, /grant execute on function public\.get_customer_classic_passage\(jsonb\) to anon, authenticated, service_role/);
  assert.doesNotMatch(activation, /grant select on public\.classic_passages to anon/);
  assert.doesNotMatch(activation, /grant select on public\.classic_sources to anon/);
});
