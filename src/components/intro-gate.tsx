import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Mark } from "@/components/marks";
import { INTRO_FRAMES } from "@/lib/intro-frames";

const KEY = "zhaowu.intro.v1";
const FRAME_MS = 900;
const FADE_MS = 600;

/**
 * 開場 Loading 封面 — 嚴格對齊 UI Spec（一模一樣）
 * 水晶山河從暗到明 → 紅日升起 → 仙鶴飛過 → Slogan + 葫蘆
 * 四幀已內嵌，無需再放 public 檔案即可運作
 * 若有 public/intro/cover.mp4 仍優先播影片
 */
export function IntroGate() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<"off" | "in" | "out">("off");
  const [hasVideo, setHasVideo] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const [showText, setShowText] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

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
    clearTimers();
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

    fetch("/intro/cover.mp4", { method: "HEAD" })
      .then((r) => {
        if (r.ok) setHasVideo(true);
      })
      .catch(() => {});

    const t1 = window.setTimeout(() => setFrameIdx(1), FRAME_MS);
    const t2 = window.setTimeout(() => setFrameIdx(2), FRAME_MS * 2);
    const t3 = window.setTimeout(() => {
      setFrameIdx(3);
      setShowText(true);
    }, FRAME_MS * 3);
    const t4 = window.setTimeout(finish, FRAME_MS * 4 + 400);

    timers.current.push(t1, t2, t3, t4);

    return () => clearTimers();
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
      className={`fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#0d0a08] transition-opacity duration-700 ${
        phase === "out" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      role="presentation"
      onClick={skip}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
      }}
      tabIndex={0}
    >
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
        <div className="absolute inset-0" aria-hidden>
          {INTRO_FRAMES.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === frameIdx ? "opacity-100" : "opacity-0"
              }`}
              draggable={false}
            />
          ))}
        </div>
      )}

      <div
        className={`relative z-10 flex flex-col items-center gap-5 px-6 text-center transition-opacity duration-700 ${
          showText || hasVideo ? "opacity-100" : "opacity-0"
        }`}
      >
        <Mark id="brand" size={88} eager className="h-20 w-20 intro-seal drop-shadow-lg" />
        <p className="font-display text-4xl tracking-[0.36em] text-[#f7f0e4] drop-shadow">{t("brand")}</p>
        <p className="text-sm tracking-[0.28em] text-[#e8c9a0]">{t("manifesto")}</p>
        <p className="mt-6 text-[11px] tracking-[0.2em] text-white/50">點擊跳過</p>
      </div>
    </div>
  );
}
