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
        // The intro is decorative: it must never block access for three seconds.
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
      data-intro-fallback-mode="owner-poster"
    >
      <div className={`zhaowu-lotus-intro__fallback ${videoPlaying ? "is-covered" : ""}`} data-intro-fallback aria-hidden="true">
        <div className="zhaowu-lotus-intro__fallback-lockup">
          <img src={OWNER_LOADING_POSTER} alt="" className="h-64 w-48 object-contain" />
          <div className="zhaowu-lotus-intro__fallback-copy">
            <strong>{locale === "en" ? "ZHAOWU" : "昭梧"}</strong>
            <span>{loadingLabel}</span>
            <i />
          </div>
        </div>
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
        onStalled={() => setVideoPlaying(false)}
        onError={() => setVideoPlaying(false)}
      />
    </div>
  );
}
