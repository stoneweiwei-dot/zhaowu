import * as tus from "tus-js-client";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

export const OWNER_COOKIE_ACCESS_TOKEN = "__zhaowu_owner_cookie_server_bridge__";

export type OwnerCookieSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: { id: string; email?: string | null };
};

export function createOwnerCookieSession(): OwnerCookieSession {
  return {
    access_token: OWNER_COOKIE_ACCESS_TOKEN,
    refresh_token: "",
    expires_in: 60 * 60 * 24 * 30,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    token_type: "owner-cookie",
    user: { id: "zhaowu-owner", email: null },
  };
}

export function isOwnerCookieAccessToken(token?: string | null) {
  return token === OWNER_COOKIE_ACCESS_TOKEN;
}

export function isOwnerCookieSession(session?: { access_token?: string | null } | null) {
  return isOwnerCookieAccessToken(session?.access_token);
}

type OwnerDataFailure = {
  ok?: false;
  error?: string;
  detail?: string;
};

function errorMessage(body: OwnerDataFailure | null, status: number) {
  const code = String(body?.error ?? `HTTP_${status}`);
  switch (code) {
    case "OWNER_REQUIRED":
    case "INVALID_OWNER_CREDENTIAL":
      return "站主登入狀態已失效，請重新登入。";
    case "BRIDGE_UNAUTHORIZED":
    case "BRIDGE_REQUIRED":
    case "BRIDGE_NOT_CONFIGURED":
      return "站主資料橋接尚未正確設定。";
    case "SUPABASE_UNAVAILABLE":
    case "SUPABASE_ENV_MISSING":
      return "資料服務暫時無法使用。";
    case "exceed_storage_size_quota":
    case "exceed_cached_egress_quota":
      return "資料服務目前因 Supabase 額度限制暫停；文字報告與本機資料不受影響。";
    case "REPORT_NOT_FOUND":
      return "找不到這筆報告。";
    case "ASSET_NOT_FOUND":
      return "找不到這個素材。";
    case "UPLOAD_PREPARE_FAILED":
      return "無法建立安全上傳通道。";
    case "UPLOAD_TICKET_INVALID":
    case "UPLOAD_TICKET_EXPIRED":
      return "上傳授權已失效，請重新選擇檔案上傳。";
    case "UPLOAD_FINALIZE_FAILED":
      return "檔案已傳送，但素材資料無法完成保存。";
    case "NO_GALLERY_ASSET_AVAILABLE":
      return "目前圖庫沒有可用圖片。";
    case "DECREE_NOT_READY":
      return "請先生成並保存完整報告，再生成命誥圖。";
    case "IMAGE_LOAD_FAILED":
    case "IMAGE_GENERATION_FAILED":
      return "命誥圖暫時無法建立或載入。";
    default:
      return String(body?.detail ?? body?.error ?? `HTTP ${status}`);
  }
}

export async function ownerData<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch("/api/owner-data", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  let body: unknown = null;
  try { body = await res.json(); } catch { body = null; }
  if (!res.ok) throw new Error(errorMessage((body ?? {}) as OwnerDataFailure, res.status));
  return body as T;
}

export type OwnerUploadTicket = {
  ok: true;
  bucket: string;
  path: string;
  category: string;
  assetKey: string;
  contentType: string;
  expectedSizeBytes: number;
  uploadType: "background" | "gallery";
  uploadTicket: string;
  signedUrl: string;
  token?: string | null;
};

/** Upload bytes directly to Supabase Storage. Supabase createSignedUploadUrl URLs are valid for 2 hours; the separate server-signed uploadTicket binds finalize to this exact object. */
export async function uploadOwnerSignedFile(ticket: OwnerUploadTicket, file: File, onProgress?: (percent: number) => void) {
  if (file.size > 6 * 1024 * 1024) {
    if (!ticket.token || !SUPABASE_URL || !SUPABASE_KEY) throw new Error("大檔續傳通道尚未正確設定。");
    const signedUploadToken = ticket.token;
    onProgress?.(2);
    await new Promise<void>((resolve, reject) => {
      const endpoint = `${SUPABASE_URL.replace(/\/$/, "").replace(".supabase.co", ".storage.supabase.co")}/storage/v1/upload/resumable`;
      const upload = new tus.Upload(file, {
        endpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        chunkSize: 6 * 1024 * 1024,
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        headers: {
          // Bearer is required for signed resumable auth; x-signature kept for contract compatibility.
          authorization: `Bearer ${signedUploadToken}`,
          apikey: SUPABASE_KEY,
          "x-signature": signedUploadToken,
          "x-upsert": "false",
        },
        metadata: {
          bucketName: ticket.bucket,
          objectName: ticket.path,
          contentType: ticket.contentType,
          cacheControl: "3600",
        },
        onError: reject,
        onProgress(bytesUploaded, bytesTotal) {
          onProgress?.(Math.max(2, Math.min(85, Math.round((bytesUploaded / bytesTotal) * 83) + 2)));
        },
        onSuccess: () => resolve(),
      });
      void upload.findPreviousUploads().then((previous) => {
        if (previous.length) upload.resumeFromPreviousUpload(previous[0]);
        upload.start();
      }).catch(reject);
    });
    onProgress?.(85);
    return;
  }
  onProgress?.(10);
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", file);
  const res = await fetch(ticket.signedUrl, {
    method: "PUT",
    headers: { "x-upsert": "false" },
    body,
  });
  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch { /* noop */ }
    throw new Error(detail || `Upload failed (HTTP ${res.status}).`);
  }
  onProgress?.(85);
}
