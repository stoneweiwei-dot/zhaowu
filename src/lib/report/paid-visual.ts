import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import { refreshSession, type SupabaseSession } from "@/lib/supabase-rest";
import type { AuraBlueprint } from "@/lib/report/aura-chakra-blueprint";

export type PaidVisualStatus = "locked" | "ready" | "generating" | "completed" | "failed";

export type PreparedPaidVisual = {
  ok: true;
  id: string;
  reportId: string;
  visualKind: "aura_chakra";
  status: PaidVisualStatus;
  resultPath: string | null;
  attempts: number;
  providerUsed: false;
  reused: boolean;
};

type PaidVisualFailure = {
  ok?: false;
  error?: string;
  status?: PaidVisualStatus;
};

function friendlyMessage(code: string): string {
  switch (code) {
    case "PAID_VISUAL_LOCKED":
      return "個人視覺仍未解鎖。";
    case "REPORT_NOT_READY":
      return "完整報告尚未保存完成。";
    case "INVALID_BLUEPRINT":
      return "個人視覺資料需要重新整理。";
    case "UNAUTHORIZED":
    case "HTTP_401":
      return "登入狀態已失效，請重新登入。";
    default:
      return "個人視覺暫時未能保存。";
  }
}

async function callPrepare(session: SupabaseSession, reportId: string, blueprint: AuraBlueprint) {
  return fetch(`${SUPABASE_URL}/functions/v1/prepare-paid-visual`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reportId, visualKind: "aura_chakra", blueprint }),
  });
}

export async function preparePaidAuraVisual(
  session: SupabaseSession,
  reportId: string,
  blueprint: AuraBlueprint,
): Promise<PreparedPaidVisual> {
  let res = await callPrepare(session, reportId, blueprint);
  if (res.status === 401) {
    const refreshed = await refreshSession(session);
    if (refreshed?.access_token) res = await callPrepare(refreshed, reportId, blueprint);
  }

  let body: PreparedPaidVisual | PaidVisualFailure | null = null;
  try { body = await res.json() as PreparedPaidVisual | PaidVisualFailure; }
  catch { body = null; }

  if (!res.ok || !body || body.ok !== true) {
    const failure = (body ?? {}) as PaidVisualFailure;
    throw new Error(friendlyMessage(String(failure.error ?? `HTTP_${res.status}`)));
  }
  return body;
}
