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
  disconnectMetaAccount,
  disconnectThreadsAccount,
  publishOwnerSocialPost,
  readSocialConfiguration,
  startMetaConnection,
  startThreadsConnection,
  type SocialChannel,
  type SocialConfiguration,
  type SocialPublishResult,
} from "@/lib/owner-social-client";
import { SUPABASE_STORAGE_WRITES_PAUSED } from "@/lib/storage-write-policy";

export const Route = createFileRoute("/social")({ component: SocialPublisherPage });

const CHANNELS: SocialChannel[] = ["instagram", "facebook", "threads"];
const GALLERY_LIMIT = 12;

const CHANNEL_LABEL: Record<SocialChannel, string> = { instagram: "Instagram", facebook: "Facebook", threads: "Threads" };

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

export function SocialPublisherPage({ embedded = false }: { embedded?: boolean }) {
  const Container = embedded ? "div" : "main";
  const Title = embedded ? "h2" : "h1";
  const { locale } = useI18n();
  const { user, session, isPending } = useCurrentUserState();
  const [configuration, setConfiguration] = useState<SocialConfiguration | null>(null);
  const [statusError, setStatusError] = useState("");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [threadAccountIds, setThreadAccountIds] = useState<string[]>([]);
  const [metaAccountIds, setMetaAccountIds] = useState<string[]>([]);
  const [connectionNotice, setConnectionNotice] = useState("");
  const [results, setResults] = useState<Partial<Record<SocialChannel, SocialPublishResult>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [showAllAssets, setShowAllAssets] = useState(false);
  const [xhsNotice, setXhsNotice] = useState("");
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
        setThreadAccountIds((current) => current.length ? current : next.threadsAccounts.map((account) => account.id));
        setMetaAccountIds((current) => current.length ? current : next.metaAccounts.map((account) => account.id));
      })
      .catch(() => { if (!cancelled) setStatusError(tx("無法讀取平台連接狀態。", "无法读取平台连接状态。", "Could not read platform connection status.")); });
    return () => { cancelled = true; };
  }, [user?.isOwner, locale]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("threads");
    if (result === "connected") setConnectionNotice(tx(`Threads @${params.get("username") || ""} 已連接。`, `Threads @${params.get("username") || ""} 已连接。`, `Threads @${params.get("username") || ""} connected.`));
    if (result === "error") setStatusError(tx("Threads 授權失敗，請重新連接。", "Threads 授权失败，请重新连接。", "Threads authorization failed. Please try again."));
    const metaResult = params.get("meta");
    if (metaResult === "connected") setConnectionNotice(tx(`Meta 已連接 ${params.get("pages") || ""} 個粉絲專頁。`, `Meta 已连接 ${params.get("pages") || ""} 个粉丝专页。`, `Meta connected ${params.get("pages") || ""} Page(s).`));
    if (metaResult === "error") setStatusError(tx("Meta 授權失敗，請重新連接。", "Meta 授权失败，请重新连接。", "Meta authorization failed. Please try again."));
  }, [locale]);

  useEffect(() => {
    if (user?.isOwner && session) void loadGallery();
  }, [user?.isOwner, session?.access_token]);

  const connectedCount = Number(configuration?.threads) + Number(configuration?.instagram) + Number(configuration?.facebook);
  const threadsBytes = useMemo(() => new TextEncoder().encode(text.trim()).length, [text]);
  const selectedAsset = useMemo(() => assets.find((asset) => asset.id === selectedAssetId) ?? null, [assets, selectedAssetId]);
  const visibleAssets = showAllAssets ? assets : assets.slice(0, GALLERY_LIMIT);
  const previewUrl = selectedAsset ? assetUrl(selectedAsset) : imageUrl.trim();
  const publishLabel = channels.length
    ? `${tx("發布到", "发布到", "Publish to")} ${channels.map((channel) => CHANNEL_LABEL[channel]).join(" + ")}`
    : tx("選擇發布平台", "选择发布平台", "Choose a channel");
  const xhsTitle = useMemo(() => {
    const firstLine = text.trim().split(/\r?\n/).find(Boolean) || tx("今日的命理提醒", "今日的命理提醒", "A note for today");
    return firstLine.replace(/^#+\s*/, "").slice(0, 28);
  }, [text, locale]);
  const xhsTags = useMemo(() => {
    const keywords = ["昭梧", "命理", "八字", "人生觀察"];
    const found = keywords.filter((keyword) => text.includes(keyword));
    return [...new Set([...found, "自我探索", "傳統文化"])].slice(0, 5).map((tag) => `#${tag}`).join(" ");
  }, [text]);
  const xhsContent = `${xhsTitle}\n\n${text.trim()}\n\n${xhsTags}`.trim();

  function toggle(channel: SocialChannel) {
    setChannels((current) => current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]);
    if (channel === "threads" && !channels.includes("threads") && !threadAccountIds.length) {
      setThreadAccountIds(configuration?.threadsAccounts.map((account) => account.id) ?? []);
    }
    if ((channel === "instagram" || channel === "facebook") && !channels.includes(channel) && !metaAccountIds.length) {
      setMetaAccountIds(configuration?.metaAccounts.map((account) => account.id) ?? []);
    }
    setResults(null);
  }

  function toggleThreadAccount(id: string) {
    setThreadAccountIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setResults(null);
  }

  function toggleMetaAccount(id: string) {
    setMetaAccountIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setResults(null);
  }

  async function connectThreads() {
    setBusy(true);
    setStatusError("");
    try {
      window.location.assign(await startThreadsConnection());
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : tx("無法開始 Threads 授權。", "无法开始 Threads 授权。", "Could not start Threads authorization."));
      setBusy(false);
    }
  }

  async function disconnectThread(id: string) {
    setBusy(true);
    setStatusError("");
    try {
      await disconnectThreadsAccount(id);
      const next = await readSocialConfiguration();
      setConfiguration(next);
      setThreadAccountIds((current) => current.filter((item) => item !== id));
      if (!next.threads) setChannels((current) => current.filter((channel) => channel !== "threads"));
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : tx("無法移除 Threads 帳號。", "无法移除 Threads 账号。", "Could not remove Threads account."));
    } finally {
      setBusy(false);
    }
  }

  async function connectMeta() {
    setBusy(true);
    setStatusError("");
    try {
      window.location.assign(await startMetaConnection());
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : tx("無法開始 Meta 授權。", "无法开始 Meta 授权。", "Could not start Meta authorization."));
      setBusy(false);
    }
  }

  async function disconnectMeta(id: string) {
    setBusy(true);
    setStatusError("");
    try {
      await disconnectMetaAccount(id);
      const next = await readSocialConfiguration();
      setConfiguration(next);
      setMetaAccountIds((current) => current.filter((item) => item !== id));
      if (!next.instagram) setChannels((current) => current.filter((channel) => channel !== "instagram"));
      if (!next.facebook) setChannels((current) => current.filter((channel) => channel !== "facebook"));
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : tx("無法移除 Meta 帳號。", "无法移除 Meta 账号。", "Could not remove Meta account."));
    } finally {
      setBusy(false);
    }
  }

  function chooseAsset(asset: GalleryAsset) {
    setSelectedAssetId(asset.id);
    setImageUrl(assetUrl(asset));
    if (!altText.trim()) setAltText(asset.title || "昭梧");
    setResults(null);
    setFormError("");
  }

  async function copyXhsContent() {
    if (!text.trim()) {
      setXhsNotice(tx("先寫一段貼文文字。", "先写一段帖子文字。", "Write the post text first."));
      return;
    }
    try {
      await navigator.clipboard.writeText(xhsContent);
      setXhsNotice(tx("小紅書標題、正文與標籤已複製。", "小红书标题、正文和标签已复制。", "Xiaohongshu title, body and tags copied."));
    } catch {
      setXhsNotice(tx("瀏覽器未允許自動複製，請手動選取內容。", "浏览器不允许自动复制，请手动选择内容。", "Clipboard access was blocked; select the text manually."));
    }
  }

  function openXhs() {
    window.open("https://www.xiaohongshu.com/explore", "_blank", "noopener,noreferrer");
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
    if (channels.includes("threads") && configuration?.threadsAccounts.length && !threadAccountIds.length) {
      setFormError(tx("請至少選一個 Threads 帳號。", "请至少选一个 Threads 账号。", "Choose at least one Threads account."));
      return;
    }
    if ((channels.includes("instagram") || channels.includes("facebook")) && configuration?.metaAccounts.length && !metaAccountIds.length) {
      setFormError(tx("請至少選一個 Meta 粉絲專頁。", "请至少选一个 Meta 粉丝专页。", "Choose at least one Meta Page."));
      return;
    }
    if (channels.includes("instagram") && !imageUrl.trim()) {
      setFormError(tx("Instagram 需要一張圖片；請從圖庫選擇或直接上傳。", "Instagram 需要一张图片；请从图库选择或直接上传。", "Instagram needs an image. Choose one from the gallery or upload one."));
      return;
    }
    setBusy(true);
    try {
      setResults(await publishOwnerSocialPost({ text, imageUrl, altText, channels, threadAccountIds, metaAccountIds }));
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
        <Link to="/login" className="mt-5 inline-flex min-h-11 items-center rounded-sm bg-cinnabar px-5 text-cream">{tx("登入", "登录", "Sign in")}</Link>
      </section>
    </main>
  );
  if (!user.isOwner) return (
    <main className="mx-auto max-w-xl">
      <section className="seal-border rounded-xl bg-cream/95 p-6">
        <h1 className="font-display text-3xl">{tx("社交發布僅限站主", "社交发布仅限站主", "Social publishing is owner-only")}</h1>
        <Link to="/" className="mt-5 inline-flex min-h-11 items-center rounded-sm border border-line bg-paper px-5">← {tx("首頁", "首页", "Home")}</Link>
      </section>
    </main>
  );

  return (
    <Container className="mx-auto max-w-2xl space-y-4 pb-14" data-owner-social-publisher>
      <section className="seal-border rounded-[1.35rem] bg-cream/95 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.22em] text-cinnabar">SOCIAL PUBLISHER</p>
            <Title className="mt-1 font-display text-3xl">{tx("一次發到多個帳號", "一次发到多个账号", "Publish to multiple accounts")}</Title>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{tx("寫一次，可同時送到 Instagram、Facebook 粉絲專頁與多個 Threads。", "写一次，可同时发送到 Instagram、Facebook 粉丝专页与多个 Threads。", "Write once, then publish to Instagram, Facebook Pages, and multiple Threads accounts.")}</p>
          </div>
          {!embedded ? <Link to="/account" className="inline-flex min-h-11 shrink-0 items-center rounded-sm border border-line bg-paper/70 px-4 text-sm text-ink-soft">← {tx("後台", "后台", "Console")}</Link> : null}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2" aria-label={tx("平台連接", "平台连接", "Platform connections")}>
          {CHANNELS.map((channel) => {
            const connected = configuration?.[channel] === true;
            return (
              <div key={channel} className={`rounded-xl border px-3 py-3 ${connected ? "border-wood/30 bg-wood/5" : "border-line bg-paper/35"}`}>
                <p className="text-sm font-medium text-ink">{CHANNEL_LABEL[channel]}</p>
                {channel !== "facebook" && configuration?.targets?.[channel] ? <p className="mt-1 text-xs font-medium text-ink-soft">@{configuration.targets[channel]}</p> : null}
                <p className={`mt-1 text-xs ${connected ? "text-wood" : "text-ink-mute"}`}>{connected ? tx("已連接並鎖定", "已连接并锁定", "Connected and locked") : tx("未連接", "未连接", "Not connected")}</p>
              </div>
            );
          })}
        </div>
        {configuration?.metaOauthReady ? (
          <div className="mt-4 rounded-xl border border-line bg-paper/35 p-4" data-meta-account-manager>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">Facebook + Instagram</p>
                <p className="mt-1 text-xs text-ink-mute">{tx("授權一次，自動讀取粉絲專頁與其 Instagram 專業帳號。", "授权一次，自动读取粉丝专页及其 Instagram 专业账号。", "Authorize once to load Pages and linked Instagram professional accounts.")}</p>
              </div>
              <button type="button" disabled={busy} onClick={() => void connectMeta()} className="inline-flex min-h-11 shrink-0 items-center rounded-sm bg-[#504940] px-4 text-xs font-medium text-[#fffaf0] disabled:opacity-45">
                {configuration.metaAccounts.length ? tx("重新授權", "重新授权", "Reconnect") : tx("＋連接 Meta", "＋连接 Meta", "+ Connect Meta")}
              </button>
            </div>
            {configuration.metaAccounts.length ? (
              <div className="mt-3 space-y-2">
                {configuration.metaAccounts.map((account) => (
                  <div key={account.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-line bg-cream/70 px-3 py-2">
                    {account.profilePictureUrl ? <img src={account.profilePictureUrl} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="h-9 w-9 rounded-full bg-paper-deep" />}
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={metaAccountIds.includes(account.id)} onChange={() => toggleMetaAccount(account.id)} disabled={busy} />
                      <span className="min-w-0"><span className="block truncate text-sm font-medium text-ink">{account.pageName}</span><span className="block truncate text-[11px] text-ink-mute">Facebook{account.instagramUsername ? ` · Instagram @${account.instagramUsername}` : ""}</span></span>
                    </label>
                    <button type="button" disabled={busy} onClick={() => void disconnectMeta(account.id)} className="min-h-9 px-2 text-xs text-cinnabar disabled:opacity-45">{tx("移除", "移除", "Remove")}</button>
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 text-xs leading-5 text-ink-mute">{tx("尚未連接。按一次「連接 Meta」，在 Facebook 畫面同意權限即可。", "尚未连接。按一次“连接 Meta”，在 Facebook 页面同意权限即可。", "Not connected. Use Connect Meta once and approve on Facebook.")}</p>}
          </div>
        ) : null}
        {configuration?.threadsOauthReady ? (
          <div className="mt-4 rounded-xl border border-line bg-paper/35 p-4" data-threads-account-manager>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{tx("Threads 帳號", "Threads 账号", "Threads accounts")}</p>
                <p className="mt-1 text-xs text-ink-mute">{tx("可連接多個帳號，發布時自由勾選。", "可连接多个账号，发布时自由勾选。", "Connect multiple accounts and choose targets for each post.")}</p>
              </div>
              <button type="button" disabled={busy} onClick={() => void connectThreads()} className="inline-flex min-h-11 shrink-0 items-center rounded-sm bg-[#504940] px-4 text-xs font-medium text-[#fffaf0] disabled:opacity-45">
                {tx("＋連接帳號", "＋连接账号", "+ Connect")}
              </button>
            </div>
            {configuration.threadsAccounts.length ? (
              <div className="mt-3 space-y-2">
                {configuration.threadsAccounts.map((account) => (
                  <div key={account.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-line bg-cream/70 px-3 py-2">
                    {account.profilePictureUrl ? <img src={account.profilePictureUrl} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="h-9 w-9 rounded-full bg-paper-deep" />}
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={threadAccountIds.includes(account.id)} onChange={() => toggleThreadAccount(account.id)} disabled={busy} />
                      <span className="truncate text-sm font-medium text-ink">@{account.username}</span>
                    </label>
                    <button type="button" disabled={busy} onClick={() => void disconnectThread(account.id)} className="min-h-9 px-2 text-xs text-cinnabar disabled:opacity-45">{tx("移除", "移除", "Remove")}</button>
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 text-xs leading-5 text-ink-mute">{tx("尚未連接 Threads。點「連接帳號」後登入要發布的 Threads 帳號；第二個帳號再連一次即可。", "尚未连接 Threads。点“连接账号”后登录要发布的 Threads 账号；第二个账号再连接一次即可。", "No Threads account connected yet. Connect once per account.")}</p>}
          </div>
        ) : null}
        {connectionNotice ? <p className="mt-3 rounded-lg border border-wood/25 bg-wood/5 px-4 py-3 text-sm text-wood">{connectionNotice}</p> : null}
        {statusError ? <p className="mt-3 text-sm text-cinnabar">{statusError}</p> : null}
        {configuration && connectedCount === 0 ? (
          <div className="mt-4 rounded-xl border border-cinnabar/25 bg-cinnabar/5 px-4 py-3" data-social-connection-required>
            <p className="text-sm font-medium text-ink">{tx("Meta 尚未連接", "Meta 尚未连接", "Meta is not connected")}</p>
            <p className="mt-1 text-xs leading-5 text-ink-soft">{configuration.threadsOauthReady
              ? tx("點上方連接按鈕完成官方授權。", "点上方连接按钮完成官方授权。", "Use the connection buttons above to authorize your accounts.")
              : tx("Meta 應用尚未配置完成。", "Meta 应用尚未配置完成。", "The Meta app is not configured yet.")}</p>
          </div>
        ) : null}
      </section>

      <form onSubmit={(event) => void publish(event)} className="seal-border rounded-[1.35rem] bg-cream/95 p-5 sm:p-7">
        <fieldset>
          <legend className="text-sm font-medium text-ink">{tx("1 · 發到哪裡", "1 · 发到哪里", "1 · Publish to")}</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
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
                  className={`min-h-12 rounded-xl border px-4 text-left text-sm font-medium ${selected ? "border-[#504940] bg-[#504940] text-[#fffaf0]" : connected ? "border-line bg-paper/55 text-ink" : "cursor-not-allowed border-line/60 bg-paper/25 text-ink-mute opacity-55"}`}
                >
                  {CHANNEL_LABEL[channel]}<span className="block text-[11px] font-normal opacity-75">{connected ? tx(selected ? "已選" : "可發布", selected ? "已选" : "可发布", selected ? "Selected" : "Ready") : tx("未連接", "未连接", "Not connected")}</span>
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

        <section className="mt-5 rounded-xl border border-[#c65b45]/25 bg-[#c65b45]/5 p-4" data-xiaohongshu-helper>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">小紅書半自動發布</p>
              <p className="mt-1 text-xs leading-5 text-ink-mute">自動整理標題、正文與標籤；複製後在小紅書貼上，再選擇上方圖片發布。</p>
            </div>
            <span className="shrink-0 rounded-sm bg-[#c65b45]/10 px-2 py-1 text-[10px] text-[#9e402f]">半自動</span>
          </div>
          <div className="mt-3 rounded-lg border border-line/70 bg-cream/70 p-3">
            <p className="text-sm font-medium text-ink">{xhsTitle}</p>
            <p className="mt-2 max-h-20 overflow-hidden whitespace-pre-wrap text-xs leading-5 text-ink-soft">{text.trim() || tx("輸入文字後會在這裡預覽。", "输入文字后会在这里预览。", "Your preview appears here after you type.")}</p>
            <p className="mt-2 text-xs text-[#9e402f]">{xhsTags}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => void copyXhsContent()} className="min-h-10 rounded-sm bg-[#c65b45] px-4 text-xs font-medium text-white">复制小红书内容</button>
            <button type="button" onClick={openXhs} className="min-h-10 rounded-sm border border-[#c65b45]/40 bg-cream px-4 text-xs text-[#9e402f]">打开小红书</button>
          </div>
          {xhsNotice ? <p className="mt-2 text-xs text-[#9e402f]" role="status">{xhsNotice}</p> : null}
        </section>

        <section className="mt-5" aria-label={tx("選擇圖片", "选择图片", "Choose image")}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">{tx("3 · 選圖片", "3 · 选图片", "3 · Choose image")}</p>
              <p className="mt-1 text-xs text-ink-mute">{tx("直接從昭梧圖庫選，或從手機上傳。", "直接从昭梧图库选，或从手机上传。", "Choose from the Zhaowu gallery or upload from your phone.")}</p>
            </div>
            <label className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-sm bg-[#504940] px-4 text-sm text-[#fffaf0] ${galleryBusy || SUPABASE_STORAGE_WRITES_PAUSED || !session ? "pointer-events-none opacity-45" : ""}`}>
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
                      className={`overflow-hidden rounded-xl border bg-paper/40 p-1 text-left ${selected ? "border-[#504940] ring-2 ring-[#504940]/20" : "border-line"}`}
                    >
                      <img src={src} alt={asset.title || tx("圖庫圖片", "图库图片", "Gallery image")} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
                      <span className="mt-1 block truncate px-1 pb-1 text-[10px] text-ink-mute">{asset.title}</span>
                    </button>
                  );
                })}
              </div>
              {assets.length > GALLERY_LIMIT ? <button type="button" onClick={() => setShowAllAssets((value) => !value)} className="mt-3 min-h-10 rounded-sm border border-line bg-paper/55 px-4 text-xs text-ink-soft">{showAllAssets ? tx("收起圖庫", "收起图库", "Show less") : tx(`查看更多（${assets.length}）`, `查看更多（${assets.length}）`, `Show all (${assets.length})`)}</button> : null}
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
                <div key={channel} className={`rounded-xl border px-4 py-3 text-sm ${result?.ok ? "border-wood/30 bg-wood/5 text-wood" : "border-cinnabar/30 bg-cinnabar/5 text-cinnabar"}`}>
                  <p>{CHANNEL_LABEL[channel]} · {result?.ok ? tx("發布完成", "发布完成", "Publishing completed") : result?.message || tx("發布失敗", "发布失败", "Failed")}</p>
                  {result?.accounts?.length ? (
                    <ul className="mt-2 space-y-1 border-t border-current/15 pt-2 text-xs">
                      {result.accounts.map((account) => <li key={account.accountId}>@{account.username} · {account.ok ? tx("成功", "成功", "Published") : account.message || tx("失敗", "失败", "Failed")}</li>)}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <button type="submit" disabled={busy || !configuration?.ready || !channels.length} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-cinnabar px-5 text-base font-medium text-cream disabled:cursor-not-allowed disabled:opacity-45">
          {busy ? tx("正在發布…", "正在发布…", "Publishing…") : publishLabel}
        </button>
      </form>
    </Container>
  );
}
