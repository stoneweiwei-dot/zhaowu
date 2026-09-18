import { useCallback, useEffect, useRef, useState } from "react";
import { loadOwnerMusic, type OwnerMusicTrack } from "@/lib/owner-music-client";
import { useI18n } from "@/lib/i18n";

const STORAGE_KEY = "zhaowu.backgroundMusic.v3";
const LEGACY_STORAGE_KEY = "zhaowu.backgroundMusic.v1";
const LOOP_STORAGE_KEY = `${STORAGE_KEY}.loop`;
const SHUFFLE_STORAGE_KEY = `${STORAGE_KEY}.shuffle`;
const TRACK_STORAGE_KEY = `${STORAGE_KEY}.track`;
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

function readBooleanPreference(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (value === "on") return true;
    if (value === "off") return false;
  } catch {}
  return fallback;
}

function buildPlaybackOrder(tracks: OwnerMusicTrack[], currentId: string | null, shuffle: boolean) {
  const ids = tracks.map((track) => track.id);
  if (!shuffle || ids.length < 2) return ids;
  const current = currentId && ids.includes(currentId) ? currentId : ids[0];
  const rest = ids.filter((id) => id !== current);
  for (let index = rest.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [rest[index], rest[swap]] = [rest[swap], rest[index]];
  }
  return current ? [current, ...rest] : rest;
}

export function BackgroundMusic() {
  const { locale } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockStartedRef = useRef(false);
  const currentIdRef = useRef<string | null>(null);
  const shuffleRef = useRef(readBooleanPreference(SHUFFLE_STORAGE_KEY, false));

  const [enabled, setEnabled] = useState(readInitialPreference);
  const [requested, setRequested] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<OwnerMusicTrack[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playOrder, setPlayOrder] = useState<string[]>([]);
  const [loopEnabled, setLoopEnabled] = useState(() => readBooleanPreference(LOOP_STORAGE_KEY, true));
  const [shuffleEnabled, setShuffleEnabled] = useState(() => readBooleanPreference(SHUFFLE_STORAGE_KEY, false));

  const currentTrack = tracks.find((item) => item.id === currentId) ?? null;

  const syncAudioSource = useCallback((track: OwnerMusicTrack | null) => {
    const audio = audioRef.current;
    if (!audio) return;
    const source = track?.url || MUSIC_STREAM_URL;
    if (audio.getAttribute("src") !== source) {
      audio.src = source;
      audio.load();
    }
    audio.volume = DEFAULT_VOLUME;
  }, []);

  const refreshAsset = useCallback(async (preferActive = false) => {
    setLoading(true);
    try {
      const next = await loadOwnerMusic().catch(() => null);
      const list = next?.tracks ?? [];
      const activeId = next?.active?.id ?? list.find((item) => item.enabled)?.id ?? list[0]?.id ?? null;
      const existingId = currentIdRef.current;
      const selectedId = !preferActive && existingId && list.some((item) => item.id === existingId)
        ? existingId
        : activeId;
      const selected = list.find((item) => item.id === selectedId) ?? null;
      setTracks(list);
      setCurrentId(selectedId);
      currentIdRef.current = selectedId;
      setPlayOrder(buildPlaybackOrder(list, selectedId, shuffleRef.current));
      if (selectedId) {
        try { window.localStorage.setItem(TRACK_STORAGE_KEY, selectedId); } catch {}
      }
      return { tracks: list, selected };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!requested) return;
    void refreshAsset();
  }, [requested, refreshAsset]);

  useEffect(() => {
    const onChange = () => {
      const audio = audioRef.current;
      const resume = Boolean(audio && enabled && requested && !audio.paused);
      setPlaying(false);
      void refreshAsset(true).then(({ selected }) => {
        if (!audio) return;
        syncAudioSource(selected);
        if (resume) {
          unlockStartedRef.current = true;
          void audio.play().catch(() => {
            unlockStartedRef.current = false;
            setPlaying(false);
          });
        }
      });
    };
    window.addEventListener("zhaowu-music-change", onChange);
    return () => window.removeEventListener("zhaowu-music-change", onChange);
  }, [enabled, requested, refreshAsset, syncAudioSource]);

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

  useEffect(() => {
    try { window.localStorage.setItem(LOOP_STORAGE_KEY, loopEnabled ? "on" : "off"); } catch {}
  }, [loopEnabled]);

  useEffect(() => {
    shuffleRef.current = shuffleEnabled;
    try { window.localStorage.setItem(SHUFFLE_STORAGE_KEY, shuffleEnabled ? "on" : "off"); } catch {}
  }, [shuffleEnabled]);

  // iPhone/iPad Safari still needs the first play() call inside a user gesture.
  // Keep the previous gesture-unlock behavior, then expose explicit transport
  // controls for pause/play and playlist navigation.
  useEffect(() => {
    if (!enabled || requested) return;

    const unlock = () => {
      if (unlockStartedRef.current) return;
      const audio = audioRef.current;
      if (!audio) return;
      unlockStartedRef.current = true;
      setRequested(true);
      setPlaying(false);
      syncAudioSource(currentTrack);
      void audio.play().catch(() => {
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
  }, [enabled, requested, currentTrack, syncAudioSource]);

  const startPlayback = (track: OwnerMusicTrack | null = currentTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    setEnabled(true);
    setRequested(true);
    setPlaying(false);
    unlockStartedRef.current = true;
    syncAudioSource(track);
    void audio.play().catch(() => {
      unlockStartedRef.current = false;
      setPlaying(false);
    });
    if (!tracks.length) void refreshAsset();
  };

  const pausePlayback = () => {
    const audio = audioRef.current;
    audio?.pause();
    setEnabled(false);
    setRequested(false);
    unlockStartedRef.current = false;
    setPlaying(false);
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (playing || Boolean(audio && !audio.paused)) {
      pausePlayback();
      return;
    }
    startPlayback();
  };

  const selectTrack = (track: OwnerMusicTrack, shouldPlay: boolean) => {
    const audio = audioRef.current;
    setCurrentId(track.id);
    currentIdRef.current = track.id;
    try { window.localStorage.setItem(TRACK_STORAGE_KEY, track.id); } catch {}
    syncAudioSource(track);
    if (shouldPlay) {
      setEnabled(true);
      setRequested(true);
      unlockStartedRef.current = true;
      setPlaying(false);
      void audio?.play().catch(() => {
        unlockStartedRef.current = false;
        setPlaying(false);
      });
    } else {
      setPlaying(false);
    }
  };

  const moveTrack = async (direction: -1 | 1, fromEnded = false) => {
    let list = tracks;
    let order = playOrder;
    let selectedId = currentId;
    if (!list.length) {
      const loaded = await refreshAsset();
      list = loaded.tracks;
      selectedId = loaded.selected?.id ?? null;
      order = buildPlaybackOrder(list, selectedId, shuffleRef.current);
    }
    if (!list.length) return;
    if (list.length === 1) {
      const only = list[0];
      if (fromEnded && !loopEnabled) {
        setEnabled(false);
        setRequested(false);
        setPlaying(false);
        return;
      }
      const shouldPlay = fromEnded || Boolean(audioRef.current && !audioRef.current.paused);
      selectTrack(only, shouldPlay);
      return;
    }
    if (!order.length || order.some((id) => !list.some((item) => item.id === id))) {
      order = buildPlaybackOrder(list, selectedId, shuffleRef.current);
      setPlayOrder(order);
    }
    let index = order.indexOf(selectedId ?? "");
    if (index < 0) index = 0;
    let nextIndex = index + direction;
    const passedBoundary = nextIndex < 0 || nextIndex >= order.length;
    if (passedBoundary) {
      if (fromEnded && !loopEnabled) {
        setEnabled(false);
        setRequested(false);
        unlockStartedRef.current = false;
        setPlaying(false);
        return;
      }
      if (loopEnabled) nextIndex = nextIndex < 0 ? order.length - 1 : 0;
      else nextIndex = Math.max(0, Math.min(order.length - 1, nextIndex));
    }
    const targetId = order[nextIndex];
    const target = list.find((item) => item.id === targetId);
    if (!target) return;
    const shouldPlay = fromEnded || Boolean(audioRef.current && !audioRef.current.paused);
    selectTrack(target, shouldPlay);
  };

  const toggleLoop = () => setLoopEnabled((value) => !value);

  const toggleShuffle = () => {
    const next = !shuffleEnabled;
    shuffleRef.current = next;
    setShuffleEnabled(next);
    setPlayOrder(buildPlaybackOrder(tracks, currentId, next));
  };

  const markPlaybackStarted = () => {
    const audio = audioRef.current;
    if (!audio || audio.paused || audio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    setPlaying(true);
  };

  const markPlaybackUnavailable = () => setPlaying(false);

  const musicTitle = currentTrack?.name || (locale === "en" ? "Zhaowu background music" : locale === "zh-Hans" ? "昭梧背景音乐" : "昭梧背景音樂");
  const copy = locale === "en"
    ? {
        playing: "Playing",
        paused: "Paused",
        loading: "Loading playlist…",
        previous: "Previous track",
        play: "Play",
        pause: "Pause",
        next: "Next track",
        loop: "Loop playlist",
        shuffle: "Shuffle",
      }
    : locale === "zh-Hans"
      ? {
          playing: "播放中",
          paused: "已暂停",
          loading: "正在读取歌单…",
          previous: "上一首",
          play: "播放",
          pause: "暂停",
          next: "下一首",
          loop: "循环播放",
          shuffle: "随机播放",
        }
      : {
          playing: "播放中",
          paused: "已暫停",
          loading: "正在讀取歌單…",
          previous: "上一首",
          play: "播放",
          pause: "暫停",
          next: "下一首",
          loop: "循環播放",
          shuffle: "隨機播放",
        };

  const transportButton = "inline-grid min-h-11 min-w-11 place-items-center rounded-full border border-line/80 bg-paper/75 text-base leading-none text-ink-soft transition hover:text-ink active:scale-[0.97]";
  const modeButton = (active: boolean) => `${transportButton} ${active ? "border-cinnabar/45 bg-cinnabar/10 text-cinnabar" : ""}`;

  return <>
    <audio
      ref={audioRef}
      playsInline
      data-music-loop={loopEnabled ? "playlist" : "off"}
      data-music-shuffle={shuffleEnabled ? "on" : "off"}
      preload="none"
      onPlaying={markPlaybackStarted}
      onTimeUpdate={markPlaybackStarted}
      onPause={markPlaybackUnavailable}
      onEnded={() => void moveTrack(1, true)}
      onWaiting={markPlaybackUnavailable}
      onStalled={markPlaybackUnavailable}
      onAbort={markPlaybackUnavailable}
      onEmptied={markPlaybackUnavailable}
      onError={markPlaybackUnavailable}
    />
    <div
      data-background-music-player
      data-mobile-floating-control="music"
      className="fixed z-[91] rounded-[1.15rem] border border-line/90 bg-cream/96 p-2 text-ink-soft shadow-lg backdrop-blur"
      style={{
        right: "max(0.75rem, env(safe-area-inset-right, 0px))",
        bottom: MOBILE_DOCK_BOTTOM,
        width: "min(19.5rem, calc(100vw - 1.5rem))",
      }}
    >
      <div className="flex min-w-0 items-center gap-2 px-2 pb-1.5">
        <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${playing ? "bg-cinnabar" : "bg-line"}`} />
        <span className="shrink-0 text-[10px] tracking-[0.12em] text-ink-mute">{loading && !tracks.length ? copy.loading : playing ? copy.playing : copy.paused}</span>
        <span data-music-track-title className="min-w-0 flex-1 truncate text-right text-[11px] text-ink-soft" title={musicTitle}>{musicTitle}</span>
      </div>
      <div className="grid grid-cols-5 gap-1" role="group" aria-label={musicTitle}>
        <button type="button" className={transportButton} aria-label={`${copy.previous}: ${musicTitle}`} title={copy.previous} onClick={() => void moveTrack(-1)}>
          <span aria-hidden="true">⏮</span>
        </button>
        <button type="button" className={transportButton} aria-label={`${playing ? copy.pause : copy.play}: ${musicTitle}`} title={playing ? copy.pause : copy.play} aria-pressed={playing} onClick={togglePlayback}>
          <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
        </button>
        <button type="button" className={transportButton} aria-label={`${copy.next}: ${musicTitle}`} title={copy.next} onClick={() => void moveTrack(1)}>
          <span aria-hidden="true">⏭</span>
        </button>
        <button type="button" className={modeButton(loopEnabled)} aria-label={copy.loop} title={copy.loop} aria-pressed={loopEnabled} onClick={toggleLoop}>
          <span aria-hidden="true">↻</span>
        </button>
        <button type="button" className={modeButton(shuffleEnabled)} aria-label={copy.shuffle} title={copy.shuffle} aria-pressed={shuffleEnabled} onClick={toggleShuffle}>
          <span aria-hidden="true">⇄</span>
        </button>
      </div>
    </div>
  </>;
}
