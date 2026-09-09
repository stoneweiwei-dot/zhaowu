import { useEffect, useRef, useState } from "react";
import { getActiveBackgroundMusic, musicPublicUrl, type BackgroundMusicAsset } from "@/lib/background-music-assets";
import { useI18n } from "@/lib/i18n";

const FALLBACK_PRIMARY = "https://plgpxusmemnmzckbwtiv.supabase.co/storage/v1/object/public/zhaowu-audio/background/jingfo-shengyuan-aac.m4a";
const STORAGE_KEY = "zhaowu.backgroundMusic.v1";
const TRACK_KEY = "zhaowu.backgroundMusic.track.v1";
const DEFAULT_VOLUME = 0.24;
const MOBILE_DOCK_BOTTOM = "max(5rem, calc(env(safe-area-inset-bottom, 0px) + 4rem))";

function readInitialPreference() {
  if (typeof window === "undefined") return true;
  try { return window.localStorage.getItem(STORAGE_KEY) !== "off"; } catch { return true; }
}

export function BackgroundMusic() {
  const { locale } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(readInitialPreference);
  const [playing, setPlaying] = useState(false);
  const [asset, setAsset] = useState<BackgroundMusicAsset | null>(null);

  async function refreshAsset() { const next = await getActiveBackgroundMusic().catch(() => null); setAsset(next); if (next?.id) { try { window.localStorage.setItem(TRACK_KEY, next.id); } catch {} } }
  useEffect(() => { void refreshAsset(); const onChange = () => void refreshAsset(); window.addEventListener("zhaowu-music-change", onChange); return () => window.removeEventListener("zhaowu-music-change", onChange); }, []);

  const primarySrc = musicPublicUrl(asset?.storage_path) || FALLBACK_PRIMARY;
  const fallbackSrc = musicPublicUrl(asset?.fallback_storage_path);
  const primaryType = asset?.content_type || "audio/mp4";
  const fallbackType = asset?.fallback_content_type || "audio/mpeg";
  const musicTitle = asset?.name || (locale === "en" ? "Zhaowu background music" : "淨佛聖願");

  useEffect(() => {
    const audio = audioRef.current; if (!audio) return; audio.loop = true; audio.load(); setPlaying(false);
    if (enabled) { audio.volume = DEFAULT_VOLUME; void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
  }, [enabled, primarySrc, fallbackSrc, primaryType, fallbackType]);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off"); } catch {}
    const audio = audioRef.current; if (!audio) return; audio.volume = DEFAULT_VOLUME;
    if (!enabled) { audio.pause(); setPlaying(false); return; }
    const tryPlay = () => { if (!audio.paused) { setPlaying(true); return; } void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); };
    tryPlay();
    const unlockOnInteraction = (event: Event) => { const target = event.target; if (target instanceof Element && target.closest("[data-background-music-control],[data-owner-background-music-manager]")) return; tryPlay(); };
    window.addEventListener("touchstart", unlockOnInteraction, { passive: true });
    window.addEventListener("pointerdown", unlockOnInteraction, { passive: true });
    window.addEventListener("touchend", unlockOnInteraction, { passive: true });
    window.addEventListener("keydown", unlockOnInteraction);
    return () => { window.removeEventListener("touchstart", unlockOnInteraction); window.removeEventListener("pointerdown", unlockOnInteraction); window.removeEventListener("touchend", unlockOnInteraction); window.removeEventListener("keydown", unlockOnInteraction); };
  }, [enabled, primarySrc, fallbackSrc]);

  const toggle = () => {
    const audio = audioRef.current;
    if (enabled && audio && !audio.paused) { setEnabled(false); return; }
    setEnabled(true); if (!audio) return; audio.volume = DEFAULT_VOLUME; void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const label = locale === "en" ? `${playing ? "Pause" : "Play"} background music: ${musicTitle}` : locale === "zh-Hans" ? `${playing ? "暂停" : "播放"}背景音乐《${musicTitle}》` : `${playing ? "暫停" : "播放"}背景音樂《${musicTitle}》`;
  const statusLabel = locale === "en" ? (playing ? "Music playing" : "Play music") : locale === "zh-Hans" ? (playing ? "音乐播放中" : "播放音乐") : (playing ? "音樂播放中" : "播放音樂");

  return <>
    <audio ref={audioRef} loop playsInline data-music-loop="single" preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setPlaying(false)}>
      <source src={primarySrc} type={primaryType} />{fallbackSrc ? <source src={fallbackSrc} type={fallbackType} /> : null}
    </audio>
    <button type="button" data-background-music-control data-mobile-floating-control="music" aria-label={label} aria-pressed={playing} title={label} onClick={toggle}
      className="fixed z-[91] inline-grid h-11 w-11 place-items-center rounded-full border border-line/90 bg-cream/95 p-0 text-ink-soft shadow-md backdrop-blur transition hover:text-ink"
      style={{ right: "max(0.75rem, env(safe-area-inset-right, 0px))", bottom: MOBILE_DOCK_BOTTOM }}>
      <span aria-hidden="true" className="text-base leading-none">{playing ? "♫" : "♪"}</span><span className="sr-only">{statusLabel}</span>
    </button>
  </>;
}
