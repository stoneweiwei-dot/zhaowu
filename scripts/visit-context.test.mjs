import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { visitContext } from "../src/lib/visit-context.ts";

test("visit metadata contains only the entry path, referring origin and device class", () => {
  assert.deepEqual(visitContext("/report?key=test#token", "https://example:password@example.test/private?q=x", "iPhone Mobile", 1),
    { p_path: "/report", p_referrer: "https://example.test", p_device: "mobile" });
  for (const [agent, points, device] of [["Macintosh", 5, "tablet"], ["Windows", 0, "desktop"], ["", 0, "unknown"]]) {
    const ctx = visitContext("/".repeat(700), "data:text/plain,example", agent, points);
    assert.equal(ctx.p_referrer, null);
    assert.equal(ctx.p_path.length, 512);
    assert.equal(ctx.p_device, device);
  }
});

test("new invoker overload inserts only once and leaves counter trigger and old RPC intact", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261128090000_visit_entry_context.sql", import.meta.url), "utf8");
  assert.match(sql, /security invoker/i);
  assert.match(sql, /on conflict do nothing/i);
  assert.doesNotMatch(sql, /drop function|create trigger|update public.site_settings/i);
});
