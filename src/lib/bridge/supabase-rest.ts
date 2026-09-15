import * as base from "../supabase-rest";
import type { AnalysisResult } from "@/lib/bazi/types";
import type { NinePage } from "@/lib/report/nine-page";
import { CURRENT_ENGINE_VERSION } from "@/lib/report/legacy-upgrade";
import { isOwnerCookieSession, ownerData } from "@/lib/owner-data-client";

export * from "../supabase-rest";

export async function listReportRecords(session: base.SupabaseSession, isOwner: boolean): Promise<base.ReportListRecord[]> {
  if (!isOwnerCookieSession(session)) return base.listReportRecords(session, isOwner);
  const out = await ownerData<{ ok: true; items: base.ReportListRecord[] }>("report.list", { limit: isOwner ? 50 : 3 });
  return out.items ?? [];
}

export async function getReportRecord(session: base.SupabaseSession, id: string): Promise<base.ReportRecord | null> {
  if (!isOwnerCookieSession(session)) return base.getReportRecord(session, id);
  const out = await ownerData<{ ok: true; item: base.ReportRecord | null }>("report.get", { id });
  return out.item ?? null;
}

export async function deleteReportRecord(session: base.SupabaseSession, id: string) {
  if (!isOwnerCookieSession(session)) return base.deleteReportRecord(session, id);
  await ownerData("report.delete", { id });
}

function ownerReportIdentity(result: AnalysisResult) {
  return {
    id: result.id,
    user_id: null,
    user_email: null,
    alias: result.question.trim().slice(0, 80),
    record_kind: "analysis",
    access_mode: "owner",
    payment_status: "not_required",
    context: {
      question: result.question,
      cityLabel: result.chart.cityLabel,
      dayMaster: result.chart.dayMaster,
      ganZhiLine: result.chart.pillars.map((p) => p.ganZhi).join(" "),
      createdAt: result.createdAt,
      engineVersion: CURRENT_ENGINE_VERSION,
    },
  };
}

export async function createEngineReportRecord(args: {
  session: base.SupabaseSession;
  profile: base.UserProfile | null;
  result: AnalysisResult;
}) {
  if (!isOwnerCookieSession(args.session)) return base.createEngineReportRecord(args);
  const row = {
    ...ownerReportIdentity(args.result),
    status: "engine_ready",
    payment_tier: "free",
    engine_snapshot: { ...args.result, engineVersion: CURRENT_ENGINE_VERSION },
  };
  const out = await ownerData<{ ok: true; item: base.ReportRecord | null }>("report.upsert", { row });
  return out.item ?? row as unknown as base.ReportRecord;
}

export async function patchReportRecord(args: {
  session: base.SupabaseSession;
  profile: base.UserProfile | null;
  result: AnalysisResult;
  status: "report_ready" | "full_ready";
  fullReport?: string | null;
  ninePages?: NinePage[] | null;
}) {
  if (!isOwnerCookieSession(args.session)) return base.patchReportRecord(args);
  const patch: Record<string, unknown> = {
    status: args.status,
    payment_tier: args.status === "full_ready" ? "full" : "free",
    engine_snapshot: { ...args.result, engineVersion: CURRENT_ENGINE_VERSION },
    updated_at: new Date().toISOString(),
  };
  if (args.fullReport !== undefined) patch.paid_report = args.fullReport ? { text: args.fullReport } : null;
  if (args.ninePages !== undefined) patch.mother_draft = args.ninePages ? { reportSections: args.ninePages, ninePages: args.ninePages } : null;
  const out = await ownerData<{ ok: true; item: base.ReportRecord | null }>("report.patch", { id: args.result.id, patch });
  if (out.item) return out.item;
  await createEngineReportRecord(args);
  const retry = await ownerData<{ ok: true; item: base.ReportRecord | null }>("report.patch", { id: args.result.id, patch });
  return retry.item ?? null;
}

export async function saveReportRecord(args: {
  session: base.SupabaseSession;
  profile: base.UserProfile | null;
  result: AnalysisResult;
  fullReport: string | null;
  ninePages: NinePage[] | null;
}) {
  if (!isOwnerCookieSession(args.session)) return base.saveReportRecord(args);
  await createEngineReportRecord(args);
  return patchReportRecord({
    ...args,
    status: "full_ready",
  });
}

export async function refreshSession(session: base.SupabaseSession): Promise<base.SupabaseSession | null> {
  if (isOwnerCookieSession(session)) return session;
  return base.refreshSession(session);
}

export async function signOutRemote(session?: base.SupabaseSession | null) {
  if (isOwnerCookieSession(session)) return;
  return base.signOutRemote(session);
}
