import { useCallback, useEffect, useRef, useState } from "react";
import { loadOwnerMusic } from "@/lib/owner-music-client";
import { useI18n } from "@/lib/i18n";

const STORAGE_KEY = "zhaowu.backgroundMusic.v3";
const LEGACY_STORAGE_KEY = "zhaowu.backgroundMusic.v1";
const DEFAULT_VOLUME = 0.24;
const MUSIC_STREAM_URL = "/api/owner-music?stream=1";
const MOBILE_DOCK_BOTTOM = "max(5rem, calc(env(safe-area-inset-bottom, 0px) + 4rem))";

function readInitialPreference() {
  if (typeof window === "undefined") return true;
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current === "off") return false;
    if (current === "on") return true;
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    return legacy !== "off";
  } catch {
    return true;
  }
}

export function BackgroundMusic() {
  const { locale } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockStartedRef = useRef(false);
  const [enabled, setEnabled] = useState(readInitialPreference);
  const [requested, setRequested] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState<{ id: string; name: string; url: string; contentType: string } | null>(null);

  const refreshAsset = useCallback(async () => {
    const next = await loadOwnerMusic().catch(() => null);
    const active = next?.active ?? null;
    setTrack(active);
    if (active?.id) {
      try { window.localStorage.setItem(`${STORAGE_KEY}.track`, active.id); } catch {}
    }
    return active;
  }, []);

  const primarySrc = MUSIC_STREAM_URL;
  const primaryType = track?.contentType || undefined;
  const activeMusicType = primaryType || "audio/mpeg";
  // Owner uploads play from /api/owner-music. jingfo-shengyuan-aac.m4a / musicPublicUrl stay unused while Supabase spend cap returns 402.
  const musicTitle = track?.name || (locale === "en" ? "Zhaowu background music" : "昭梧背景音樂");

  // Keep metadata/API work idle until playback is actually requested. The audio
  // element already owns a same-origin stream URL, so Safari can start it inside
  // the original gesture without waiting for this JSON request.
  useEffect(() => {
    if (!requested) return;
    void refreshAsset();
  }, [requested, refreshAsset]);

  useEffect(() => {
    const onChange = () => {
      if (!requested) return;
      const audio = audioRef.current;
      if (!audio) return;
      const resume = enabled && !audio.paused;
      void refreshAsset().finally(() => {
        audio.load();
        if (resume) void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      });
    };
    window.addEventListener("zhaowu-music-change", onChange);
    return () => window.removeEventListener("zhaowu-music-change", onChange);
  }, [enabled, requested, refreshAsset]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    } catch {}

    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = DEFAULT_VOLUME;
    if (!enabled) {
      audio.pause();
      setPlaying(false);
    }
  }, [enabled]);

  // iPhone/iPad Safari requires play() to run while the user gesture is still
  // active. MUSIC_STREAM_URL resolves the active owner track server-side, so no
  // client fetch/await is allowed before this play() call.
  useEffect(() => {
    if (!enabled || requested) return;

    const unlock = () => {
      if (unlockStartedRef.current) return;
      const audio = audioRef.current;
      if (!audio) return;
      unlockStartedRef.current = true;
      setRequested(true);
      audio.loop = true;
      audio.volume = DEFAULT_VOLUME;
      void audio.play().then(() => setPlaying(true)).catch(() => {
        unlockStartedRef.current = false;
        setPlaying(false);
      });
    };

    const opts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("touchend", unlock, opts);
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchend", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [enabled, requested]);

  const toggle = () => {
    const audio = audioRef.current;
    if (playing || (enabled && requested && audio && !audio.paused)) {
      setEnabled(false);
      setRequested(false);
      unlockStartedRef.current = false;
      audio?.pause();
      setPlaying(false);
      return;
    }

    setEnabled(true);
    setRequested(true);
    unlockStartedRef.current = true;
    if (!audio) {
      setPlaying(false);
      return;
    }
    audio.loop = true;
    audio.volume = DEFAULT_VOLUME;
    // Keep play() synchronous with the button click for iPhone/iPad Safari.
    void audio.play().then(() => setPlaying(true)).catch(() => {
      unlockStartedRef.current = false;
      setPlaying(false);
    });
  };

  const label = locale === "en"
    ? `${playing ? "Pause" : "Play"} background music: ${musicTitle}`
    : locale === "zh-Hans"
      ? `${playing ? "暂停" : "播放"}背景音乐《${musicTitle}》`
      : `${playing ? "暫停" : "播放"}背景音樂《${musicTitle}》`;
  const statusLabel = locale === "en"
    ? (playing ? "Music playing" : "Play music")
    : locale === "zh-Hans"
      ? (playing ? "音乐播放中" : "播放音乐")
      : (playing ? "音樂播放中" : "播放音樂");

  return <>
    <audio
      ref={audioRef}
      loop
      playsInline
      data-music-loop="single"
      data-active-music-type={activeMusicType}
      preload="none"
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onEnded={() => setPlaying(false)}
      onError={() => setPlaying(false)}
    >
      <source src={primarySrc} type={primaryType} />
    </audio>
    <button
      type="button"
      data-background-music-control
      data-mobile-floating-control="music"
      aria-label={label}
      aria-pressed={playing}
      title={label}
      onClick={toggle}
      className="fixed z-[91] inline-grid h-11 w-11 place-items-center rounded-full border border-line/90 bg-cream/95 p-0 text-ink-soft shadow-md backdrop-blur transition hover:text-ink"
      style={{ right: "max(0.75rem, env(safe-area-inset-right, 0px))", bottom: MOBILE_DOCK_BOTTOM }}
    >
      <span aria-hidden="true" className="text-base leading-none">{playing ? "♫" : "♪"}</span>
      <span className="sr-only">{statusLabel}</span>
    </button>
  </>;
}
