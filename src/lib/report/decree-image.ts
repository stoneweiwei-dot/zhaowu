import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import type { SupabaseSession } from "@/lib/supabase-rest";

export type DecreeImageResult = {
  ok: true;
  imagePath: string;
  signedUrl: string | null;
  reused?: boolean;
};

type DecreeImageFailure = {
  ok?: false;
  error?: string;
  detail?: string;
};

function friendlyMessage(code: string, detail?: string): string {
  switch (code) {
    case "IMAGE_GENERATION_NOT_CONFIGURED":
      return "命诰图生成服务尚未配置 OPENAI_API_KEY。";
    case "DECREE_NOT_READY":
      return "请先生成并保存完整九页报告，再生成命诰图。";
    case "REPORT_NOT_FOUND":
      return "找不到这笔已保存报告，请先保存后再试。";
    case "UNAUTHORIZED":
      return "登录状态已失效，请重新登录后再生成命诰图。";
    case "IMAGE_GENERATION_FAILED":
      return detail ? `命诰图生成失败：${detail}` : "命诰图生成失败，请稍后再试。";
    default:
      return detail || "命诰图暂时无法生成。";
  }
}

export async function generateDecreeImage(
  session: SupabaseSession,
  reportId: string,
  force = false,
): Promise<DecreeImageResult> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-decree-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reportId, force }),
  });

  let body: DecreeImageResult | DecreeImageFailure | null = null;
  try {
    body = (await res.json()) as DecreeImageResult | DecreeImageFailure;
  } catch {
    body = null;
  }

  if (!res.ok || !body || body.ok !== true) {
    const fail = (body ?? {}) as DecreeImageFailure;
    throw new Error(friendlyMessage(String(fail.error ?? `HTTP_${res.status}`), fail.detail));
  }
  return body;
}
