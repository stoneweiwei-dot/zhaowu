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

const OWNER_LOADING_VIDEO = "/intro/owner-immortal-ascent-r123.mp4";
const OWNER_LOADING_POSTER = "/intro/owner-immortal-ascent-r123.jpg";
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

export function IntroGate() {
  const { locale } = useI18n();
  const [phase, setPhase] = useState<"in" | "leaving" | "off">(() =>
    typeof window !== "undefined" && shouldSkipIntroGate(window.localStorage, Boolean(navigator.webdriver)) ? "off" : "in",
  );
  const [minimumDone, setMinimumDone] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [visualDone, setVisualDone] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const finishedRef = useRef(false);
  const hasPlayedRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const forceOff = useCallback(() => {
    if (finishedRef.current && exitTimerRef.current === null) return;
    finishedRef.current = true;
    if (exitTimerRef.current !== null) { window.clearTimeout(exitTimerRef.current); exitTimerRef.current = null; }
    markIntroSeen(window.localStorage);
    setPhase("off");
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    markIntroSeen(window.localStorage);
    setPhase("leaving");
    exitTimerRef.current = window.setTimeout(() => { exitTimerRef.current = null; setPhase("off"); }, INTRO_GATE_FADE_MS);
  }, []);

  useEffect(() => {
    if (shouldSkipIntroGate(window.localStorage, Boolean(navigator.webdriver))) {
      finishedRef.current = true;
      setPhase("off");
      return;
    }
    let cancelled = false;
    const minimumTimer = window.setTimeout(() => { if (!cancelled) setMinimumDone(true); }, INTRO_GATE_MIN_VISIBLE_MS);
    const cancelHardExit = scheduleIntroGateHardExit(window.setTimeout, window.clearTimeout, () => { if (!cancelled) forceOff(); });
    void runBootstrapReadiness(() => {})
      .then(() => { if (!cancelled) setRuntimeReady(true); })
      .catch(() => {
        // backend trouble must fail open: keep the route mounted and let skip / native duration finish the visual.
        if (!cancelled) setRuntimeReady(true);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(minimumTimer);
      cancelHardExit();
      if (exitTimerRef.current !== null) { window.clearTimeout(exitTimerRef.current); exitTimerRef.current = null; }
    };
  }, [forceOff]);

  useEffect(() => {
    if (hasPlayedRef.current || videoPlaying || visualDone) return;
    const failOpen = () => {
      if (hasPlayedRef.current || finishedRef.current) return;
      setVideoPlaying(false);
      setVideoFailed(true);
      setVisualDone(true);
    };
    // WebKit media often bypasses page.route; if playback never starts, leave at 1.6s instead of the native 10s.
    const watchdog = window.setTimeout(failOpen, INTRO_GATE_ERROR_EXIT_MS);
    return () => window.clearTimeout(watchdog);
  }, [videoPlaying, visualDone]);

  useEffect(() => {
    if (!visualDone) return;
    if (videoFailed) {
      finish();
      return;
    }
    if (minimumDone && runtimeReady && visualDone) finish();
  }, [finish, visualDone, videoFailed, minimumDone, runtimeReady]);

  if (phase === "off") return null;

  const loadingLabel = locale === "en" ? "Preparing Zhaowu" : locale === "zh-Hans" ? "正在准备昭梧" : "正在準備昭梧";
  const skipLabel = locale === "en" ? "Skip" : locale === "zh-Hans" ? "跳过" : "跳過";

  return (
    <div className={`zhaowu-lotus-intro fixed inset-0 z-[100] overflow-hidden transition-opacity duration-180 ease-out ${phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      role="status" aria-live="polite" aria-label={loadingLabel} data-intro-motion="owner-video" data-intro-fallback-mode="owner-poster">
      <div className={`zhaowu-lotus-intro__fallback ${videoPlaying ? "is-covered" : ""}`} data-intro-fallback aria-hidden="true">
        <img src={OWNER_LOADING_POSTER} alt="" className="zhaowu-lotus-intro__poster" />
        <div className="zhaowu-lotus-intro__fallback-art">
          <div className="zhaowu-lotus-intro__pond" />
          <div className="zhaowu-lotus-intro__lotus zhaowu-lotus-intro__lotus--1"><span className="zhaowu-lotus-intro__stem"/><span className="zhaowu-lotus-intro__leaf"/><span className="zhaowu-lotus-intro__flower"/></div>
          <div className="zhaowu-lotus-intro__lotus zhaowu-lotus-intro__lotus--2"><span className="zhaowu-lotus-intro__stem"/><span className="zhaowu-lotus-intro__leaf"/><span className="zhaowu-lotus-intro__flower"/></div>
          <div className="zhaowu-lotus-intro__ink" />
        </div>
        <div className="zhaowu-lotus-intro__fallback-shade" />
        <div className="zhaowu-lotus-intro__fallback-copy"><strong>{locale === "en" ? "ZHAOWU" : "昭梧"}</strong><span>{loadingLabel}</span><i /></div>
      </div>
      <video ref={videoRef} className={`zhaowu-lotus-intro__video ${videoPlaying ? "is-playing" : ""}`} src={ownerVideoSrc()} poster={OWNER_LOADING_POSTER} autoPlay muted playsInline preload="auto"
        onPlaying={() => { hasPlayedRef.current = true; setVideoPlaying(true); }} onEnded={() => setVisualDone(true)} onStalled={() => setVideoPlaying(false)} onAbort={() => { if (!hasPlayedRef.current) { setVideoPlaying(false); setVideoFailed(true); } }} onError={() => { if (!hasPlayedRef.current) { setVideoPlaying(false); setVideoFailed(true); } }} />
      {phase === "in" ? (
        <button
          type="button"
          className="zhaowu-lotus-intro__skip"
          data-intro-skip
          onClick={finish}
        >
          {skipLabel}
        </button>
      ) : null}
    </div>
  );
}
