// Owner edits of stored report sections, with history and restore.
// Pure of Deno/Supabase imports: `service` is a supabase-js client (or a test double).
// Called only after the owner bridge has authenticated the request.

export class ReportEditError extends Error {
  constructor(code, status = 400, detail = code) {
    super(detail);
    this.code = code;
    this.status = status;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SECTIONS = 40;
const MAX_TITLE = 120;
const MAX_LINES = 80;
const MAX_LINE = 4000;
const MAX_NOTE = 200;
const DETAIL_SELECT = "id,mother_draft,paid_report";
const HISTORY_SELECT = "version,kind,note,restored_from,created_at";

const text = (value) => String(value ?? "").trim();
const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

function reportId(payload) {
  const id = text(payload?.id);
  if (!UUID.test(id)) throw new ReportEditError("INVALID_REPORT_ID", 400);
  return id.toLowerCase();
}

function fail(error, code) {
  if (error) throw new ReportEditError(code, 502, error.message);
}

/** The sections a report currently shows: the same precedence the owner console and legacy migration use. */
export function currentSections(row) {
  for (const source of [row?.mother_draft, row?.paid_report]) {
    if (!isObject(source)) continue;
    const candidate = source.reportSections ?? source.sections ?? source.ninePages;
    if (Array.isArray(candidate) && candidate.length) return candidate.map((item) => (isObject(item) ? { ...item } : {}));
  }
  return null;
}

function cleanBody(value) {
  if (!Array.isArray(value)) throw new ReportEditError("INVALID_SECTION_BODY", 400);
  if (value.length > MAX_LINES) throw new ReportEditError("SECTION_TOO_LONG", 400);
  const lines = value.map((line) => String(line ?? "").replace(/\r\n?/g, "\n").trim()).filter(Boolean);
  if (lines.some((line) => line.length > MAX_LINE)) throw new ReportEditError("SECTION_LINE_TOO_LONG", 400);
  return lines;
}

/**
 * Applies `[{ index, title?, body }]` onto the current sections. Only title and body can change;
 * keys, numbering, evidence and the chart itself are never touched.
 */
export function applySectionEdits(sections, edits) {
  if (!Array.isArray(edits) || !edits.length || edits.length > MAX_SECTIONS) throw new ReportEditError("INVALID_EDITS", 400);
  const next = sections.map((section) => ({ ...section }));
  const seen = new Set();
  for (const edit of edits) {
    const index = Number(edit?.index);
    if (!Number.isInteger(index) || index < 0 || index >= next.length || seen.has(index)) throw new ReportEditError("INVALID_SECTION_INDEX", 400);
    seen.add(index);
    const target = next[index];
    if (edit.title !== undefined) {
      const title = text(edit.title);
      if (!title || title.length > MAX_TITLE) throw new ReportEditError("INVALID_SECTION_TITLE", 400);
      target.title = title;
    }
    if (edit.body !== undefined) target.body = cleanBody(edit.body);
  }
  return next;
}

export function sectionsToText(sections) {
  return sections
    .map((section) => [text(section.title), ...(Array.isArray(section.body) ? section.body : [])].filter(Boolean).join("\n\n"))
    .filter(Boolean)
    .join("\n\n");
}

async function loadReport(service, id) {
  const { data, error } = await service.from("report_requests").select(DETAIL_SELECT).eq("id", id).maybeSingle();
  fail(error, "REPORT_READ_FAILED");
  if (!data) throw new ReportEditError("REPORT_NOT_FOUND", 404);
  return data;
}

async function latestVersion(service, id) {
  const { data, error } = await service
    .from("report_section_edits")
    .select("version")
    .eq("report_id", id)
    .order("version", { ascending: false })
    .limit(1);
  fail(error, "HISTORY_READ_FAILED");
  return data?.length ? Number(data[0].version) : -1;
}

async function insertVersion(service, id, version, fields) {
  const { error } = await service.from("report_section_edits").insert({ report_id: id, version, ...fields });
  if (error?.code === "23505") throw new ReportEditError("EDIT_CONFLICT", 409);
  fail(error, "HISTORY_WRITE_FAILED");
}

/** Writes the sections to every place the console and the legacy readers look, and flags the row as owner-edited. */
async function writeSections(service, row, sections) {
  const motherDraft = { ...(isObject(row.mother_draft) ? row.mother_draft : {}), reportSections: sections, ninePages: sections, ownerEdited: true };
  const patch = { mother_draft: motherDraft, updated_at: new Date().toISOString() };
  if (isObject(row.paid_report)) patch.paid_report = { ...row.paid_report, reportSections: sections, text: sectionsToText(sections) };
  const { error } = await service.from("report_requests").update(patch).eq("id", row.id);
  fail(error, "REPORT_WRITE_FAILED");
}

/** First change to a report: keep the untouched original as version 0 so it can always be restored. */
async function ensureOriginal(service, id, sections) {
  const latest = await latestVersion(service, id);
  if (latest >= 0) return latest;
  await insertVersion(service, id, 0, { kind: "original", sections, note: "原始版本" });
  return 0;
}

export async function reportEdit(service, payload) {
  const id = reportId(payload);
  const row = await loadReport(service, id);
  const before = currentSections(row);
  if (!before) throw new ReportEditError("NO_STORED_SECTIONS", 409);
  const after = applySectionEdits(before, payload.edits);
  const latest = await ensureOriginal(service, id, before);
  const version = latest + 1;
  await insertVersion(service, id, version, { kind: "edit", sections: after, note: text(payload.note).slice(0, MAX_NOTE) });
  await writeSections(service, row, after);
  return { ok: true, version, sections: after };
}

export async function reportHistory(service, payload) {
  const id = reportId(payload);
  const { data, error } = await service
    .from("report_section_edits")
    .select(HISTORY_SELECT)
    .eq("report_id", id)
    .order("version", { ascending: false });
  fail(error, "HISTORY_READ_FAILED");
  return { ok: true, items: data ?? [] };
}

export async function reportRestore(service, payload) {
  const id = reportId(payload);
  const target = Number(payload?.version);
  if (!Number.isInteger(target) || target < 0) throw new ReportEditError("INVALID_VERSION", 400);
  const row = await loadReport(service, id);
  const { data, error } = await service
    .from("report_section_edits")
    .select("sections")
    .eq("report_id", id)
    .eq("version", target)
    .maybeSingle();
  fail(error, "HISTORY_READ_FAILED");
  if (!data || !Array.isArray(data.sections) || !data.sections.length) throw new ReportEditError("VERSION_NOT_FOUND", 404);
  const latest = await latestVersion(service, id);
  const version = latest + 1;
  await insertVersion(service, id, version, {
    kind: "restore",
    sections: data.sections,
    restored_from: target,
    note: target === 0 ? "還原成原始版本" : `還原到第 ${target} 版`,
  });
  await writeSections(service, row, data.sections);
  return { ok: true, version, sections: data.sections };
}
