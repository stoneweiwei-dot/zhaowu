import { useEffect, useRef, useState } from "react";
import { OwnerBackgroundMusicManager } from "@/components/owner-background-music-manager";
import { getActiveBackgroundMusic, musicPublicUrl, type BackgroundMusicAsset } from "@/lib/background-music-assets";

const FALLBACK_PRIMARY = "https://plgpxusmemnmzckbwtiv.supabase.co/storage/v1/object/public/zhaowu-audio/background/jingfo-shengyuan-aac.m4a";
const STORAGE_KEY = "zhaowu.backgroundMusic.v1";
const DEFAULT_VOLUME = 0.24;

function readInitialPreference() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(readInitialPreference);
  const [playing, setPlaying] = useState(false);
  const [asset, setAsset] = useState<BackgroundMusicAsset | null>(null);

  async function refreshAsset() {
    const next = await getActiveBackgroundMusic().catch(() => null);
    setAsset(next);
  }

  useEffect(() => {
    void refreshAsset();
    const onChange = () => void refreshAsset();
    window.addEventListener("zhaowu-music-change", onChange);
    return () => window.removeEventListener("zhaowu-music-change", onChange);
  }, []);

  const primarySrc = musicPublicUrl(asset?.storage_path) || FALLBACK_PRIMARY;
  const fallbackSrc = musicPublicUrl(asset?.fallback_storage_path);
  const musicTitle = asset?.name || "淨佛聖願";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    setPlaying(false);
    if (enabled) {
      audio.volume = DEFAULT_VOLUME;
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [primarySrc, fallbackSrc]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    } catch {
      // Storage can be unavailable in private/restricted browser modes.
    }

    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = DEFAULT_VOLUME;

    if (!enabled) {
      audio.pause();
      setPlaying(false);
      return;
    }

    const tryPlay = () => {
      if (!audio.paused) {
        setPlaying(true);
        return;
      }
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };

    tryPlay();

    const unlockOnInteraction = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-background-music-control],[data-owner-background-music-manager]")) return;
      tryPlay();
    };

    window.addEventListener("touchstart", unlockOnInteraction, { passive: true });
    window.addEventListener("pointerdown", unlockOnInteraction, { passive: true });
    window.addEventListener("touchend", unlockOnInteraction, { passive: true });
    window.addEventListener("keydown", unlockOnInteraction);

    return () => {
      window.removeEventListener("touchstart", unlockOnInteraction);
      window.removeEventListener("pointerdown", unlockOnInteraction);
      window.removeEventListener("touchend", unlockOnInteraction);
      window.removeEventListener("keydown", unlockOnInteraction);
    };
  }, [enabled, primarySrc, fallbackSrc]);

  const toggle = () => {
    const audio = audioRef.current;
    if (enabled && audio && !audio.paused) {
      setEnabled(false);
      return;
    }

    setEnabled(true);
    if (!audio) return;
    audio.volume = DEFAULT_VOLUME;
    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const label = playing ? `暫停背景音樂《${musicTitle}》` : `播放背景音樂《${musicTitle}》`;

  return (
    <>
      <audio
        ref={audioRef}
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      >
        <source src={primarySrc} type="audio/mp4" />
        {fallbackSrc ? <source src={fallbackSrc} type="audio/mpeg" /> : null}
      </audio>
      <button
        type="button"
        data-background-music-control
        aria-label={label}
        aria-pressed={playing}
        title={label}
        onClick={toggle}
        className="fixed z-[55] inline-flex h-10 items-center gap-1.5 rounded-full border border-line/90 bg-cream/95 px-3 text-xs font-medium text-ink-soft shadow-sm backdrop-blur transition hover:text-ink"
        style={{
          left: "max(0.75rem, env(safe-area-inset-left))",
          bottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <span aria-hidden="true" className="text-sm leading-none">{playing ? "♫" : "♪"}</span>
        <span className="inline whitespace-nowrap">{playing ? "音樂播放中" : "播放音樂"}</span>
      </button>
      <OwnerBackgroundMusicManager />
    </>
  );
}
