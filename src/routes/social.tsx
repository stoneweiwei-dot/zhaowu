import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuthState } from "@/lib/auth/provider";
import { useI18n } from "@/lib/i18n";
import {
  publishOwnerSocialPost,
  readSocialConfiguration,
  type SocialChannel,
  type SocialConfiguration,
  type SocialPublishResult,
} from "@/lib/owner-social-client";

export const Route = createFileRoute("/social")({ component: SocialPublisherPage });

function SocialPublisherPage() {
  const { locale } = useI18n();
  const { user, isPending } = useAuthState();
  const [configuration, setConfiguration] = useState<SocialConfiguration | null>(null);
  const [statusError, setStatusError] = useState("");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [results, setResults] = useState<Partial<Record<SocialChannel, SocialPublishResult>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const tx = (hant: string, hans: string, en: string) => locale === "en" ? en : locale === "zh-Hans" ? hans : hant;

  useEffect(() => {
    if (!user?.isOwner) return;
    let cancelled = false;
    void readSocialConfiguration()
      .then((next) => {
        if (cancelled) return;
        setConfiguration(next);
        setChannels(([...current]) => current.length ? current : ([
          ...(next.threads ? ["threads" as const] : []),
          ...(next.instagram ? ["instagram" as const] : []),
        ]));
      })
      .catch(() => { if (!cancelled) setStatusError(tx("無法讀取連接狀態。", "无法读取连接状态。", "Could not read connection status.")); });
    return () => { cancelled = true; };
  }, [user?.isOwner, locale]);

  const threadsBytes = useMemo(() => new TextEncoder().encode(text.trim()).length, [text]);
  const connectedCount = Number(configuration?.threads) + Number(configuration?.instagram);

  function toggle(channel: SocialChannel) {
    setChannels((current) => current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]);
    setResults(null);
  }

  async function publish(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setResults(null);
    if (!channels.length) {
      setFormError(tx("先選一個平台。", "先选一个平台。", "Choose at least one channel."));
      return;
    }
    if (channels.includes("instagram") && !imageUrl.trim()) {
      setFormError(tx("Instagram 需要一張公開圖片。", "Instagram 需要一张公开图片。", "Instagram needs a public image."));
      return;
    }
    setBusy(true);
    try {
      setResults(await publishOwnerSocialPost({ text, imageUrl, altText, channels }));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : tx("發布失敗。", "发布失败。", "Publishing failed."));
    } finally {
      setBusy(false);
    }
  }

  if (isPending) return <div className="mx-auto h-52 max-w-2xl animate-pulse rounded-xl bg-cream/70" />;
  if (!user) return (
    <main className="mx-auto max-w-xl">
      <section className="seal-border rounded-xl bg-cream/95 p-6">
        <h1 className="font-display text-3xl">{tx("請先登入站主帳號", "请先登录站主账号", "Owner sign-in required")}</h1>
        <Link to="/login" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-cinnabar px-5 text-cream">{tx("登入", "登录", "Sign in")}</Link>
      </section>
    </main>
  );
  if (!user.isOwner) return (
    <main className="mx-auto max-w-xl">
      <section className="seal-border rounded-xl bg-cream/95 p-6">
        <h1 className="font-display text-3xl">{tx("社交發布僅限站主", "社交发布仅限站主", "Social publishing is owner-only")}</h1>
        <Link to="/" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-5">← {tx("首頁", "首页", "Home")}</Link>
      </section>
    </main>
  );

  return (
    <main className="mx-auto max-w-2xl space-y-4 pb-14" data-owner-social-publisher>
      <section className="seal-border rounded-[1.35rem] bg-cream/95 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.22em] text-cinnabar">SOCIAL PUBLISHER</p>
            <h1 className="mt-1 font-display text-3xl">{tx("一次發到兩邊", "一次发到两边", "Publish once")}</h1>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{tx("只用 Instagram 與 Threads 官方接口。", "只用 Instagram 与 Threads 官方接口。", "Official Instagram and Threads APIs only.")}</p>
          </div>
          <Link to="/account" className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-line bg-paper/70 px-4 text-sm text-ink-soft">← {tx("後台", "后台", "Console")}</Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2" aria-label={tx("連接狀態", "连接状态", "Connection status")}>
          {(["threads", "instagram"] as const).map((channel) => {
            const connected = configuration?.[channel] === true;
            return (
              <div key={channel} className="rounded-lg border border-line bg-paper/45 px-3 py-3">
                <p className="text-sm font-medium capitalize text-ink">{channel === "threads" ? "Threads" : "Instagram"}</p>
                <p className={`mt-1 text-xs ${connected ? "text-emerald-800" : "text-ink-mute"}`}>{connected ? tx("已連接", "已连接", "Connected") : tx("待連接", "待连接", "Not connected")}</p>
              </div>
            );
          })}
        </div>
        {statusError ? <p className="mt-3 text-sm text-cinnabar">{statusError}</p> : null}
        {configuration && connectedCount === 0 ? (
          <p className="mt-4 rounded-lg border border-line bg-paper/40 px-4 py-3 text-sm leading-6 text-ink-soft" data-social-connection-required>
            {tx("發布器已裝好。完成一次 Meta 授權後，這裡就能直接發文。", "发布器已装好。完成一次 Meta 授权后，这里就能直接发文。", "The publisher is ready. Complete Meta authorization once to start posting here.")}
          </p>
        ) : null}
      </section>

      <form onSubmit={(event) => void publish(event)} className="seal-border rounded-[1.35rem] bg-cream/95 p-5 sm:p-7">
        <label className="block text-sm font-medium text-ink" htmlFor="social-text">{tx("貼文文字", "贴文文字", "Post text")}</label>
        <textarea
          id="social-text"
          value={text}
          onChange={(event) => { setText(event.target.value); setResults(null); }}
          rows={8}
          maxLength={2200}
          className="mt-2 w-full resize-y rounded-lg border border-line bg-paper/55 px-4 py-3 text-base leading-7 text-ink outline-none focus:border-cinnabar"
          placeholder={tx("今天要說什麼？", "今天要说什么？", "What do you want to publish?")}
        />
        <div className="mt-1 flex justify-between gap-3 text-xs text-ink-mute">
          <span>Threads {threadsBytes}/500 bytes</span>
          <span>Instagram {[...text].length}/2200</span>
        </div>

        <label className="mt-5 block text-sm font-medium text-ink" htmlFor="social-image">{tx("圖片網址（Instagram 必填）", "图片网址（Instagram 必填）", "Public image URL (required for Instagram)")}</label>
        <input
          id="social-image"
          type="url"
          inputMode="url"
          value={imageUrl}
          onChange={(event) => { setImageUrl(event.target.value); setResults(null); }}
          className="mt-2 min-h-12 w-full rounded-lg border border-line bg-paper/55 px-4 text-base text-ink outline-none focus:border-cinnabar"
          placeholder="https://…"
        />
        {imageUrl ? (
          <label className="mt-3 block text-sm text-ink-soft" htmlFor="social-alt">
            {tx("圖片說明（選填）", "图片说明（选填）", "Image description (optional)")}
            <input id="social-alt" value={altText} maxLength={1000} onChange={(event) => setAltText(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-line bg-paper/55 px-4 text-sm text-ink outline-none focus:border-cinnabar" />
          </label>
        ) : null}

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-ink">{tx("發到哪裡", "发到哪里", "Publish to")}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["threads", "instagram"] as const).map((channel) => {
              const connected = configuration?.[channel] === true;
              return (
                <label key={channel} className={`flex min-h-12 items-center gap-3 rounded-lg border px-4 ${connected ? "cursor-pointer border-line bg-paper/55" : "cursor-not-allowed border-line/60 bg-paper/25 opacity-55"}`}>
                  <input type="checkbox" disabled={!connected || busy} checked={channels.includes(channel)} onChange={() => toggle(channel)} />
                  <span className="text-sm font-medium text-ink">{channel === "threads" ? "Threads" : "Instagram"}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {formError ? <p className="mt-4 rounded-lg border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm text-cinnabar" role="alert">{formError}</p> : null}
        {results ? (
          <div className="mt-4 space-y-2" aria-live="polite">
            {channels.map((channel) => {
              const result = results[channel];
              return (
                <p key={channel} className={`rounded-lg border px-4 py-3 text-sm ${result?.ok ? "border-emerald-700/25 bg-emerald-700/5 text-emerald-800" : "border-cinnabar/30 bg-cinnabar/5 text-cinnabar"}`}>
                  {channel === "threads" ? "Threads" : "Instagram"} · {result?.ok ? tx("發布成功", "发布成功", "Published") : result?.message || tx("發布失敗", "发布失败", "Failed")}
                </p>
              );
            })}
          </div>
        ) : null}

        <button type="submit" disabled={busy || !configuration?.ready} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-cinnabar px-5 text-base font-medium text-cream disabled:cursor-not-allowed disabled:opacity-45">
          {busy ? tx("正在發布…", "正在发布…", "Publishing…") : tx("立即發布", "立即发布", "Publish now")}
        </button>
      </form>
    </main>
  );
}
