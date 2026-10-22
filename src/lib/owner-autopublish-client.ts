export type AutoChannel = "threads" | "instagram" | "facebook";
export type ManualChannel = "xiaohongshu" | "x";
export type QueueChannel = AutoChannel | ManualChannel;

export type QueueStatus = "draft" | "scheduled" | "publishing" | "published" | "partial" | "failed" | "manual" | "skipped";

export type QueueItem = {
  id: string;
  status: QueueStatus;
  source: "owner" | "bank";
  bank_key: string | null;
  body: string;
  image_url: string | null;
  alt_text: string | null;
  channels: QueueChannel[];
  not_before: string | null;
  slot_date: string | null;
  results: Record<string, { ok?: boolean | null; manual?: boolean; code?: string; message?: string; accounts?: Array<{ username: string; ok: boolean; message?: string }> }>;
  attempts: number;
  last_error: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AutopublishSettings = {
  enabled: boolean;
  publish_days: number[];
  channels: QueueChannel[];
  attach_image: boolean;
  paused_reason: string | null;
  updated_at: string;
};

export type AutopublishOverview = {
  ok: true;
  configured: boolean;
  warnings?: string[];
  settings?: AutopublishSettings;
  items?: QueueItem[];
  channels?: {
    threads: boolean;
    instagram: boolean;
    facebook: boolean;
    threadsAccounts: Array<{ id: string; username: string; expiresAt: string | null }>;
    metaAccounts: Array<{ id: string; pageId: string; pageName: string; instagramUserId: string; instagramUsername: string; expiresAt: string | null }>;
    targets: { instagram: string; threads: string };
    oauth?: { ready: boolean; redirectUri: string };
    metaOauth?: { ready: boolean; redirectUri: string };
  };
  bank?: { total: number; next: { key: string; text: string } | null };
  schedule?: { cronHourUtc: number; todayIsPublishDay: boolean; upcoming: string[] };
};

async function call<T = Record<string, unknown>>(action: string, extra: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch("/api/owner-session", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
  });
  const body = await response.json().catch(() => ({})) as { ok?: boolean; error?: string; message?: string } & T;
  if (!response.ok || body.ok === false) throw new Error(body.message || body.error || `HTTP ${response.status}`);
  return body;
}

export const readAutopublishOverview = () => call<AutopublishOverview>("autopublish.overview");

export const saveAutopublishSettings = (patch: { enabled?: boolean; publishDays?: number[]; channels?: QueueChannel[] }) =>
  call("autopublish.settings", patch);

export const createQueuePost = (input: { body: string; imageUrl?: string; altText?: string; channels: QueueChannel[]; notBefore?: string; status?: "draft" | "scheduled" }) =>
  call("autopublish.queue.create", input);

export const updateQueuePost = (id: string, patch: Partial<{ body: string; imageUrl: string; altText: string; channels: QueueChannel[]; notBefore: string; status: "draft" | "scheduled" | "skipped" | "manual" }>) =>
  call("autopublish.queue.update", { id, ...patch });

export const deleteQueuePost = (id: string) => call("autopublish.queue.delete", { id });

export const markQueuePostDone = (id: string) => call("autopublish.markDone", { id });

export const runAutopublishNow = (queueId?: string) =>
  call<{ result: { ran: boolean; reason?: string; status?: string } }>("autopublish.run", queueId ? { queueId } : {});

/** Manual channels (小紅書 / Facebook / X / unconnected Instagram) still waiting for the owner to post by hand. */
export function pendingManualChannels(item: QueueItem): QueueChannel[] {
  if (item.results?.manualDone) return [];
  return (Object.entries(item.results ?? {}) as Array<[QueueChannel, { manual?: boolean }]>)
    .filter(([, result]) => result?.manual === true)
    .map(([channel]) => channel);
}
