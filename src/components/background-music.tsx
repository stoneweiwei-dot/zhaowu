import { useEffect, useRef, useState } from "react";

const MUSIC_SRC = "https://plgpxusmemnmzckbwtiv.supabase.co/storage/v1/object/public/zhaowu-audio/background/jingfo-shengyuan.m4a";
const STORAGE_KEY = "zhaowu.backgroundMusic.v1";
const DEFAULT_VOLUME = 0.18;

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
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };

    // Browsers that allow autoplay will start here. iPhone Safari normally
    // requires a user gesture, so the first ordinary interaction unlocks it.
    tryPlay();

    const unlockOnInteraction = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-background-music-control]")) return;
      tryPlay();
    };

    window.addEventListener("pointerdown", unlockOnInteraction, { passive: true });
    window.addEventListener("touchend", unlockOnInteraction, { passive: true });
    window.addEventListener("keydown", unlockOnInteraction);

    return () => {
      window.removeEventListener("pointerdown", unlockOnInteraction);
      window.removeEventListener("touchend", unlockOnInteraction);
      window.removeEventListener("keydown", unlockOnInteraction);
    };
  }, [enabled]);

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

  const label = playing ? "暫停背景音樂《淨佛聖願》" : "播放背景音樂《淨佛聖願》";

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        data-background-music-control
        aria-label={label}
        aria-pressed={playing}
        title={label}
        onClick={toggle}
        className="fixed z-[55] inline-flex h-9 items-center gap-1.5 rounded-full border border-line/80 bg-cream/90 px-2.5 text-xs text-ink-soft shadow-sm backdrop-blur transition hover:text-ink"
        style={{
          left: "max(0.75rem, env(safe-area-inset-left))",
          bottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <span aria-hidden="true" className="text-sm leading-none">{playing ? "♫" : "♪"}</span>
        <span className="hidden min-[430px]:inline">{playing ? "音樂播放中" : "背景音樂"}</span>
      </button>
    </>
  );
}
