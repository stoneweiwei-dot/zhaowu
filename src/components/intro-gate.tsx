import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Mark } from "@/components/marks";

const KEY = "zhaowu.intro.v1";
const HOLD_MS = 3200;
const FADE_MS = 700;
const TOTAL_MS = HOLD_MS + FADE_MS;

/**
 * 开场 Loading 封面（Issue #5 / #6）
 * - 优先播放 public/intro/cover.mp4（9:16 推荐）
 * - 无视频时用水晶山河／红日升起氛围的 CSS 动画兜底
 * - 可点击跳过；sessionStorage 本会话只播一次；尊重 reduced-motion
 */
export function IntroGate() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<"off" | "in" | "out">("off");
  const [hasVideo, setHasVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timers = useRef<number[]>([]);

  function finish() {
    setPhase("out");
    const t = window.setTimeout(() => {
      setPhase("off");
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
    }, FADE_MS);
    timers.current.push(t);
  }

  function skip() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        /* ignore */
      }
    }
    finish();
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem(KEY)) return;
    } catch {
      return;
    }

    setPhase("in");

    // 探测视频是否存在（不阻塞）
    const probe = new Image();
    // 用 fetch HEAD 探测 mp4 是否可达
    fetch("/intro/cover.mp4", { method: "HEAD" })
      .then((r) => {
        if (r.ok) setHasVideo(true);
      })
      .catch(() => {
        /* 无视频则走 CSS 氛围 */
      });

    const hold = window.setTimeout(finish, HOLD_MS);
    timers.current.push(hold);

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    if (phase !== "in" || !hasVideo || !videoRef.current) return;
    const v = videoRef.current;
    v.currentTime = 0;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => setHasVideo(false));
  }, [phase, hasVideo]);

  if (phase === "off") return null;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#1a1410] transition-opacity duration-700 ${
        phase === "out" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      role="presentation"
      onClick={skip}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
      }}
      tabIndex={0}
    >
      {/* 视频层（有文件时） */}
      {hasVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src="/intro/cover.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden
        />
      ) : (
        /* CSS 氛围兜底：暗 → 明，红日，山河气质 */
        <div className="absolute inset-0 intro-atmosphere" aria-hidden>
          <div className="intro-sky" />
          <div className="intro-sun" />
          <div className="intro-mist" />
          <div className="intro-ridge intro-ridge-a" />
          <div className="intro-ridge intro-ridge-b" />
        </div>
      )}

      {/* 定格文案层 */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
        <Mark id="brand" size={88} eager className="h-20 w-20 intro-seal drop-shadow-lg" />
        <p className="font-display text-4xl tracking-[0.36em] text-[#f7f0e4] drop-shadow">{t("brand")}</p>
        <p className="text-sm tracking-[0.28em] text-[#e8c9a0]">{t("manifesto")}</p>
        <p className="mt-6 text-[11px] tracking-[0.2em] text-white/50">點擊跳過</p>
      </div>
    </div>
  );
}
