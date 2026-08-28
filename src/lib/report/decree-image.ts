import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import { refreshSession, type SupabaseSession } from "@/lib/supabase-rest";

export type DecreeImageResult = {
  ok: true;
  imagePath: string | null;
  signedUrl: string | null;
  reused?: boolean;
  missing?: boolean;
  galleryReferenceAssetId?: string | null;
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
    case "NO_GALLERY_ASSET_AVAILABLE":
    case "GALLERY_REFERENCE_NOT_FOUND":
      return "目前圖庫沒有可用圖片，請稍後再試。";
    case "GALLERY_REFERENCE_LOAD_FAILED":
      return "個人命誥圖片暫時無法載入，請稍後再試。";
    case "IMAGE_LOAD_FAILED":
      return "已保存的命誥圖暫時無法載入，請稍後再試。";
    case "IMAGE_GENERATION_FAILED":
      return "命誥圖目前暫時無法建立，請稍後再試。";
    default:
      return "命誥圖暫時無法建立。";
  }
}

function callFunction(
  session: SupabaseSession,
  functionName: "view-decree-image" | "generate-decree-image",
  reportId: string,
  payload: { force?: boolean; viewOnly?: boolean; reselectGallery?: boolean },
) {
  return fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reportId, ...payload }),
  });
}

async function requestFunction(
  session: SupabaseSession,
  functionName: "view-decree-image" | "generate-decree-image",
  reportId: string,
  payload: { force?: boolean; viewOnly?: boolean; reselectGallery?: boolean } = {},
): Promise<DecreeImageResult> {
  let res = await callFunction(session, functionName, reportId, payload);

  // A report page can stay open longer than the access-token lifetime. Refresh once on 401 so
  // stored decree delivery and Gallery-direct generation do not fail merely because the in-memory
  // session object is stale. Real authorization failures still surface after the single retry.
  if (res.status === 401) {
    const refreshed = await refreshSession(session);
    if (refreshed?.access_token) {
      res = await callFunction(refreshed, functionName, reportId, payload);
    }
  }

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
  // Explicit user generation is different from passive page loading: re-rank the current Gallery
  // even when this report already has an older Gallery-direct image. This path never needs provider
  // credits unless force=true is explicitly requested.
  return requestFunction(session, "generate-decree-image", reportId, force
    ? { force: true }
    : { reselectGallery: true });
}
