export type OwnerMusicTrack = {
  id: string;
  name: string;
  url: string;
  contentType: string;
  fileSize: number | null;
  enabled: boolean;
  createdAt: string | null;
};

export type OwnerMusicState = {
  active: { id: string; name: string; url: string; contentType: string } | null;
  tracks: OwnerMusicTrack[];
};

async function parseBody(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>;
}

export async function loadOwnerMusic(): Promise<OwnerMusicState> {
  const response = await fetch("/api/owner-music", { cache: "no-store", credentials: "include" });
  const body = await parseBody(response);
  if (!response.ok) {
    throw new Error(typeof body.detail === "string" ? body.detail : "背景音樂讀取失敗。");
  }
  const active = body.active && typeof body.active === "object" ? body.active as Record<string, unknown> : null;
  const tracks = Array.isArray(body.tracks) ? body.tracks : [];
  return {
    active: active && typeof active.url === "string" ? {
      id: String(active.id ?? ""),
      name: String(active.name ?? "背景音樂"),
      url: String(active.url),
      contentType: String(active.contentType ?? "audio/mpeg"),
    } : null,
    tracks: tracks.map((row) => {
      const item = row && typeof row === "object" ? row as Record<string, unknown> : {};
      return {
        id: String(item.id ?? ""),
        name: String(item.name ?? "背景音樂"),
        url: String(item.url ?? ""),
        contentType: String(item.contentType ?? "audio/mpeg"),
        fileSize: typeof item.fileSize === "number" ? item.fileSize : null,
        enabled: Boolean(item.enabled),
        createdAt: typeof item.createdAt === "string" ? item.createdAt : null,
      };
    }).filter((row) => row.id && row.url),
  };
}

export async function uploadOwnerMusic(file: File, onProgress?: (percent: number) => void) {
  onProgress?.(8);
  const response = await fetch("/api/owner-music", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "x-zhaowu-music-name": encodeURIComponent(file.name || "background"),
    },
    body: file,
  });
  onProgress?.(90);
  const body = await parseBody(response);
  if (!response.ok) {
    if (body.error === "AUDIO_TOO_LARGE") throw new Error("音檔超過 4 MB，請先壓成 MP3 或 M4A。");
    if (body.error === "UNSUPPORTED_AUDIO") throw new Error("請上傳 MP3、M4A、AAC、WAV 或 FLAC。");
    if (body.error === "OWNER_REQUIRED") throw new Error("請重新登入站主後台。");
    throw new Error(typeof body.detail === "string" ? body.detail : "背景音樂上傳失敗。");
  }
  onProgress?.(100);
  window.dispatchEvent(new Event("zhaowu-music-change"));
}

export async function activateOwnerMusic(id: string) {
  const response = await fetch("/api/owner-music", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const body = await parseBody(response);
  if (!response.ok) throw new Error(typeof body.detail === "string" ? body.detail : "無法切換背景音樂。");
  window.dispatchEvent(new Event("zhaowu-music-change"));
}

export async function deleteOwnerMusic(id: string) {
  const response = await fetch("/api/owner-music", {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const body = await parseBody(response);
  if (!response.ok) throw new Error(typeof body.detail === "string" ? body.detail : "無法刪除背景音樂。");
  window.dispatchEvent(new Event("zhaowu-music-change"));
}
