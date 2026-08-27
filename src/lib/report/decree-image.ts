import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import type { SupabaseSession } from "@/lib/supabase-rest";

export type DecreeImageResult = {
  ok: true;
  imagePath: string | null;
  signedUrl: string | null;
  reused?: boolean;
  missing?: boolean;
};

type DecreeImageFailure = {
  ok?: false;
  error?: string;
  detail?: string;
};

function friendlyMessage(code: string): string {
  switch (code) {
    case "IMAGE_GENERATION_NOT_CONFIGURED":
      return "命誥圖生成服務尚未配置。";
    case "DECREE_NOT_READY":
      return "請先生成並保存完整報告，再生成命誥圖。";
    case "REPORT_NOT_FOUND":
      return "找不到這筆已保存報告，請先保存後再試。";
    case "UNAUTHORIZED":
    case "HTTP_401":
      return "登入狀態已失效，請重新登入後再查看命誥圖。";
    case "GALLERY_REFERENCE_NOT_FOUND":
      return "個人命誥圖庫目前沒有可用的核准母圖，暫不啟動生成。";
    case "GALLERY_REFERENCE_LOAD_FAILED":
      return "個人命誥母圖暫時無法載入，請稍後再試。";
    case "IMAGE_LOAD_FAILED":
      return "已保存的命誥圖暫時無法載入，請稍後再試。";
    case "IMAGE_GENERATION_FAILED":
      return "命誥圖生成服務目前暫不可用，請稍後再試。";
    default:
      return "命誥圖暫時無法生成。";
  }
}

async function requestFunction(
  session: SupabaseSession,
  functionName: "view-decree-image" | "generate-decree-image",
  reportId: string,
  payload: { force?: boolean; viewOnly?: boolean } = {},
): Promise<DecreeImageResult> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reportId, ...payload }),
  });

  let body: DecreeImageResult | DecreeImageFailure | null = null;
  try {
    body = (await res.json()) as DecreeImageResult | DecreeImageFailure;
  } catch {
    body = null;
  }

  if (!res.ok || !body || body.ok !== true) {
    const fail = (body ?? {}) as DecreeImageFailure;
    throw new Error(friendlyMessage(String(fail.error ?? `HTTP_${res.status}`)));
  }
  return body;
}

export async function loadExistingDecreeImage(
  session: SupabaseSession,
  reportId: string,
): Promise<DecreeImageResult> {
  return requestFunction(session, "view-decree-image", reportId);
}

export async function generateDecreeImage(
  session: SupabaseSession,
  reportId: string,
  force = false,
): Promise<DecreeImageResult> {
  if (!force) {
    const existing = await loadExistingDecreeImage(session, reportId);
    if (existing.signedUrl || !existing.missing) return existing;
  }
  return requestFunction(session, "generate-decree-image", reportId, { force });
}
