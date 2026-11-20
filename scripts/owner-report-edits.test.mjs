import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  ReportEditError,
  applySectionEdits,
  currentSections,
  reportEdit,
  reportHistory,
  reportRestore,
  sectionsToText,
} from "../supabase/functions/zhaowu-owner-data/report-edits.mjs";

const ID = "11111111-1111-4111-8111-111111111111";

// Minimal in-memory stand-in for the two tables the module touches.
function fakeService({ report, edits = [] } = {}) {
  const tables = { report_requests: report ? [{ ...report }] : [], report_section_edits: edits.map((row) => ({ ...row })) };
  return {
    tables,
    from(name) {
      const rows = tables[name];
      const state = { filters: [], order: null, limit: null, patch: null, insert: null };
      const run = () => {
        let result = rows.filter((row) => state.filters.every(([key, value]) => row[key] === value));
        if (state.order) result = [...result].sort((a, b) => (state.order.asc ? 1 : -1) * (a[state.order.key] - b[state.order.key]));
        if (state.limit != null) result = result.slice(0, state.limit);
        return result;
      };
      const builder = {
        select() { return builder; },
        eq(key, value) { state.filters.push([key, value]); return builder; },
        order(key, { ascending } = {}) { state.order = { key, asc: ascending !== false }; return builder; },
        limit(n) { state.limit = n; return builder; },
        update(patch) { state.patch = patch; return builder; },
        insert(row) {
          state.insert = row;
          if (name === "report_section_edits" && rows.some((r) => r.report_id === row.report_id && r.version === row.version)) {
            return Promise.resolve({ error: { code: "23505", message: "duplicate" } });
          }
          rows.push({ ...row, created_at: new Date(rows.length).toISOString() });
          return Promise.resolve({ error: null });
        },
        maybeSingle() { return Promise.resolve({ data: run()[0] ?? null, error: null }); },
        then(resolve) {
          if (state.patch) {
            for (const row of run()) Object.assign(row, state.patch);
            return resolve({ error: null });
          }
          return resolve({ data: run(), error: null });
        },
      };
      return builder;
    },
  };
}

const sections = () => [
  { sectionNo: 1, key: "a", title: "第一章", body: ["甲", "乙"], evidence: { facts: ["f"] } },
  { sectionNo: 2, key: "b", title: "第二章", body: ["丙"], evidence: { facts: [] } },
];
const report = (extra = {}) => ({
  id: ID,
  mother_draft: { reportSections: sections(), ninePages: sections(), keep: "yes" },
  paid_report: { text: "old", reportSections: sections() },
  engine_snapshot: { chart: { dayMaster: "甲" } },
  ...extra,
});

test("applySectionEdits changes only title and body and never mutates the input", () => {
  const input = sections();
  const out = applySectionEdits(input, [{ index: 1, title: "新標題", body: ["  新內容  ", "", "第二段"] }]);
  assert.equal(out[1].title, "新標題");
  assert.deepEqual(out[1].body, ["新內容", "第二段"]);
  assert.equal(out[1].key, "b");
  assert.deepEqual(out[1].evidence, { facts: [] });
  assert.deepEqual(out[0], input[0]);
  assert.equal(input[1].title, "第二章");
});

test("applySectionEdits rejects bad indexes, duplicates, empty titles and oversized text", () => {
  assert.throws(() => applySectionEdits(sections(), []), { code: "INVALID_EDITS" });
  assert.throws(() => applySectionEdits(sections(), [{ index: 5, body: ["x"] }]), { code: "INVALID_SECTION_INDEX" });
  assert.throws(() => applySectionEdits(sections(), [{ index: 0, body: ["x"] }, { index: 0, body: ["y"] }]), { code: "INVALID_SECTION_INDEX" });
  assert.throws(() => applySectionEdits(sections(), [{ index: 0, title: "  " }]), { code: "INVALID_SECTION_TITLE" });
  assert.throws(() => applySectionEdits(sections(), [{ index: 0, body: ["x".repeat(4001)] }]), { code: "SECTION_LINE_TOO_LONG" });
  assert.throws(() => applySectionEdits(sections(), [{ index: 0, body: "not an array" }]), { code: "INVALID_SECTION_BODY" });
});

test("currentSections prefers mother_draft, falls back to paid_report, and is null when nothing is stored", () => {
  assert.equal(currentSections({ mother_draft: { reportSections: sections() } }).length, 2);
  assert.equal(currentSections({ mother_draft: null, paid_report: { sections: sections() } }).length, 2);
  assert.equal(currentSections({ mother_draft: {}, paid_report: null }), null);
});

test("first edit keeps the original as version 0 and writes the edit everywhere readers look", async () => {
  const service = fakeService({ report: report() });
  const result = await reportEdit(service, { id: ID, edits: [{ index: 0, body: ["改過"] }], note: "校字" });
  assert.equal(result.version, 1);
  const history = service.tables.report_section_edits;
  assert.deepEqual(history.map((row) => [row.version, row.kind]), [[0, "original"], [1, "edit"]]);
  assert.deepEqual(history[0].sections[0].body, ["甲", "乙"], "original text is preserved untouched");
  assert.equal(history[1].note, "校字");
  const row = service.tables.report_requests[0];
  assert.deepEqual(row.mother_draft.reportSections[0].body, ["改過"]);
  assert.deepEqual(row.mother_draft.ninePages[0].body, ["改過"]);
  assert.equal(row.mother_draft.ownerEdited, true);
  assert.equal(row.mother_draft.keep, "yes", "unrelated mother_draft fields survive");
  assert.deepEqual(row.paid_report.reportSections[0].body, ["改過"]);
  assert.match(row.paid_report.text, /改過/);
  assert.deepEqual(row.engine_snapshot, { chart: { dayMaster: "甲" } }, "the chart itself is never edited");
});

test("a second edit does not create another original and numbers versions upward", async () => {
  const service = fakeService({ report: report() });
  await reportEdit(service, { id: ID, edits: [{ index: 0, body: ["一"] }] });
  const second = await reportEdit(service, { id: ID, edits: [{ index: 1, body: ["二"] }] });
  assert.equal(second.version, 2);
  assert.deepEqual(service.tables.report_section_edits.map((row) => row.version), [0, 1, 2]);
  assert.equal(service.tables.report_section_edits.filter((row) => row.kind === "original").length, 1);
});

test("history lists newest first without the heavy section snapshots", async () => {
  const service = fakeService({ report: report() });
  await reportEdit(service, { id: ID, edits: [{ index: 0, body: ["一"] }] });
  await reportEdit(service, { id: ID, edits: [{ index: 0, body: ["二"] }] });
  const { items } = await reportHistory(service, { id: ID });
  assert.deepEqual(items.map((item) => item.version), [2, 1, 0]);
});

test("restore returns any version, including the original, and is itself recorded", async () => {
  const service = fakeService({ report: report() });
  await reportEdit(service, { id: ID, edits: [{ index: 0, body: ["改過"] }] });
  const restored = await reportRestore(service, { id: ID, version: 0 });
  assert.equal(restored.version, 2);
  const row = service.tables.report_requests[0];
  assert.deepEqual(row.mother_draft.reportSections[0].body, ["甲", "乙"]);
  const last = service.tables.report_section_edits.at(-1);
  assert.equal(last.kind, "restore");
  assert.equal(last.restored_from, 0);
  assert.equal(service.tables.report_section_edits.length, 3, "restoring never deletes history");
  await assert.rejects(() => reportRestore(service, { id: ID, version: 99 }), { code: "VERSION_NOT_FOUND" });
});

test("edit refuses unknown reports, reports without stored sections, and malformed ids", async () => {
  await assert.rejects(() => reportEdit(fakeService(), { id: ID, edits: [{ index: 0, body: ["x"] }] }), { code: "REPORT_NOT_FOUND" });
  const empty = fakeService({ report: report({ mother_draft: null, paid_report: null }) });
  await assert.rejects(() => reportEdit(empty, { id: ID, edits: [{ index: 0, body: ["x"] }] }), { code: "NO_STORED_SECTIONS" });
  await assert.rejects(() => reportEdit(fakeService({ report: report() }), { id: "nope", edits: [] }), (error) => error instanceof ReportEditError && error.code === "INVALID_REPORT_ID");
});

test("sectionsToText joins titles and paragraphs", () => {
  assert.equal(sectionsToText([{ title: "T", body: ["a", "b"] }]), "T\n\na\n\nb");
});

test("wiring: the actions are whitelisted on both sides and the legacy upgrade cannot overwrite owner edits", async () => {
  const [edge, api, rest, migration] = await Promise.all([
    readFile(new URL("../supabase/functions/zhaowu-owner-data/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../api/owner-data.js", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/supabase-rest.ts", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/20261024000000_report_section_edits.sql", import.meta.url), "utf8"),
  ]);
  for (const action of ["report.edit", "report.history", "report.restore"]) {
    assert.match(edge, new RegExp(`"${action.replace(".", "\\.")}",`), `${action} allowed in the Edge Function`);
    assert.match(edge, new RegExp(`case "${action.replace(".", "\\.")}"`), `${action} dispatched`);
    assert.match(api, new RegExp(`"${action.replace(".", "\\.")}",`), `${action} allowed in api/owner-data.js`);
  }
  assert.doesNotMatch(edge, /SECRET_ONLY_ACTIONS = new Set\([^)]*report\./, "Face ID sessions may edit reports");
  assert.match(rest, /ownerEdited/);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /revoke all privileges on table public\.report_section_edits from anon, authenticated/);
});
