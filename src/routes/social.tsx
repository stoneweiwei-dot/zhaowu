import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  galleryPublicUrl,
  listOwnerGalleryAssets,
  uploadGalleryAsset,
  type GalleryAsset,
} from "@/lib/bridge/gallery-assets";
import { useI18n } from "@/lib/i18n";
import {
  publishOwnerSocialPost,
  readSocialConfiguration,
  type SocialChannel,
  type SocialConfiguration,
  type SocialPublishResult,
} from "@/lib/owner-social-client";
import { SUPABASE_STORAGE_WRITES_PAUSED } from "@/lib/storage-write-policy";

export const Route = createFileRoute("/social")({ component: SocialPublisherPage });

const CHANNELS: SocialChannel[] = ["instagram", "threads"];
const GALLERY_LIMIT = 12;

function assetUrl(asset: GalleryAsset) {
  const cdn = String(asset.cdn_url ?? "").trim();
  const raw = cdn.startsWith("https://") ? cdn : galleryPublicUrl(asset.storage_path, asset.bucket_id);
  if (typeof window !== "undefined" && raw.startsWith("/")) return new URL(raw, window.location.origin).toString();
  return raw;
}

function imageAsset(asset: GalleryAsset) {
  if (!asset.enabled) return false;
  if (asset.content_type?.startsWith("image/")) return true;
  return /\.(avif|gif|jpe?g|png|webp)(?:$|\?)/i.test(asset.storage_path);
}

function SocialPublisherPage() {
  const { locale } = useI18n();
  const { user, session, isPending } = useCurrentUserState();
  const [configuration, setConfiguration] = useState<SocialConfiguration | null>(null);
  const [statusError, setStatusError] = useState("");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [results, setResults] = useState<Partial<Record<SocialChannel, SocialPublishResult>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [showAllAssets, setShowAllAssets] = useState(false);
  const tx = (hant: string, hans: string, en: string) => locale === "en" ? en : locale === "zh-Hans" ? hans : hant;

  async function loadGallery() {
    if (!session) return;
    setGalleryBusy(true);
    try {
      const next = (await listOwnerGalleryAssets(session)).filter(imageAsset);
      setAssets(next);
    } catch {
      setStatusError(tx("圖庫讀取失敗。", "图库读取失败。", "Could not load the gallery."));
    } finally {
      setGalleryBusy(false);
    }
  }

  useEffect(() => {
    if (!user?.isOwner) return;
    let cancelled = false;
    void readSocialConfiguration()
      .then((next) => {
        if (cancelled) return;
        setConfiguration(next);
        setChannels((current) => current.length ? current : CHANNELS.filter((channel) => next[channel]));
      })
      .catch(() => { if (!cancelled) setStatusError(tx("無法讀取平台連接狀態。", "无法读取平台连接状态。", "Could not read platform connection status.")); });
    return () => { cancelled = true; };
  }, [user?.isOwner, locale]);

  useEffect(() => {
    if (user?.isOwner && session) void loadGallery();
  }, [user?.isOwner, session?.access_token]);

  const connectedCount = Number(configuration?.threads) + Number(configuration?.instagram);
  const threadsBytes = useMemo(() => new TextEncoder().encode(text.trim()).length, [text]);
  const selectedAsset = useMemo(() => assets.find((asset) => asset.id === selectedAssetId) ?? null, [assets, selectedAssetId]);
  const visibleAssets = showAllAssets ? assets : assets.slice(0, GALLERY_LIMIT);
  const previewUrl = selectedAsset ? assetUrl(selectedAsset) : imageUrl.trim();
  const publishLabel = channels.length === 2
    ? tx("一次發布到 Instagram + Threads", "一次发布到 Instagram + Threads", "Publish to Instagram + Threads")
    : channels[0] === "instagram"
      ? tx("發布到 Instagram", "发布到 Instagram", "Publish to Instagram")
      : channels[0] === "threads"
        ? tx("發布到 Threads", "发布到 Threads", "Publish to Threads")
        : tx("選擇發布平台", "选择发布平台", "Choose a channel");

  function toggle(channel: SocialChannel) {
    setChannels((current) => current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]);
    setResults(null);
  }

  function chooseAsset(asset: GalleryAsset) {
    setSelectedAssetId(asset.id);
    setImageUrl(assetUrl(asset));
    if (!altText.trim()) setAltText(asset.title || "昭梧");
    setResults(null);
    setFormError("");
  }

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !session) return;
    setGalleryBusy(true);
    setFormError("");
    try {
      const created = await uploadGalleryAsset(session, file, {
        category: "visual-library",
        tags: ["owner-upload", "social-publisher"],
        primary: false,
      });
      const next = [created, ...assets.filter((asset) => asset.id !== created.id)];
      setAssets(next);
      chooseAsset(created);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : tx("圖片上傳失敗。", "图片上传失败。", "Image upload failed."));
    } finally {
      setGalleryBusy(false);
    }
  }

  async function publish(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setResults(null);
    if (!channels.length) {
      setFormError(tx("先選一個平台。", "先选一个平台。", "Choose at least one channel."));
      return;
    }
    if (threadsBytes > 500 && channels.includes("threads")) {
      setFormError(tx("Threads 文字超過 500 bytes，請先縮短。", "Threads 文字超过 500 bytes，请先缩短。", "Threads text is over 500 bytes."));
      return;
    }
    if (channels.includes("instagram") && !imageUrl.trim()) {
      setFormError(tx("Instagram 需要一張圖片；請從圖庫選擇或直接上傳。", "Instagram 需要一张图片；请从图库选择或直接上传。", "Instagram needs an image. Choose one from the gallery or upload one."));
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
            <p className="mt-2 text-sm leading-6 text-ink-soft">{tx("寫一次、選一張圖，直接送到 Instagram 與 Threads。", "写一次、选一张图，直接送到 Instagram 与 Threads。", "Write once, choose one image, then publish to Instagram and Threads.")}</p>
          </div>
          <Link to="/account" className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-line bg-paper/70 px-4 text-sm text-ink-soft">← {tx("後台", "后台", "Console")}</Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2" aria-label={tx("平台連接", "平台连接", "Platform connections")}>
          {CHANNELS.map((channel) => {
            const connected = configuration?.[channel] === true;
            return (
              <div key={channel} className={`rounded-xl border px-3 py-3 ${connected ? "border-wood/30 bg-wood/5" : "border-line bg-paper/35"}`}>
                <p className="text-sm font-medium text-ink">{channel === "threads" ? "Threads" : "Instagram"}</p>
                {configuration?.targets?.[channel] ? <p className="mt-1 text-xs font-medium text-ink-soft">@{configuration.targets[channel]}</p> : null}
                <p className={`mt-1 text-xs ${connected ? "text-wood" : "text-ink-mute"}`}>{connected ? tx("已連接並鎖定", "已连接并锁定", "Connected and locked") : tx("未連接", "未连接", "Not connected")}</p>
              </div>
            );
          })}
        </div>
        {statusError ? <p className="mt-3 text-sm text-cinnabar">{statusError}</p> : null}
        {configuration && connectedCount === 0 ? (
          <div className="mt-4 rounded-xl border border-cinnabar/25 bg-cinnabar/5 px-4 py-3" data-social-connection-required>
            <p className="text-sm font-medium text-ink">{tx("Meta 尚未連接", "Meta 尚未连接", "Meta is not connected")}</p>
            <p className="mt-1 text-xs leading-5 text-ink-soft">{tx("正式站目前還沒有 Instagram／Threads 的伺服器憑證；發布器已鎖定到指定帳號，連接時若 Meta 回傳的是其他帳號，系統會直接拒絕發布。", "正式站目前还没有 Instagram／Threads 的服务器凭证；发布器已锁定到指定账号，连接时如果 Meta 返回的是其他账号，系统会直接拒绝发布。", "Production still has no Instagram/Threads server credentials. The publisher is locked to the selected account and will refuse to publish if Meta resolves to another account.")}</p>
            {configuration?.targets?.instagram ? <p className="mt-2 text-xs font-medium text-ink">{tx("目標帳號", "目标账号", "Target account")} · @{configuration.targets.instagram}</p> : null}
            <a
              href="https://developers.facebook.com/apps/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-11 items-center rounded-full border border-cinnabar/30 bg-cream px-4 text-xs font-medium text-cinnabar"
            >
              {tx("開啟 Meta Developers", "打开 Meta Developers", "Open Meta Developers")}
            </a>
            <details className="mt-2">
              <summary className="cursor-pointer text-[11px] text-ink-mute">{tx("需要連接的四項資料", "需要连接的四项数据", "Required server settings")}</summary>
              <code className="mt-2 block whitespace-pre-wrap rounded-lg bg-paper/55 p-2 text-[10px] leading-5 text-ink-soft">META_INSTAGRAM_USER_ID{"\n"}META_INSTAGRAM_ACCESS_TOKEN{"\n"}META_THREADS_USER_ID{"\n"}META_THREADS_ACCESS_TOKEN</code>
            </details>
          </div>
        ) : null}
      </section>

      <form onSubmit={(event) => void publish(event)} className="seal-border rounded-[1.35rem] bg-cream/95 p-5 sm:p-7">
        <fieldset>
          <legend className="text-sm font-medium text-ink">{tx("1 · 發到哪裡", "1 · 发到哪里", "1 · Publish to")}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {CHANNELS.map((channel) => {
              const connected = configuration?.[channel] === true;
              const selected = channels.includes(channel);
              return (
                <button
                  key={channel}
                  type="button"
                  disabled={!connected || busy}
                  aria-pressed={selected}
                  onClick={() => toggle(channel)}
                  className={`min-h-12 rounded-xl border px-4 text-left text-sm font-medium ${selected ? "border-[#315f51] bg-[#315f51] text-[#fffaf0]" : connected ? "border-line bg-paper/55 text-ink" : "cursor-not-allowed border-line/60 bg-paper/25 text-ink-mute opacity-55"}`}
                >
                  {channel === "threads" ? "Threads" : "Instagram"}<span className="block text-[11px] font-normal opacity-75">{connected ? tx(selected ? "已選" : "可發布", selected ? "已选" : "可发布", selected ? "Selected" : "Ready") : tx("未連接", "未连接", "Not connected")}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="mt-5 block text-sm font-medium text-ink" htmlFor="social-text">{tx("2 · 貼文文字", "2 · 贴文文字", "2 · Post text")}</label>
        <textarea
          id="social-text"
          value={text}
          onChange={(event) => { setText(event.target.value); setResults(null); }}
          rows={7}
          maxLength={2200}
          className="mt-2 w-full resize-y rounded-xl border border-line bg-paper/55 px-4 py-3 text-base leading-7 text-ink outline-none focus:border-cinnabar"
          placeholder={tx("今天要說什麼？", "今天要说什么？", "What do you want to publish?")}
        />

        <section className="mt-5" aria-label={tx("選擇圖片", "选择图片", "Choose image")}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">{tx("3 · 選圖片", "3 · 选图片", "3 · Choose image")}</p>
              <p className="mt-1 text-xs text-ink-mute">{tx("直接從昭梧圖庫選，或從手機上傳。", "直接从昭梧图库选，或从手机上传。", "Choose from the Zhaowu gallery or upload from your phone.")}</p>
            </div>
            <label className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full bg-[#315f51] px-4 text-sm text-[#fffaf0] ${galleryBusy || SUPABASE_STORAGE_WRITES_PAUSED || !session ? "pointer-events-none opacity-45" : ""}`}>
              {galleryBusy ? tx("處理中…", "处理中…", "Working…") : tx("＋上傳", "＋上传", "+ Upload")}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(event) => void onUpload(event)} />
            </label>
          </div>

          {galleryBusy && !assets.length ? <div className="mt-3 h-32 animate-pulse rounded-xl bg-paper-deep" /> : null}
          {!galleryBusy && !assets.length ? <p className="mt-3 rounded-xl border border-line bg-paper/35 px-4 py-3 text-sm text-ink-mute">{tx("圖庫目前沒有可用圖片；可以直接從手機上傳。", "图库目前没有可用图片；可以直接从手机上传。", "No usable gallery images yet. Upload one from your phone.")}</p> : null}
          {assets.length ? (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {visibleAssets.map((asset) => {
                  const selected = selectedAssetId === asset.id;
                  const src = assetUrl(asset);
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => chooseAsset(asset)}
                      className={`overflow-hidden rounded-xl border bg-paper/40 p-1 text-left ${selected ? "border-[#315f51] ring-2 ring-[#315f51]/20" : "border-line"}`}
                    >
                      <img src={src} alt={asset.title || tx("圖庫圖片", "图库图片", "Gallery image")} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
                      <span className="mt-1 block truncate px-1 pb-1 text-[10px] text-ink-mute">{asset.title}</span>
                    </button>
                  );
                })}
              </div>
              {assets.length > GALLERY_LIMIT ? <button type="button" onClick={() => setShowAllAssets((value) => !value)} className="mt-3 min-h-10 rounded-full border border-line bg-paper/55 px-4 text-xs text-ink-soft">{showAllAssets ? tx("收起圖庫", "收起图库", "Show less") : tx(`查看更多（${assets.length}）`, `查看更多（${assets.length}）`, `Show all (${assets.length})`)}</button> : null}
            </>
          ) : null}

          {previewUrl ? (
            <div className="mt-4 grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-xl border border-line bg-paper/35 p-3">
              <img src={previewUrl} alt={altText || selectedAsset?.title || "preview"} className="aspect-square w-[92px] rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink">{selectedAsset?.title || tx("外部圖片", "外部图片", "External image")}</p>
                <label className="mt-2 block text-[11px] text-ink-mute" htmlFor="social-alt">{tx("圖片說明", "图片说明", "Image description")}</label>
                <input id="social-alt" value={altText} maxLength={1000} onChange={(event) => setAltText(event.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-line bg-cream/80 px-3 text-sm text-ink outline-none focus:border-cinnabar" />
                <button type="button" onClick={() => { setSelectedAssetId(""); setImageUrl(""); setAltText(""); }} className="mt-2 text-xs text-cinnabar">{tx("移除圖片", "移除图片", "Remove image")}</button>
              </div>
            </div>
          ) : null}

          <details className="mt-3 rounded-xl border border-line/70 bg-paper/25">
            <summary className="cursor-pointer list-none px-4 py-3 text-xs text-ink-mute">{tx("進階：使用外部圖片網址", "高级：使用外部图片网址", "Advanced: external image URL")}</summary>
            <div className="border-t border-line/60 p-3">
              <input
                type="url"
                inputMode="url"
                value={selectedAsset ? "" : imageUrl}
                disabled={Boolean(selectedAsset)}
                onChange={(event) => { setSelectedAssetId(""); setImageUrl(event.target.value); setResults(null); }}
                className="min-h-11 w-full rounded-lg border border-line bg-cream/75 px-3 text-sm text-ink outline-none focus:border-cinnabar disabled:opacity-45"
                placeholder="https://…"
              />
            </div>
          </details>
        </section>

        <details className="mt-5 rounded-xl border border-line/70 bg-paper/25">
          <summary className="cursor-pointer list-none px-4 py-3 text-xs text-ink-mute">{tx("平台限制與字數", "平台限制与字数", "Platform limits")}</summary>
          <div className="grid grid-cols-2 gap-3 border-t border-line/60 px-4 py-3 text-xs text-ink-mute">
            <span>Threads · {threadsBytes}/500 bytes</span>
            <span>Instagram · {[...text].length}/2200</span>
          </div>
        </details>

        {formError ? <p className="mt-4 rounded-xl border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm text-cinnabar" role="alert">{formError}</p> : null}
        {results ? (
          <div className="mt-4 grid gap-2" aria-live="polite">
            {channels.map((channel) => {
              const result = results[channel];
              return (
                <p key={channel} className={`rounded-xl border px-4 py-3 text-sm ${result?.ok ? "border-wood/30 bg-wood/5 text-wood" : "border-cinnabar/30 bg-cinnabar/5 text-cinnabar"}`}>
                  {channel === "threads" ? "Threads" : "Instagram"} · {result?.ok ? tx("發布成功", "发布成功", "Published") : result?.message || tx("發布失敗", "发布失败", "Failed")}
                </p>
              );
            })}
          </div>
        ) : null}

        <button type="submit" disabled={busy || !configuration?.ready || !channels.length} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-cinnabar px-5 text-base font-medium text-cream disabled:cursor-not-allowed disabled:opacity-45">
          {busy ? tx("正在發布…", "正在发布…", "Publishing…") : publishLabel}
        </button>
      </form>
    </main>
  );
}
