import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { runBootstrapReadiness } from "@/lib/bootstrap-readiness";
import {
  INTRO_GATE_FADE_MS,
  INTRO_GATE_MIN_VISIBLE_MS,
  INTRO_GATE_TARGET_MS,
  scheduleIntroGateHardExit,
} from "@/lib/intro-gate-policy";

const OWNER_LOADING_VIDEO = "/intro/owner-lotus-bloom-r53.mp4";
const OWNER_LOADING_POSTER = "/intro/owner-lotus-bloom-r53.jpg";

export function IntroGate() {
  const { locale } = useI18n();
  const [phase, setPhase] = useState<"in" | "leaving" | "off">("in");
  const [minimumDone, setMinimumDone] = useState(false);
  const [targetDone, setTargetDone] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [visualDone, setVisualDone] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const finishedRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);

  const forceOff = useCallback(() => {
    if (finishedRef.current && exitTimerRef.current === null) return;
    finishedRef.current = true;
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setPhase("off");
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase("leaving");
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = null;
      setPhase("off");
    }, INTRO_GATE_FADE_MS);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const minimumTimer = window.setTimeout(() => {
      if (!cancelled) setMinimumDone(true);
    }, INTRO_GATE_MIN_VISIBLE_MS);
    const targetTimer = window.setTimeout(() => {
      if (!cancelled) setTargetDone(true);
    }, INTRO_GATE_TARGET_MS);
    const cancelHardExit = scheduleIntroGateHardExit(
      window.setTimeout,
      window.clearTimeout,
      () => {
        // Five seconds is the maximum blocking window, not a mandatory duration.
        if (!cancelled) forceOff();
      },
    );

    void runBootstrapReadiness(() => {})
      .then(() => {
        if (!cancelled) setRuntimeReady(true);
      })
      .catch(() => {
        // Readiness is fail-open: backend trouble must not trap the user behind decoration.
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
    if (minimumDone && runtimeReady && (targetDone || visualDone)) finish();
  }, [finish, minimumDone, runtimeReady, targetDone, visualDone]);

  if (phase === "off") return null;

  const loadingLabel =
    locale === "en"
      ? "Preparing Zhaowu"
      : locale === "zh-Hans"
        ? "正在准备昭梧"
        : "正在準備昭梧";

  return (
    <div
      className={`zhaowu-lotus-intro fixed inset-0 z-[100] overflow-hidden transition-opacity duration-180 ease-out ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label={loadingLabel}
      data-intro-motion="owner-video"
    >
      <div className={`zhaowu-lotus-intro__fallback ${videoPlaying ? "is-covered" : ""}`} data-intro-fallback aria-hidden="true">
        <svg className="zhaowu-lotus-intro__fallback-art" viewBox="0 0 240 240" focusable="false">
          <circle className="zhaowu-lotus-intro__halo" cx="120" cy="119" r="72" />
          <g className="zhaowu-lotus-intro__flower">
            <path d="M120 48C139 71 141 96 120 121C99 96 101 71 120 48Z" />
            <path d="M77 70C105 79 119 98 120 125C92 118 77 99 77 70Z" />
            <path d="M163 70C135 79 121 98 120 125C148 118 163 99 163 70Z" />
            <path d="M57 110C85 106 106 117 120 137C91 143 69 134 57 110Z" />
            <path d="M183 110C155 106 134 117 120 137C149 143 171 134 183 110Z" />
            <path d="M82 143C99 135 111 136 120 143C129 136 141 135 158 143C147 164 134 175 120 178C106 175 93 164 82 143Z" />
          </g>
          <ellipse className="zhaowu-lotus-intro__ripple ripple-one" cx="120" cy="185" rx="58" ry="10" />
          <ellipse className="zhaowu-lotus-intro__ripple ripple-two" cx="120" cy="185" rx="78" ry="14" />
        </svg>
      </div>
      <video
        className={`zhaowu-lotus-intro__video ${videoPlaying ? "is-playing" : ""}`}
        src={OWNER_LOADING_VIDEO}
        poster={OWNER_LOADING_POSTER}
        autoPlay
        muted
        playsInline
        preload="auto"
        onPlaying={() => setVideoPlaying(true)}
        onEnded={() => setVisualDone(true)}
        onError={() => setVideoPlaying(false)}
      />
    </div>
  );
}
