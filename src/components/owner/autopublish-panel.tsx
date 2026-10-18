import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  createQueuePost,
  deleteQueuePost,
  markQueuePostDone,
  pendingManualChannels,
  readAutopublishOverview,
  runAutopublishNow,
  saveAutopublishSettings,
  updateQueuePost,
  type AutopublishOverview,
  type QueueChannel,
  type QueueItem,
  type QueueStatus,
} from "@/lib/owner-autopublish-client";
import { disconnectThreadsAccount, startThreadsConnection } from "@/lib/owner-social-client";

const SocialPublisherPage = lazy(() => import("@/routes/social").then((m) => ({ default: m.SocialPublisherPage })));

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const CHANNEL_LABEL: Record<QueueChannel, string> = {
  threads: "Threads",
  instagram: "Instagram",
  xiaohongshu: "小紅書",
  facebook: "Facebook",
  x: "X",
};
const AUTO_CHANNELS: QueueChannel[] = ["threads", "instagram"];
const MANUAL_CHANNELS: QueueChannel[] = ["xiaohongshu", "facebook", "x"];
const STATUS_LABEL: Record<QueueStatus, { text: string; tone: "ok" | "warn" | "bad" | "mute" }> = {
  draft: { text: "草稿", tone: "mute" },
  scheduled: { text: "排隊中", tone: "warn" },
  publishing: { text: "發布中", tone: "warn" },
  published: { text: "已發布", tone: "ok" },
  partial: { text: "部分成功", tone: "warn" },
  failed: { text: "失敗", tone: "bad" },
  manual: { text: "待手動發布", tone: "warn" },
  skipped: { text: "已略過", tone: "mute" },
};
const TONE_CLASS = {
  ok: "border-emerald-700/30 bg-emerald-700/10 text-emerald-900",
  warn: "border-amber-700/30 bg-amber-600/10 text-amber-900",
  bad: "border-cinnabar/35 bg-cinnabar/10 text-cinnabar-deep",
  mute: "border-line bg-paper/60 text-ink-mute",
} as const;

function taipei(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

function daysLabel(days: number[]) {
  return days.map((day) => `週${WEEKDAYS[day]}`).join("、");
}

function Pill({ tone, children }: { tone: keyof typeof TONE_CLASS; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${TONE_CLASS[tone]}`}>{children}</span>;
}

function threadsErrorText(code: string) {
  if (code.includes("OWNER_REQUIRED")) return "後台登入已過期。請重新登入後台，再按一次。";
  if (code.includes("ORIGIN_REJECTED")) return "請從 zhao-wu.com 打開後台再按；舊網址會自動轉到正式網址。";
  if (code.includes("THREADS_OAUTH_NOT_CONFIGURED")) return "伺服器還沒設定 Meta 應用（META_APP_ID / META_APP_SECRET）。";
  return `無法開始授權：${code || "未知錯誤"}`;
}

/** Where to paste each manual channel. X accepts prefilled text; the others open their composer. */
function composeLink(channel: QueueChannel, body: string): { href: string; label: string } | null {
  if (channel === "x") return { href: `https://x.com/intent/post?text=${encodeURIComponent(body.slice(0, 280))}`, label: "打開 X（文案已帶入）" };
  if (channel === "xiaohongshu") return { href: "https://creator.xiaohongshu.com/publish/publish", label: "打開小紅書發佈頁" };
  if (channel === "facebook") return { href: "https://www.facebook.com/", label: "打開 Facebook" };
  return null;
}

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

export function AutopublishPanel({ initialNotice = "" }: { initialNotice?: string }) {
  const [data, setData] = useState<AutopublishOverview | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(initialNotice);
  const [threadsStatus, setThreadsStatus] = useState<{ tone: "info" | "error"; text: string; url?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draftBody, setDraftBody] = useState("");
  const [draftImage, setDraftImage] = useState("");
  const [draftChannels, setDraftChannels] = useState<QueueChannel[]>(["threads"]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setData(await readAutopublishOverview());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "讀取失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function connectThreads() {
    setThreadsStatus({ tone: "info", text: "正在準備 Threads 授權頁…" });
    try {
      const url = await startThreadsConnection();
      setThreadsStatus({ tone: "info", text: "正在前往 Threads。到了之後請登入並按「允許」。如果沒有自動跳轉，請點下面的按鈕。", url });
      window.setTimeout(() => window.location.assign(url), 400);
    } catch (err) {
      setThreadsStatus({ tone: "error", text: threadsErrorText(err instanceof Error ? err.message : "") });
    }
  }

  async function act(task: () => Promise<unknown>, success = "") {
    setBusy(true);
    setError("");
    try {
      await task();
      if (success) setNotice(success);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setBusy(false);
    }
  }

  const settings = data?.settings;
  const items = data?.items ?? [];
  const threadsConnected = Boolean(data?.channels?.threads);
  const autoChannelConnected = (channel: QueueChannel) => channel === "threads" ? threadsConnected : channel === "instagram" ? Boolean(data?.channels?.instagram) : true;
  const manualTasks = items.filter((item) => pendingManualChannels(item).length > 0);
  const queued = items.filter((item) => item.status === "scheduled" || item.status === "draft");
  const history = items.filter((item) => !["scheduled", "draft", "manual"].includes(item.status));

  const headline = useMemo(() => {
    if (!settings) return null;
    const connectedAuto = (settings.channels ?? []).some((channel) => AUTO_CHANNELS.includes(channel) && autoChannelConnected(channel));
    const hasManual = (settings.channels ?? []).some((channel) => MANUAL_CHANNELS.includes(channel));
    if (!settings.enabled) return { tone: "mute" as const, title: "自動發佈已暫停", detail: "打開開關後，系統會依下方排程自己發文。" };
    if (!connectedAuto && !hasManual) return { tone: "bad" as const, title: "已開啟，但目前不會發出任何貼文", detail: "還沒有連接可自動發布的平台。先連接 Threads（下方一鍵授權），連接完成後會自動開始。" };
    const next = data?.schedule?.upcoming?.[0];
    return {
      tone: "ok" as const,
      title: "自動發佈運作中",
      detail: `每週 ${settings.publish_days.length} 次（${daysLabel(settings.publish_days)}）${next ? `，下一次 ${next.slice(5).replace("-", "/")} 台北 20:00 前後` : ""}`,
    };
  }, [settings, data]);

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-paper-deep" role="status" aria-label="載入中" />;
  if (data && !data.configured) {
    return (
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <h2 className="font-display text-2xl">自動發佈尚未啟用</h2>
        <p className="mt-2 text-sm leading-7 text-ink-soft">伺服器還沒有設定發佈佇列密鑰（ZHAOWU_SOCIAL_QUEUE_SECRET），所以暫時無法使用。</p>
      </section>
    );
  }
  if (!data || !settings) {
    return <p className="rounded-md border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm text-cinnabar-deep">{error || "讀取失敗"}　<button type="button" className="underline" onClick={() => { setLoading(true); void reload(); }}>重試</button></p>;
  }

  function toggleDay(day: number) {
    if (!settings) return;
    const has = settings.publish_days.includes(day);
    const next = has ? settings.publish_days.filter((d) => d !== day) : [...settings.publish_days, day].sort((a, b) => a - b);
    if (next.length < 1 || next.length > 3) {
      setNotice(next.length < 1 ? "至少要選一天。" : "每週最多 3 次，避免洗版。");
      return;
    }
    void act(() => saveAutopublishSettings({ publishDays: next }), "排程已更新。");
  }

  function toggleSettingChannel(channel: QueueChannel) {
    if (!settings) return;
    const has = settings.channels.includes(channel);
    const next = has ? settings.channels.filter((c) => c !== channel) : [...settings.channels, channel];
    if (!next.length) { setNotice("至少要選一個平台。"); return; }
    void act(() => saveAutopublishSettings({ channels: next }), "平台已更新。");
  }

  function resetDraft() {
    setDraftBody(""); setDraftImage(""); setDraftChannels(["threads"]); setEditingId(null);
  }

  async function submitDraft(mode: "scheduled" | "draft" | "now") {
    const body = draftBody.trim();
    if (!body) { setNotice("請先輸入貼文內容。"); return; }
    if (draftChannels.includes("instagram") && !draftImage.trim()) { setNotice("Instagram 需要一張公開的 JPEG/PNG 圖片網址。"); return; }
    if (draftChannels.includes("threads") && new TextEncoder().encode(body).length > 500) { setNotice("Threads 文字最多 500 個位元組（約 160 個中文字）。"); return; }
    await act(async () => {
      if (editingId) {
        await updateQueuePost(editingId, { body, imageUrl: draftImage.trim(), channels: draftChannels, status: mode === "draft" ? "draft" : "scheduled" });
        if (mode === "now") await runAutopublishNow(editingId);
      } else {
        const created = await createQueuePost({ body, imageUrl: draftImage.trim(), channels: draftChannels, status: mode === "draft" ? "draft" : "scheduled" }) as { item?: QueueItem };
        if (mode === "now" && created.item?.id) {
          const outcome = await runAutopublishNow(created.item.id);
          if (!outcome.result.ran) throw new Error(outcome.result.reason === "NOTHING_CONNECTED" ? "尚未連接任何可發布的平台。" : `未發布：${outcome.result.reason}`);
        }
      }
      resetDraft();
    }, mode === "now" ? "已送出發布。" : mode === "draft" ? "草稿已儲存。" : "已排入佇列，會在下一個發佈日發出。");
  }

  function startEdit(item: QueueItem) {
    setEditingId(item.id); setDraftBody(item.body); setDraftImage(item.image_url ?? ""); setDraftChannels(item.channels);
    document.getElementById("autopublish-compose")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const bytes = new TextEncoder().encode(draftBody.trim()).length;

  return (
    <div className="space-y-5" data-autopublish-panel>
      {/* 1. Status + master switch */}
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <p className="text-xs tracking-[0.28em] text-cinnabar">AUTO PUBLISH</p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl">{headline?.title}</h2>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{headline?.detail}</p>
            {settings.paused_reason ? <p className="mt-2 rounded-md border border-amber-700/30 bg-amber-600/10 px-3 py-2 text-sm text-amber-900">{settings.paused_reason}</p> : null}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.enabled}
            disabled={busy}
            onClick={() => void act(() => saveAutopublishSettings({ enabled: !settings.enabled }), settings.enabled ? "已暫停自動發佈。" : "已開啟自動發佈。")}
            className={`inline-flex min-h-12 w-fit shrink-0 items-center gap-3 rounded-full border px-4 text-sm font-medium transition disabled:opacity-50 ${settings.enabled ? "border-wood bg-wood text-cream" : "border-line bg-paper/70 text-ink-soft"}`}
          >
            <span className={`relative inline-block h-6 w-11 rounded-full ${settings.enabled ? "bg-cream/35" : "bg-ink/15"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream shadow transition-all ${settings.enabled ? "left-[22px]" : "left-0.5"}`} />
            </span>
            {settings.enabled ? "運作中" : "已暫停"}
          </button>
        </div>
        {error ? <p role="alert" className="mt-4 rounded-md border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm text-cinnabar-deep">{error}</p> : null}
        {notice ? <p role="status" className="mt-4 rounded-md border border-line bg-paper/70 px-4 py-3 text-sm text-ink-soft">{notice}</p> : null}
      </section>

      {/* 2. Platforms */}
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <h3 className="font-display text-xl">平台連接</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <article className="rounded-xl border border-line bg-paper/40 p-4">
            <div className="flex items-center justify-between gap-2"><h4 className="font-semibold">Threads</h4><Pill tone={threadsConnected ? "ok" : "bad"}>{threadsConnected ? "已連接" : "未連接"}</Pill></div>
            {data.channels?.threadsAccounts.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {data.channels.threadsAccounts.map((account) => (
                  <li key={account.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate">@{account.username}{account.expiresAt ? <span className="text-xs text-ink-mute">　授權到 {new Date(account.expiresAt).toLocaleDateString("zh-TW")}</span> : null}</span>
                    <button type="button" disabled={busy} className="shrink-0 text-xs text-cinnabar underline disabled:opacity-40" onClick={() => { if (window.confirm(`中斷 @${account.username}？`)) void act(() => disconnectThreadsAccount(account.id), "已中斷連接。"); }}>中斷</button>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm leading-6 text-ink-soft">按下按鈕，用 Threads 帳號授權一次，之後就不用再碰。{data.channels?.targets.threads ? `已鎖定發布到 @${data.channels.targets.threads}。` : ""}</p>}
            <button type="button" disabled={busy || threadsStatus?.tone === "info"} className="mt-3 min-h-11 rounded-full bg-wood px-5 text-sm text-cream disabled:opacity-60" onClick={() => void connectThreads()}>
              {threadsConnected ? "新增另一個 Threads 帳號" : "連接 Threads"}
            </button>
            {threadsStatus ? (
              <div role={threadsStatus.tone === "error" ? "alert" : "status"} className={`mt-3 rounded-md border px-3 py-3 text-sm leading-6 ${threadsStatus.tone === "error" ? "border-cinnabar/30 bg-cinnabar/5 text-cinnabar-deep" : "border-line bg-paper/70 text-ink-soft"}`}>
                {threadsStatus.text}
                {threadsStatus.url ? <a href={threadsStatus.url} className="mt-2 flex min-h-11 items-center justify-center rounded-full border border-line bg-cream px-4 text-ink">前往 Threads 授權</a> : null}
              </div>
            ) : null}
            {!threadsConnected ? (
              <details className="mt-2 text-sm text-ink-soft">
                <summary className="min-h-11 cursor-pointer py-3 text-ink">按了之後沒有看到「允許」？</summary>
                <ol className="list-decimal space-y-1 pl-5 leading-6">
                  <li>授權頁在 Threads 網站上，不是彈窗。要在已登入 @{data.channels?.targets.threads || "你的帳號"} 的瀏覽器（Safari）裡做；如果跳進 Threads App，回到 Safari 重按。</li>
                  <li>Meta 開發者後台 → 你的應用 → Threads API → 把這個 Threads 帳號加為「Threads 測試人員」，再到 Threads App：設定 → 帳號 → 網站權限 → 邀請，按「接受」。</li>
                  <li>同一頁的「有效的 OAuth 重新導向 URI」要填：{data.channels?.oauth?.redirectUri ? <code className="break-all rounded bg-paper px-1">{data.channels.oauth.redirectUri}</code> : "（讀取中）"}</li>
                  {data.channels?.oauth && !data.channels.oauth.ready ? <li className="text-cinnabar">伺服器還沒設定 Meta 應用金鑰，這一步會失敗。</li> : null}
                </ol>
              </details>
            ) : null}
          </article>
          <article className="rounded-xl border border-line bg-paper/40 p-4">
            <div className="flex items-center justify-between gap-2"><h4 className="font-semibold">Instagram</h4><Pill tone={data.channels?.instagram ? "ok" : "mute"}>{data.channels?.instagram ? "已設定" : "未設定"}</Pill></div>
            <p className="mt-3 text-sm leading-6 text-ink-soft">Instagram 官方接口只能發「帶圖」貼文，而且要「專業帳號」加上 Meta 開發者授權，這一步只有你的帳號能做。{data.channels?.instagram ? "目前已設定，貼文會附圖自動發出。" : "在這之前，勾選 Instagram 的貼文會進「待手動發布」，不會漏掉。"}</p>
            {!data.channels?.instagram ? <details className="mt-2 text-sm text-ink-soft"><summary className="min-h-11 cursor-pointer py-3 text-ink">怎麼接上 Instagram？</summary><ol className="list-decimal space-y-1 pl-5 leading-6"><li>Instagram 帳號切成「專業帳號」（設定 → 帳號類型）。</li><li>Meta 開發者後台（developers.facebook.com）→ 你的應用 → 加入「Instagram」產品，把自己加為測試人員。</li><li>產生長效存取權杖，連同 Instagram 用戶 ID，交給我設定到 Vercel（META_INSTAGRAM_USER_ID / META_INSTAGRAM_ACCESS_TOKEN）。</li></ol></details> : null}
          </article>
          <article className="rounded-xl border border-line bg-paper/40 p-4 sm:col-span-2">
            <div className="flex items-center justify-between gap-2"><h4 className="font-semibold">小紅書 / Facebook / X</h4><Pill tone="warn">半自動</Pill></div>
            <p className="mt-3 text-sm leading-6 text-ink-soft">這些平台沒有可用的官方個人發佈接口（強行自動化會有封號風險）。勾選後，到發佈日系統會把文案準備好放進下方「待手動發布」，你只要複製、貼上、按一下「已發布」。</p>
          </article>
        </div>
      </section>

      {/* 3. Schedule */}
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <h3 className="font-display text-xl">排程</h3>
        <p className="mt-1 text-sm text-ink-soft">每週 2–3 次最剛好。每個發佈日台北時間 20:00 前後檢查一次，一天最多發一則。</p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="發佈日">
          {WEEKDAYS.map((label, day) => {
            const on = settings.publish_days.includes(day);
            return <button key={day} type="button" aria-pressed={on} disabled={busy} onClick={() => toggleDay(day)} className={`min-h-11 min-w-12 rounded-full border px-4 text-sm font-medium disabled:opacity-50 ${on ? "border-wood bg-wood text-cream" : "border-line bg-paper/60 text-ink-soft"}`}>週{label}</button>;
          })}
        </div>
        <div className="mt-5">
          <p className="text-sm font-medium text-ink">發到哪些平台</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="發佈平台">
            {(Object.keys(CHANNEL_LABEL) as QueueChannel[]).map((channel) => {
              const on = settings.channels.includes(channel);
              return <button key={channel} type="button" aria-pressed={on} disabled={busy} onClick={() => toggleSettingChannel(channel)} className={`min-h-11 rounded-full border px-4 text-sm disabled:opacity-50 ${on ? "border-wood bg-wood/10 text-wood" : "border-line bg-paper/60 text-ink-soft"}`}>{on ? "✓ " : ""}{CHANNEL_LABEL[channel]}{AUTO_CHANNELS.includes(channel) && !autoChannelConnected(channel) ? "（未連接）" : ""}</button>;
            })}
          </div>
        </div>
        {data.bank?.next ? (
          <details className="mt-5 rounded-lg border border-line bg-paper/50 p-3">
            <summary className="cursor-pointer text-sm font-medium text-ink-soft">下一則內容庫貼文預覽（內容庫共 {data.bank.total} 則，依序輪播不重複）</summary>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink">{data.bank.next.text}</p>
          </details>
        ) : null}
        <p className="mt-4 text-xs leading-6 text-ink-mute">沒有你排隊的貼文時，系統用內容庫（五行、八字、掌相基礎與站內測驗導流），全部是預先審過的文字，不會即時生成、不產生額外費用。</p>
      </section>

      {/* 4. Manual tasks */}
      {manualTasks.length ? (
        <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7" data-autopublish-manual>
          <h3 className="font-display text-xl">待手動發布（{manualTasks.length}）</h3>
          <ul className="mt-4 space-y-3">
            {manualTasks.map((item) => (
              <li key={item.id} className="rounded-xl border border-amber-700/30 bg-amber-600/5 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-mute">{pendingManualChannels(item).map((c) => <Pill key={c} tone="warn">{CHANNEL_LABEL[c]}</Pill>)}<span>{taipei(item.created_at)}</span></div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink">{item.body}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="min-h-11 rounded-full border border-line bg-cream px-4 text-sm" onClick={async () => setNotice((await copyText(item.body)) ? "文案已複製。" : "複製失敗，請手動選取。")}>複製文案</button>
                  {pendingManualChannels(item).map((c) => {
                    const link = composeLink(c, item.body);
                    return link ? <a key={c} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-4 text-sm text-ink" onClick={() => { void copyText(item.body); }}>{link.label}</a> : null;
                  })}
                  <button type="button" disabled={busy} className="min-h-11 rounded-full bg-wood px-4 text-sm text-cream disabled:opacity-50" onClick={() => void act(() => markQueuePostDone(item.id), "已標記為已發布。")}>我已經發了</button>
                  <button type="button" disabled={busy} className="min-h-11 px-3 text-sm text-ink-mute underline disabled:opacity-50" onClick={() => void act(() => updateQueuePost(item.id, { status: "skipped" }))}>略過</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 5. Compose */}
      <section id="autopublish-compose" className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <h3 className="font-display text-xl">{editingId ? "編輯排隊中的貼文" : "自己寫一則"}</h3>
        <p className="mt-1 text-sm text-ink-soft">排隊中的貼文會優先於內容庫，在下一個發佈日發出。</p>
        <textarea value={draftBody} onChange={(e) => setDraftBody(e.target.value)} rows={5} maxLength={2200} className="mt-4 w-full rounded-lg border border-line bg-cream px-4 py-3 text-base leading-7 outline-none focus:border-cinnabar" placeholder="貼文內容" aria-label="貼文內容" />
        <p className={`mt-1 text-xs ${draftChannels.includes("threads") && bytes > 500 ? "text-cinnabar" : "text-ink-mute"}`}>Threads 用量 {bytes}/500 位元組{draftChannels.includes("threads") && bytes > 500 ? "（超過了）" : ""}</p>
        <input value={draftImage} onChange={(e) => setDraftImage(e.target.value)} inputMode="url" className="mt-3 h-11 w-full rounded-lg border border-line bg-cream px-4 text-sm outline-none focus:border-cinnabar" placeholder="圖片網址（選填，公開 https 的 JPEG / PNG；Instagram 必填）" aria-label="圖片網址" />
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="這一則要發到">
          {(Object.keys(CHANNEL_LABEL) as QueueChannel[]).map((channel) => {
            const on = draftChannels.includes(channel);
            return <button key={channel} type="button" aria-pressed={on} onClick={() => setDraftChannels((cur) => on ? cur.filter((c) => c !== channel) : [...cur, channel])} className={`min-h-11 rounded-full border px-4 text-sm ${on ? "border-wood bg-wood/10 text-wood" : "border-line bg-paper/60 text-ink-soft"}`}>{on ? "✓ " : ""}{CHANNEL_LABEL[channel]}</button>;
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy || !draftChannels.length} className="min-h-12 rounded-full bg-cinnabar px-5 text-sm font-medium text-cream disabled:opacity-40" onClick={() => void submitDraft("scheduled")}>排入佇列</button>
          <button type="button" disabled={busy || !draftChannels.length} className="min-h-12 rounded-full border border-line bg-cream px-5 text-sm disabled:opacity-40" onClick={() => void submitDraft("now")}>立即發布</button>
          <button type="button" disabled={busy} className="min-h-12 rounded-full border border-line bg-paper/60 px-5 text-sm text-ink-soft disabled:opacity-40" onClick={() => void submitDraft("draft")}>存成草稿</button>
          {editingId ? <button type="button" className="min-h-12 px-4 text-sm text-ink-mute underline" onClick={resetDraft}>取消編輯</button> : null}
        </div>
      </section>

      {/* 6. Queue + history */}
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl">佇列與紀錄</h3>
          <div className="flex gap-2">
            <button type="button" disabled={busy || !settings.channels.length} className="min-h-11 rounded-full border border-line bg-cream px-4 text-sm disabled:opacity-40" onClick={() => void act(async () => { const out = await runAutopublishNow(); setNotice(out.result.ran ? `已執行：${STATUS_LABEL[(out.result.status as QueueStatus) ?? "published"].text}` : out.result.reason === "NOTHING_CONNECTED" ? "尚未連接任何可發布的平台。" : `未執行：${out.result.reason}`); })}>現在就發一則</button>
            <button type="button" className="min-h-11 rounded-full border border-line bg-paper/60 px-4 text-sm text-ink-soft" onClick={() => void reload()}>重新整理</button>
          </div>
        </div>
        {queued.length ? (
          <>
            <h4 className="mt-5 text-sm font-semibold text-ink-soft">排隊中（{queued.length}）</h4>
            <ul className="mt-2 space-y-2">
              {queued.map((item) => (
                <li key={item.id} className="rounded-lg border border-line bg-paper/40 p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs"><Pill tone={STATUS_LABEL[item.status].tone}>{STATUS_LABEL[item.status].text}</Pill>{item.channels.map((c) => <span key={c} className="text-ink-mute">{CHANNEL_LABEL[c]}</span>)}</div>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-ink">{item.body}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    <button type="button" className="min-h-9 underline" onClick={() => startEdit(item)}>編輯</button>
                    {item.status === "draft" ? <button type="button" disabled={busy} className="min-h-9 underline" onClick={() => void act(() => updateQueuePost(item.id, { status: "scheduled" }), "已排入佇列。")}>排入佇列</button> : null}
                    <button type="button" disabled={busy} className="min-h-9 text-cinnabar underline" onClick={() => { if (window.confirm("刪除這則？")) void act(() => deleteQueuePost(item.id)); }}>刪除</button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : <p className="mt-4 text-sm text-ink-mute">沒有排隊中的貼文，系統會使用內容庫。</p>}
        <h4 className="mt-6 text-sm font-semibold text-ink-soft">最近紀錄</h4>
        {history.length ? (
          <ul className="mt-2 space-y-2">
            {history.slice(0, 20).map((item) => (
              <li key={item.id} className="rounded-lg border border-line bg-paper/30 p-3">
                <div className="flex flex-wrap items-center gap-2 text-xs"><Pill tone={STATUS_LABEL[item.status].tone}>{STATUS_LABEL[item.status].text}</Pill><span className="text-ink-mute">{taipei(item.published_at ?? item.created_at)}</span>{item.channels.map((c) => <span key={c} className="text-ink-mute">{CHANNEL_LABEL[c]}</span>)}{item.source === "bank" ? <span className="text-ink-mute">內容庫</span> : null}</div>
                <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{item.body}</p>
                {item.last_error ? <p className="mt-1 text-xs text-cinnabar">{item.last_error}</p> : null}
                {(item.status === "failed" || item.status === "partial") ? <button type="button" disabled={busy} className="mt-2 min-h-9 text-xs underline disabled:opacity-40" onClick={() => void act(async () => { await runAutopublishNow(item.id); }, "已重新送出。")}>重試</button> : null}
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-ink-mute">還沒有發布紀錄。</p>}
      </section>

      <details className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <summary className="cursor-pointer font-display text-xl">手動單則發布（含圖庫選圖）</summary>
        <div className="mt-4">
          <Suspense fallback={<p role="status" className="text-ink">載入發布器…</p>}><SocialPublisherPage embedded /></Suspense>
        </div>
      </details>
    </div>
  );
}
