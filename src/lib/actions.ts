import { supabase } from "@/lib/supabase";
import { FEATURED_CITIES, filterFeatured } from "@/lib/bazi/cities";
import { buildChart, currentAlmanac } from "@/lib/bazi/chart";
import { classifyQuestion, composeFullReport, interpret } from "@/lib/bazi/interpret";
import { buildPalm } from "@/lib/palm/engine";
import { routeMethods } from "@/lib/core/method";
import { composeNinePages } from "@/lib/report/nine-page";
import type { AnalysisResult, AnalyzeInput, CityHit, SavedReport } from "@/lib/bazi/types";

export type UsageSummary = {
  usageDate: string;
  questionCount: number;
  reportCount: number;
  questionRemaining: number;
  reportRemaining: number;
  owner?: boolean;
};

export type ReportRow = {
  id: string;
  public_code: string | null;
  user_id: string | null;
  user_email: string | null;
  owner_archive_id: string | null;
  alias: string | null;
  record_kind: string;
  status: string;
  access_mode: string;
  payment_tier: string | null;
  payment_status: string;
  context: Record<string, unknown> | null;
  engine_snapshot: AnalysisResult | null;
  mother_draft: unknown;
  paid_report: unknown;
  image_path: string | null;
  created_at: string;
  updated_at: string;
};

function newId(): string {
  return crypto.randomUUID();
}

function isCity(value: unknown): value is CityHit {
  if (!value || typeof value !== "object") return false;
  const c = value as CityHit;
  return typeof c.name === "string" && typeof c.display === "string" && typeof c.timezone === "string" && Number.isFinite(c.latitude) && Number.isFinite(c.longitude);
}

function parseInput(raw: AnalyzeInput): AnalyzeInput {
  if (!raw.question?.trim()) throw new Error("請先寫下你真正想問的問題。");
  const year = Number(raw.year);
  const month = Number(raw.month);
  const day = Number(raw.day);
  const hour = Number(raw.hour);
  const minute = Number.isFinite(Number(raw.minute)) ? Math.round(Number(raw.minute)) : 0;
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) throw new Error("請分別填寫出生年、月、日。");
  if (year < 1900 || year > 2100 || month < 1 || month > 12) throw new Error("出生日期不正確，請檢查年、月、日。");
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > lastDay) throw new Error("出生日期不正確，請檢查年、月、日。");
  if (!isCity(raw.city)) throw new Error("請選擇出生城市與國家。");
  if (!raw.timeUnknown && (!Number.isInteger(hour) || hour < 0 || hour > 23 || minute < 0 || minute > 59)) throw new Error("出生時間請使用 24 小時格式。");
  return {
    ...raw,
    year,
    month,
    day,
    hour: raw.timeUnknown ? 12 : hour,
    minute: raw.timeUnknown ? 0 : minute,
    question: raw.question.trim().slice(0, 400),
    liveCity: raw.liveCity && isCity(raw.liveCity) ? raw.liveCity : null,
    relation: raw.relation === "hetero" || raw.relation === "same" || raw.relation === "any" ? raw.relation : "unset",
  };
}

function sydneyDate(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const m = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${m.year}-${m.month}-${m.day}`;
}

function guestUsage(kind?: "question" | "report"): UsageSummary {
  const day = sydneyDate();
  const key = `zhaowu.daily.${day}`;
  let value = { questionCount: 0, reportCount: 0 };
  try {
    const raw = localStorage.getItem(key);
    if (raw) value = { ...value, ...JSON.parse(raw) };
  } catch {
    /* local fallback only */
  }
  if (kind === "question") {
    if (value.questionCount >= 2) throw new Error("QUESTION_LIMIT");
    value.questionCount += 1;
  }
  if (kind === "report") {
    if (value.reportCount >= 1) throw new Error("REPORT_LIMIT");
    value.reportCount += 1;
  }
  if (kind) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  }
  return {
    usageDate: day,
    questionCount: value.questionCount,
    reportCount: value.reportCount,
    questionRemaining: Math.max(0, 2 - value.questionCount),
    reportRemaining: Math.max(0, 1 - value.reportCount),
  };
}

async function isOwnerUser(userId: string): Promise<boolean> {
  const { data } = await supabase.from("profiles").select("is_owner").eq("id", userId).maybeSingle();
  return Boolean(data?.is_owner);
}

async function consumeAccess(kind: "question" | "report"): Promise<UsageSummary> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return guestUsage(kind);
  if (await isOwnerUser(user.id)) {
    return { usageDate: sydneyDate(), questionCount: 0, reportCount: 0, questionRemaining: 99, reportRemaining: 99, owner: true };
  }
  const { data, error } = await supabase.rpc("zhaowu_consume_usage", { kind });
  if (error) {
    if (error.message.includes("QUESTION_LIMIT")) throw new Error("QUESTION_LIMIT");
    if (error.message.includes("REPORT_LIMIT")) throw new Error("REPORT_LIMIT");
    throw error;
  }
  return data as UsageSummary;
}

export async function consumeQuestionAccess() {
  return consumeAccess("question");
}

export async function consumeReportAccess() {
  return consumeAccess("report");
}

export async function getUsageSummary(): Promise<UsageSummary> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return guestUsage();
  if (await isOwnerUser(user.id)) return { usageDate: sydneyDate(), questionCount: 0, reportCount: 0, questionRemaining: 99, reportRemaining: 99, owner: true };
  const day = sydneyDate();
  const { data } = await supabase.from("daily_usage").select("question_count,report_count").eq("user_id", user.id).eq("usage_date", day).maybeSingle();
  const q = Number(data?.question_count ?? 0);
  const r = Number(data?.report_count ?? 0);
  return { usageDate: day, questionCount: q, reportCount: r, questionRemaining: Math.max(0, 2 - q), reportRemaining: Math.max(0, 1 - r) };
}

export async function getAlmanac() {
  return currentAlmanac(new Date());
}

export async function searchCities({ data: q }: { data: string } | string): Promise<CityHit[]> {
  const query = typeof q === "string" ? q : q;
  const text = String(query ?? "").trim().slice(0, 40);
  const local = filterFeatured(text);
  if (!text || text.length < 2) return local;
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=6&language=zh`;
    const res = await fetch(url);
    if (!res.ok) return local;
    const body = (await res.json()) as { results?: { name: string; country?: string; admin1?: string; latitude: number; longitude: number; timezone?: string }[] };
    const remote: CityHit[] = (body.results ?? []).map((r) => ({
      name: r.name,
      country: r.country ?? "",
      display: [r.name, r.admin1, r.country].filter(Boolean).join("，"),
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone || "UTC",
    }));
    const seen = new Set<string>();
    return [...local, ...remote].filter((item) => {
      const key = `${item.display}-${item.latitude.toFixed(2)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);
  } catch {
    return local.length ? local : FEATURED_CITIES.slice(0, 6);
  }
}

export async function analyzeLife({ data: raw }: { data: AnalyzeInput }): Promise<AnalysisResult> {
  const input = parseInput(raw);
  const chart = buildChart(input);
  const palm = buildPalm({ year: input.year, month: input.month, day: input.day, hour: input.hour, timeUnknown: input.timeUnknown, gender: input.gender });
  const kind = classifyQuestion(input.question);
  const methodProtocol = routeMethods(kind, { palmReady: palm.ready, palmMissing: palm.missing });
  const reading = interpret(input.question, chart, input.relation, palm);
  return { id: newId(), question: input.question, chart, reading, createdAt: new Date().toISOString(), methodProtocol, palm };
}

export async function writeFullReport({ data }: { data: { question: string; chart: AnalysisResult["chart"]; reading: AnalysisResult["reading"]; palm?: AnalysisResult["palm"] } }) {
  const text = composeFullReport(data.question, data.chart, data.reading, data.palm ?? null);
  return { text, source: "rule" as const };
}

export async function saveBirthProfile(input: AnalyzeInput) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  const { question: _question, ...birthData } = input;
  const { error } = await supabase.from("profiles").update({ birth_data: birthData }).eq("id", auth.user.id);
  if (error) throw error;
}

export async function saveReport({ data }: { data: { result: AnalysisResult; fullReport?: string | null; input?: AnalyzeInput | null } }) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Unauthorized");
  const result = data.result;
  const ninePages = composeNinePages(result);
  const birthData = data.input ? (({ question: _q, ...rest }) => rest)(data.input) : null;
  const paidReport = data.fullReport ? { version: "ZW-FULL-1.0", fullReport: data.fullReport, ninePages } : null;
  const { data: row, error } = await supabase
    .from("report_requests")
    .insert({
      id: result.id,
      public_code: `ZW-${result.id.slice(0, 8).toUpperCase()}`,
      user_id: auth.user.id,
      user_email: auth.user.email ?? null,
      record_kind: "customer",
      status: "ready",
      access_mode: "daily_free",
      free_access_date: sydneyDate(),
      payment_status: "unpaid",
      context: { question: result.question, cityLabel: result.chart.cityLabel, birthData },
      engine_snapshot: result,
      mother_draft: ninePages,
      paid_report: paidReport,
      evidence_trace: { version: "ZW-NINE-1.0", usefulProvisional: result.chart.usefulProvisional },
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: row.id as string };
}

const reportSelect = "id,public_code,user_id,user_email,owner_archive_id,alias,record_kind,status,access_mode,payment_tier,payment_status,context,engine_snapshot,mother_draft,paid_report,image_path,created_at,updated_at";

export async function listReports(): Promise<SavedReport[]> {
  const { data, error } = await supabase.from("report_requests").select(reportSelect).order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as ReportRow[]).map((r) => ({
    id: r.id,
    question: String(r.context?.question ?? r.engine_snapshot?.question ?? "昭梧报告"),
    cityLabel: String(r.context?.cityLabel ?? r.engine_snapshot?.chart?.cityLabel ?? ""),
    dayMaster: String(r.engine_snapshot?.chart?.dayMaster ?? ""),
    ganZhiLine: r.engine_snapshot?.chart?.pillars?.map((p) => p.ganZhi).join(" ") ?? "",
    createdAt: r.created_at,
    hasFullReport: Boolean(r.paid_report),
  }));
}

export async function loadReport({ data: id }: { data: string }): Promise<ReportRow> {
  const { data, error } = await supabase.from("report_requests").select(reportSelect).eq("id", id).single();
  if (error) throw error;
  return data as unknown as ReportRow;
}

export async function deleteReport({ data: id }: { data: string }) {
  const { error } = await supabase.from("report_requests").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}

export async function listOwnerReports(): Promise<ReportRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user || !(await isOwnerUser(auth.user.id))) throw new Error("OWNER_REQUIRED");
  const { data, error } = await supabase.from("report_requests").select(reportSelect).order("updated_at", { ascending: false });
  if (error) throw error;
  return data as unknown as ReportRow[];
}
