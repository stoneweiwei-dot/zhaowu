import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { runBootstrapReadiness } from "@/lib/bootstrap-readiness";
import {
  INTRO_BROKEN_KEY,
  INTRO_GATE_ERROR_EXIT_MS,
  INTRO_GATE_FADE_MS,
  INTRO_GATE_HARD_EXIT_MS,
  INTRO_GATE_MIN_VISIBLE_MS,
  INTRO_GATE_TARGET_MS,
  markIntroSeen,
  scheduleIntroGateHardExit,
  shouldSkipIntroGate,
} from "@/lib/intro-gate-policy";

const OWNER_LOADING_VIDEO = "/intro/zhaowu-opening-r148.mp4";
const OWNER_LOADING_POSTER = "/intro/zhaowu-opening-r148.jpg";
const OWNER_LOADING_BROKEN = "/intro/missing-force-fail.mp4";

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
  const [targetDone, setTargetDone] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [visualDone, setVisualDone] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const finishedRef = useRef(false);
  const hasPlayedRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const forceOff = useCallback(() => {
    if (finishedRef.current && exitTimerRef.current === null) return;
    finishedRef.current = true;
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    markIntroSeen(window.localStorage);
    setPhase("off");
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    markIntroSeen(window.localStorage);
    setPhase("leaving");
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = null;
      setPhase("off");
    }, INTRO_GATE_FADE_MS);
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
    const targetTimer = window.setTimeout(() => {
      if (!cancelled) setTargetDone(true);
    }, INTRO_GATE_TARGET_MS);
    const cancelHardExit = scheduleIntroGateHardExit(window.setTimeout, window.clearTimeout, () => {
      if (!cancelled) forceOff();
    });

    void runBootstrapReadiness(() => {})
      .then(() => {
        if (!cancelled) setRuntimeReady(true);
      })
      .catch(() => {
        // Backend/bootstrap trouble must never hold the opening screen.
        if (!cancelled) setRuntimeReady(true);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(minimumTimer);
      window.clearTimeout(targetTimer);
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
    if (minimumDone && visualDone) {
      finish();
      return;
    }
    if (targetDone && runtimeReady) finish();
  }, [finish, minimumDone, runtimeReady, targetDone, visualDone]);

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
      data-intro-target-ms={INTRO_GATE_TARGET_MS}
      data-intro-hard-exit-ms={INTRO_GATE_HARD_EXIT_MS}
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
    </div>
  );
}
