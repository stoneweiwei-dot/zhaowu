import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { runBootstrapReadiness } from "@/lib/bootstrap-readiness";
import {
  INTRO_BROKEN_KEY,
  INTRO_GATE_ERROR_EXIT_MS,
  INTRO_GATE_FADE_MS,
  INTRO_GATE_MIN_VISIBLE_MS,
  markIntroSeen,
  scheduleIntroGateHardExit,
  shouldSkipIntroGate,
} from "@/lib/intro-gate-policy";

const OWNER_LOADING_VIDEO = "/intro/zhaowu-opening-r148.mp4";
const OWNER_LOADING_POSTER = "/intro/zhaowu-opening-r148.jpg";
const OWNER_LOADING_BROKEN = "/intro/missing-force-fail.mp4";
const OWNER_LOADING_SOUND = "/audio/zhaowu-background.mp3";

function ownerVideoSrc() {
  try {
    if (typeof window !== "undefined" && window.localStorage.getItem(INTRO_BROKEN_KEY) === "1") {
      return OWNER_LOADING_BROKEN;
    }
  } catch {
    /* ignore */
  }
  return OWNER_LOADING_VIDEO;
}

function isForcedBrokenIntro() {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(INTRO_BROKEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function IntroGate() {
  const { locale } = useI18n();
  const [phase, setPhase] = useState<"in" | "leaving" | "off">(() =>
    typeof window !== "undefined" && shouldSkipIntroGate(window.localStorage, Boolean(navigator.webdriver)) ? "off" : "in",
  );
  const [minimumDone, setMinimumDone] = useState(false);
  const [visualDone, setVisualDone] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const finishedRef = useRef(false);
  const hasPlayedRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  const stopSound = useCallback(() => {
    const sound = soundRef.current;
    if (sound) sound.pause();
    setSoundPlaying(false);
  }, []);

  const forceOff = useCallback(() => {
    if (finishedRef.current && exitTimerRef.current === null) return;
    finishedRef.current = true;
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    markIntroSeen(window.localStorage);
    stopSound();
    setPhase("off");
  }, [stopSound]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    markIntroSeen(window.localStorage);
    stopSound();
    setPhase("leaving");
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = null;
      setPhase("off");
    }, INTRO_GATE_FADE_MS);
  }, [stopSound]);

  const toggleSound = useCallback(() => {
    const sound = soundRef.current;
    if (!sound) return;
    if (!sound.paused) {
      sound.pause();
      setSoundPlaying(false);
      return;
    }
    sound.volume = 0.24;
    void sound.play().then(() => setSoundPlaying(true)).catch(() => setSoundPlaying(false));
  }, []);

  useEffect(() => {
    if (shouldSkipIntroGate(window.localStorage, Boolean(navigator.webdriver))) {
      finishedRef.current = true;
      setPhase("off");
      return;
    }

    let cancelled = false;
    const minimumTimer = window.setTimeout(() => {
      if (!cancelled) setMinimumDone(true);
    }, INTRO_GATE_MIN_VISIBLE_MS);
    const cancelHardExit = scheduleIntroGateHardExit(window.setTimeout, window.clearTimeout, () => {
      if (!cancelled) forceOff();
    });

    // Warm the runtime underneath the intro, but never shorten or extend the five-second visual contract.
    void runBootstrapReadiness(() => {}).catch(() => undefined);

    return () => {
      cancelled = true;
      window.clearTimeout(minimumTimer);
      cancelHardExit();
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [forceOff]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || isForcedBrokenIntro()) return;
    node.muted = true;
    node.defaultMuted = true;
    node.playsInline = true;
    node.setAttribute("webkit-playsinline", "true");

    const tryPlay = () => {
      const play = node.play();
      if (play && typeof play.then === "function") {
        play.then(() => {
          hasPlayedRef.current = true;
          setVideoPlaying(true);
        }).catch(() => undefined);
      }
    };

    tryPlay();
    node.addEventListener("canplay", tryPlay);
    node.addEventListener("loadeddata", tryPlay);
    return () => {
      node.removeEventListener("canplay", tryPlay);
      node.removeEventListener("loadeddata", tryPlay);
    };
  }, []);

  useEffect(() => {
    if (hasPlayedRef.current || videoPlaying || visualDone || !isForcedBrokenIntro()) return;
    const watchdog = window.setTimeout(() => {
      if (hasPlayedRef.current || finishedRef.current) return;
      setVideoPlaying(false);
      setVisualDone(true);
    }, INTRO_GATE_ERROR_EXIT_MS);
    return () => window.clearTimeout(watchdog);
  }, [videoPlaying, visualDone]);

  useEffect(() => {
    if (minimumDone && visualDone) finish();
  }, [finish, minimumDone, visualDone]);

  if (phase === "off") return null;

  const loadingLabel = locale === "en" ? "Preparing Zhaowu" : locale === "zh-Hans" ? "正在准备昭梧" : "正在準備昭梧";

  return (
    <div
      className={`zhaowu-lotus-intro fixed inset-0 z-[100] overflow-hidden transition-opacity duration-180 ease-out ${phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      role="status"
      aria-live="polite"
      aria-label={loadingLabel}
      data-intro-motion="zhaowu-opening-r148"
      data-intro-fallback-mode="r148-poster"
    >
      <div className={`zhaowu-lotus-intro__fallback ${videoPlaying ? "is-covered" : ""}`} data-intro-fallback aria-hidden="true">
        <img src={OWNER_LOADING_POSTER} alt="" className="zhaowu-lotus-intro__poster" />
        <div className="zhaowu-lotus-intro__fallback-shade" />
        <div className="zhaowu-lotus-intro__fallback-copy">
          <strong>{locale === "en" ? "ZHAOWU" : "昭梧"}</strong>
          <span>{loadingLabel}</span>
          <i />
        </div>
      </div>
      <video
        ref={videoRef}
        className="zhaowu-lotus-intro__video is-playing"
        src={ownerVideoSrc()}
        poster={OWNER_LOADING_POSTER}
        autoPlay
        muted
        playsInline
        preload="auto"
        onPlaying={() => {
          hasPlayedRef.current = true;
          setVideoPlaying(true);
        }}
        onEnded={() => setVisualDone(true)}
        onAbort={() => {
          if (!hasPlayedRef.current) {
            setVideoPlaying(false);
            setVisualDone(true);
          }
        }}
        onError={() => {
          if (!hasPlayedRef.current) {
            setVideoPlaying(false);
            setVisualDone(true);
          }
        }}
      />
      <audio ref={soundRef} src={OWNER_LOADING_SOUND} preload="metadata" onEnded={() => setSoundPlaying(false)} />
      <button
        type="button"
        className="zhaowu-intro-sound"
        data-intro-sound-control
        aria-pressed={soundPlaying}
        onClick={toggleSound}
      >
        <span aria-hidden="true">{soundPlaying ? "Ⅱ" : "♪"}</span>
        {locale === "en" ? (soundPlaying ? "Sound on" : "Play sound") : locale === "zh-Hans" ? (soundPlaying ? "声音已开启" : "开启声音") : (soundPlaying ? "聲音已開啟" : "開啟聲音")}
      </button>
    </div>
  );
}
