import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { runBootstrapReadiness } from "@/lib/bootstrap-readiness";

const KEY = "zhaowu.intro.v10";
const MIN_FIRST_VISIT_MS = 3000;
const MIN_REPEAT_VISIT_MS = 280;
const SLOW_NOTICE_MS = 8000;
const VIDEO_SRC = "/intro/loading-v10.mp4";
const POSTER_SRC = "/intro/loading-poster.jpg";

export function IntroGate() {
  const { t } = useI18n();
  const { isPending } = useCurrentUserState();
  const [phase, setPhase] = useState<"in" | "off">("in");
  const [percent, setPercent] = useState(0);
  const [label, setLabel] = useState("正在啟動昭梧");
  const [bootReady, setBootReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const startedAt = useRef(0);
  const seenBefore = useRef(false);
  const finishTimer = useRef<number | null>(null);

  const displayPercent = useMemo(() => {
    const authBonus = isPending ? 0 : 8;
    const mediaBonus = videoReady || mediaFailed || reduced ? 7 : 0;
    return Math.min(100, Math.round(percent * 0.85 + authBonus + mediaBonus));
  }, [isPending, mediaFailed, percent, reduced, videoReady]);

  const clearFinishTimer = useCallback(() => {
    if (finishTimer.current !== null) {
      window.clearTimeout(finishTimer.current);
      finishTimer.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    clearFinishTimer();
    try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setPhase("off");
  }, [clearFinishTimer]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    startedAt.current = performance.now();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);
    try { seenBefore.current = sessionStorage.getItem(KEY) === "1"; } catch { seenBefore.current = false; }
    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_NOTICE_MS);
    return () => window.clearTimeout(slowTimer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBootError(null);
    setBootReady(false);
    setPercent(0);

    void runBootstrapReadiness((progress) => {
      if (cancelled) return;
      setPercent(progress.percent);
      setLabel(progress.label);
    })
      .then(() => {
        if (!cancelled) {
          setBootReady(true);
          setPercent(100);
          setLabel("準備完成");
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "啟動檢查未完成。";
        setBootError(message);
        setLabel("等待關鍵服務就緒");
      });

    return () => { cancelled = true; };
  }, [attempt]);

  useEffect(() => {
    if (phase !== "in" || !bootReady || isPending || bootError) return;
    if (!reduced && !videoReady && !mediaFailed) return;

    const elapsed = performance.now() - startedAt.current;
    const minimum = seenBefore.current || reduced ? MIN_REPEAT_VISIT_MS : MIN_FIRST_VISIT_MS;
    const wait = Math.max(0, minimum - elapsed);
    clearFinishTimer();
    finishTimer.current = window.setTimeout(finish, wait);
    return clearFinishTimer;
  }, [bootError, bootReady, clearFinishTimer, finish, isPending, mediaFailed, phase, reduced, videoReady]);

  if (phase === "off") return null;

  return (
    <div
      className="fixed inset-0 z-[90] overflow-hidden bg-[#172018]"
      role="status"
      aria-live="polite"
      aria-label={t("introAria")}
    >
      <div className="absolute inset-0 bg-[#1c241c]" aria-hidden>
        <img
          src={POSTER_SRC}
          alt=""
          className="intro-media intro-poster"
          draggable={false}
        />
        {!reduced ? (
          <video
            className={`intro-media intro-video ${videoReady ? "is-ready" : ""}`}
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setVideoReady(true)}
            onLoadedData={() => setVideoReady(true)}
            onError={() => setMediaFailed(true)}
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_18%,#f3d98f_0%,#8fa18a_34%,#314039_68%,#182019_100%)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,237,211,.10)_0%,rgba(40,49,36,.06)_42%,rgba(13,20,16,.28)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(255,239,179,.16),transparent_32%)] mix-blend-screen" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(36px,env(safe-area-inset-top))] text-center text-[#fff9e8]">
        <div className="pt-2">
          <p className="text-[11px] tracking-[0.48em] text-[#f0dfb4]">Z H A O W U</p>
          <p className="mt-2 text-[9px] tracking-[0.34em] text-[#d9c89d]">DESTINY · TIMING · CHOICE</p>
        </div>

        <div className="mt-[11vh] rounded-[28px] border border-[#f8e7bb]/22 bg-[#172018]/28 px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,.18)] backdrop-blur-[2px]">
          <h1 className="font-display text-[clamp(1.75rem,8vw,2.55rem)] leading-[1.35] tracking-[0.04em] text-[#fff8de]">
            昭於未見，梧於有歸。
          </h1>
          <div className="mx-auto mt-5 h-px w-24 bg-[#e9d39b]/75" />
          <div className="mt-5 space-y-2 font-display text-[15px] tracking-[0.12em] text-[#fff7df]">
            <p>命理不是宿命</p>
            <p>運勢不是答案</p>
            <p>選擇才是開始</p>
          </div>
          <p className="mt-5 font-serif text-[13px] italic tracking-[0.04em] text-[#eadcb8]">See the unseen. Find your ground.</p>
        </div>

        <div className="mt-auto pb-3">
          <div
            className="mx-auto flex h-[112px] w-[112px] items-center justify-center rounded-full bg-white/10 p-[5px] shadow-[0_0_42px_rgba(241,205,116,.28)] backdrop-blur-sm"
            style={{ background: `conic-gradient(rgba(248,223,155,.98) ${displayPercent * 3.6}deg, rgba(255,255,255,.18) 0deg)` }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1a211a]/65 ring-1 ring-[#f5dfaa]/25">
              <span className="font-display text-[30px] tabular-nums text-[#fff6dc]">{displayPercent}<span className="ml-0.5 text-sm">%</span></span>
            </div>
          </div>

          <p className="mt-5 font-display text-[18px] tracking-[0.16em] text-[#fff7e5]">正在連接與分析</p>
          <p className="mt-2 min-h-5 text-[11px] tracking-[0.12em] text-[#e2d5b6]">
            {isPending ? "正在確認帳號與資料狀態" : label}
          </p>
          <p className="mt-2 text-[9px] tracking-[0.14em] text-[#cabd9e]">資料核心 · 命理引擎 · 九頁報告 · 四柱繪意</p>

          {bootError ? (
            <div className="mt-4 rounded-2xl border border-[#f1d8a2]/35 bg-[#1a211a]/62 px-4 py-3 text-[11px] text-[#f4e5c1] backdrop-blur">
              <p>{bootError}</p>
              <button
                type="button"
                onClick={() => { setSlow(false); setAttempt((value) => value + 1); }}
                className="mt-2 rounded-full border border-[#edd7a3]/45 px-4 py-2 tracking-[0.12em] text-[#fff3d1]"
              >
                重新連接
              </button>
            </div>
          ) : slow && (!bootReady || isPending) ? (
            <p className="mt-4 text-[10px] tracking-[0.08em] text-[#ead7aa]">首次載入需要較久，正在繼續確認關鍵服務。</p>
          ) : null}

          <div className="mx-auto mt-5 h-px w-40 bg-[#ecd9a8]/45" />
          <p className="mt-3 text-[9px] tracking-[0.22em] text-[#d4c39f]">STONE 原創 · 2026</p>
        </div>
      </div>
    </div>
  );
}
