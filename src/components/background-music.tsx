import { useEffect, useRef, useState } from "react";
import { getActiveBackgroundMusic, musicPublicUrl, type BackgroundMusicAsset } from "@/lib/background-music-assets";
import { useI18n } from "@/lib/i18n";

const FALLBACK_PRIMARY = "https://plgpxusmemnmzckbwtiv.supabase.co/storage/v1/object/public/zhaowu-audio/background/jingfo-shengyuan-aac.m4a";
const STORAGE_KEY = "zhaowu.backgroundMusic.v2";
const SESSION_REQUEST_KEY = "zhaowu.backgroundMusic.requested.v2";
const DEFAULT_VOLUME = 0.24;
const MOBILE_DOCK_BOTTOM = "max(5rem, calc(env(safe-area-inset-bottom, 0px) + 4rem))";

function readInitialPreference() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "on"
      && window.sessionStorage.getItem(SESSION_REQUEST_KEY) === "on";
  } catch {
    return false;
  }
}

export function BackgroundMusic() {
  const { locale } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialPreference = readInitialPreference;
  const [enabled, setEnabled] = useState(initialPreference);
  const [requested, setRequested] = useState(initialPreference);
  const [playing, setPlaying] = useState(false);
  const [asset, setAsset] = useState<BackgroundMusicAsset | null>(null);

  async function refreshAsset() {
    const next = await getActiveBackgroundMusic().catch(() => null);
    setAsset(next);
    if (next?.id) {
      try { window.localStorage.setItem(`${STORAGE_KEY}.track`, next.id); } catch {}
    }
  }

  useEffect(() => {
    if (!requested) return;
    void refreshAsset();
  }, [requested]);

  useEffect(() => {
    const onChange = () => {
      if (requested) void refreshAsset();
    };
    window.addEventListener("zhaowu-music-change", onChange);
    return () => window.removeEventListener("zhaowu-music-change", onChange);
  }, [requested]);

  const primarySrc = requested ? (musicPublicUrl(asset?.storage_path) || FALLBACK_PRIMARY) : null;
  const fallbackSrc = requested ? musicPublicUrl(asset?.fallback_storage_path) : null;
  const primaryType = asset?.content_type || "audio/mp4";
  const fallbackType = asset?.fallback_content_type || "audio/mpeg";
  const musicTitle = asset?.name || (locale === "en" ? "Zhaowu background music" : "淨佛聖願");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    if (!requested || !primarySrc) {
      audio.pause();
      audio.load();
      setPlaying(false);
      return;
    }
    audio.load();
    if (enabled) {
      audio.volume = DEFAULT_VOLUME;
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [enabled, requested, primarySrc, fallbackSrc, primaryType, fallbackType]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
      if (requested) window.sessionStorage.setItem(SESSION_REQUEST_KEY, "on");
      else window.sessionStorage.removeItem(SESSION_REQUEST_KEY);
    } catch {}
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = DEFAULT_VOLUME;
    if (!enabled || !requested) {
      audio.pause();
      setPlaying(false);
    }
  }, [enabled, requested]);

  const toggle = () => {
    const audio = audioRef.current;
    if (playing || (enabled && audio && !audio.paused)) {
      setEnabled(false);
      setRequested(false);
      return;
    }
    setEnabled(true);
    setRequested(true);
  };

  const label = locale === "en" ? `${playing ? "Pause" : "Play"} background music: ${musicTitle}` : locale === "zh-Hans" ? `${playing ? "暂停" : "播放"}背景音乐《${musicTitle}》` : `${playing ? "暫停" : "播放"}背景音樂《${musicTitle}》`;
  const statusLabel = locale === "en" ? (playing ? "Music playing" : "Play music") : locale === "zh-Hans" ? (playing ? "音乐播放中" : "播放音乐") : (playing ? "音樂播放中" : "播放音樂");

  return <>
    <audio ref={audioRef} loop playsInline data-music-loop="single" preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setPlaying(false)}>
      {requested && primarySrc ? <source src={primarySrc} type={primaryType} /> : null}
      {requested && fallbackSrc ? <source src={fallbackSrc} type={fallbackType} /> : null}
    </audio>
    <button type="button" data-background-music-control data-mobile-floating-control="music" aria-label={label} aria-pressed={playing} title={label} onClick={toggle}
      className="fixed z-[91] inline-grid h-11 w-11 place-items-center rounded-full border border-line/90 bg-cream/95 p-0 text-ink-soft shadow-md backdrop-blur transition hover:text-ink"
      style={{ right: "max(0.75rem, env(safe-area-inset-right, 0px))", bottom: MOBILE_DOCK_BOTTOM }}>
      <span aria-hidden="true" className="text-base leading-none">{playing ? "♫" : "♪"}</span><span className="sr-only">{statusLabel}</span>
    </button>
  </>;
}
