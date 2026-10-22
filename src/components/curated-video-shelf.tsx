import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n, type Locale } from "@/lib/i18n";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import "./curated-video-shelf.css";

export type VideoPlacement = "home" | "knowledge" | "mythic" | "atlas";

type GalleryVideo = {
  id: string;
  title: string;
  storage_path: string;
  bucket_id: string | null;
  content_type: string | null;
  tags: string[] | null;
  enabled: boolean;
  is_primary: boolean;
};
type VideoEntry = { id: string; name: string; url: string; mime: string };

const MAX_PER_PLACEMENT: Record<VideoPlacement, number> = {
  home: 2, knowledge: 3, mythic: 4, atlas: 30,
};

function tr(locale: Locale, zh: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : zh;
}

function videoLabel(video: GalleryVideo, index: number, locale: Locale) {
  const chosen = (video.tags ?? []).find((tag) => tag.startsWith("name:"))?.slice(5).trim();
  const original = chosen || video.title || "";
  const clean = original.replace(/\.(mp4|mov|m4v|webm|mkv)$/i, "").replace(/_/g, " ").trim();
  // Generic camera filenames and GUIDs are not meaningful visitor-facing titles.
  if (!clean || /^(?:[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}|VID[ _-]?\d+|_?users[ _-]|F48BAF)/i.test(clean) || clean.length > 70) {
    return tr(locale, "昭梧影像 " + (index + 1), "昭梧影像 " + (index + 1), "ZHAOWU film " + (index + 1));
  }
  return clean;
}

function videoPublicUrl(video: GalleryVideo) {
  if (!video.storage_path || video.storage_path.startsWith("/") || video.storage_path.includes("..") || !video.bucket_id) return null;
  if (video.bucket_id !== "zhaowu-gallery") return null;
  const safePath = video.storage_path.split("/").map(encodeURIComponent).join("/");
  return SUPABASE_URL + "/storage/v1/object/public/" + encodeURIComponent(video.bucket_id) + "/" + safePath;
}

function matchesPlacement(video: GalleryVideo, placement: VideoPlacement) {
  if (placement === "atlas") return true;
  const text = [video.title, ...(video.tags ?? [])].join(" ").toLowerCase();
  if (placement === "home") return video.is_primary || /宣傳|宣传|promo|開場|开场|opening|daejin/.test(text);
  if (placement === "knowledge") return /道法|太極|太极|文化|taiji|宣傳|宣传|promo|daejin/.test(text);
  return /神龍|神龙|天宮|天宫|天門|天门|古樹|古树|狐|梟|枭|貓頭鷹|猫头鹰|五境|神話|神话|mythic|dragon|owl/.test(text);
}

function chooseVideos(rows: GalleryVideo[], placement: VideoPlacement, locale: Locale): VideoEntry[] {
  const eligible = rows.filter((video) =>
    video.enabled === true &&
    (video.tags ?? []).includes("login-background") &&
    (video.content_type ?? "").startsWith("video/") &&
    Boolean(videoPublicUrl(video)),
  );
  const ordered = eligible.slice().sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const matches = ordered.filter((video) => matchesPlacement(video, placement));
  const selected = placement === "home" ? [...matches, ...ordered.filter((video) => !matches.includes(video))] : matches;
  return selected.slice(0, MAX_PER_PLACEMENT[placement]).map((video, index) => ({
    id: video.id,
    name: videoLabel(video, index, locale),
    url: videoPublicUrl(video) as string,
    mime: video.content_type || "video/mp4",
  }));
}

function FilmCard({ video, locale }: { video: VideoEntry; locale: Locale }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const play = () => {
    const node = videoRef.current;
    if (!node) return;
    setPlaying(true);
    const result = node.play();
    if (result) void result.catch(() => { setPlaying(false); setError(true); });
  };
  return (
    <article className="zw-video-shelf__card" data-video-item>
      <div className="zw-video-shelf__screen">
        <video
          ref={videoRef}
          src={video.url}
          controls={playing}
          preload="none"
          playsInline
          onError={() => setError(true)}
          onEnded={() => setPlaying(false)}
          aria-label={video.name}
        />
        {!playing && !error ? <button type="button" className="zw-video-shelf__play" onClick={play} aria-label={tr(locale, "播放：" + video.name, "播放：" + video.name, "Play: " + video.name)}>
          <span aria-hidden="true">▶</span>
          {tr(locale, "播放影片", "播放视频", "Play film")}
        </button> : null}
        {error ? <div className="zw-video-shelf__fallback">
          <p>{tr(locale, "此裝置無法直接播放這種影片格式。", "此设备无法直接播放这种视频格式。", "This format cannot play directly on this device.")}</p>
          <a href={video.url} target="_blank" rel="noopener noreferrer">{tr(locale, "開啟原始影片", "打开原始视频", "Open original film")}</a>
        </div> : null}
      </div>
      <h3>{video.name}</h3>
      {video.mime === "video/quicktime" ? <p className="zw-video-shelf__format">{tr(locale, "MOV · 若無法播放可開啟原檔", "MOV · 无法播放时可打开原文件", "MOV · Open original if unsupported")}</p> : null}
    </article>
  );
}

const FILM_ROWS_URL = SUPABASE_URL + "/rest/v1/gallery_assets?category=eq.loading&enabled=eq.true&select=id,title,storage_path,bucket_id,content_type,tags,enabled,is_primary&order=created_at.desc&limit=100";

// One shared request per page session, however many shelves are mounted. A failed request is not
// cached, so the next mount can retry.
let filmRowsPromise: Promise<GalleryVideo[]> | null = null;
function loadFilmRows(): Promise<GalleryVideo[]> {
  if (!filmRowsPromise) {
    filmRowsPromise = fetch(FILM_ROWS_URL, {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
    }).then((response) => {
      if (!response.ok) throw new Error("gallery fetch failed");
      return response.json() as Promise<GalleryVideo[]>;
    }).then((data) => (Array.isArray(data) ? data : [])).catch((error) => {
      filmRowsPromise = null;
      throw error;
    });
  }
  return filmRowsPromise;
}

/**
 * Existing owner-uploaded public films: no new Storage writes, auto-play, or first-visit gate.
 *
 * EMPTY_STATE_GATE: the shelf renders nothing until the catalogue has been read AND holds at least
 * one playable film for this placement. A load failure, an empty catalogue or a placement with no
 * match all hide the entry — the page never advertises a film gallery it cannot show
 * (owner rule 2026-10-23: no false ready state). The probe is deferred to idle time on every page
 * except the atlas, so Supabase stays off the home/knowledge critical path (r174).
 */
export function CuratedVideoShelf({ placement }: { placement: VideoPlacement }) {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<GalleryVideo[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      loadFilmRows()
        .then((data) => { if (!cancelled) setRows(data); })
        .catch(() => { if (!cancelled) setRows([]); });
    };
    if (placement === "atlas") {
      run();
      return () => { cancelled = true; };
    }
    const hasIdle = typeof window.requestIdleCallback === "function";
    const handle = hasIdle ? window.requestIdleCallback(run, { timeout: 4000 }) : window.setTimeout(run, 1500);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [placement]);

  const videos = useMemo(() => (rows ? chooseVideos(rows, placement, locale) : []), [rows, placement, locale]);
  if (videos.length === 0) return null;

  const title = {
    home: tr(locale, "昭梧影像 · 作品選映", "昭梧影像 · 作品选映", "ZHAOWU films · Selected works"),
    knowledge: tr(locale, "文化影像 · 選映", "文化影像 · 选映", "Culture · Short films"),
    mythic: tr(locale, "異聞影像 · 選映", "异闻影像 · 选映", "Mythic visions · Films"),
    atlas: tr(locale, "昭梧影像展廊", "昭梧影像展廊", "ZHAOWU film gallery"),
  }[placement];
  return (
    <details className="zw-video-shelf" data-video-shelf={placement} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>
        <span className="zw-video-shelf__heading">{title}</span>
        <span className="zw-video-shelf__hint">{tr(locale, "按需觀看，不自動播放", "按需观看，不自动播放", "Watch by choice · Never autoplays")}</span>
      </summary>
      {open ? <div className="zw-video-shelf__body">
        <div className="zw-video-shelf__grid">{videos.map((video) => <FilmCard key={video.id} video={video} locale={locale} />)}</div>
        {placement !== "atlas" ? <a className="zw-video-shelf__all" href="/auspicious-atlas">{tr(locale, "前往完整影像展廊 →", "前往完整影像展廊 →", "Browse the full film gallery →")}</a> : null}
      </div> : null}
    </details>
  );
}
