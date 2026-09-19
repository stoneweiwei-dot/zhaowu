import * as base from "../supabase-rest";
import { isOwnerCookieSession, ownerData } from "@/lib/owner-data-client";

export * from "../supabase-rest";

/** Owner-console reads and destructive actions are server-bridged. Public/member compatibility stays in the base module. */
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

export async function refreshSession(session: base.SupabaseSession): Promise<base.SupabaseSession | null> {
  if (isOwnerCookieSession(session)) return session;
  return base.refreshSession(session);
}

export async function signOutRemote(session?: base.SupabaseSession | null) {
  if (isOwnerCookieSession(session)) return;
  return base.signOutRemote(session);
}
