import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { runBootstrapReadiness } from "@/lib/bootstrap-readiness";

/** v18：快速进站 — 首访约 2.2s，最长 4s 强制进入，随时可跳过 */
const KEY = "zhaowu.intro.v18";
const MIN_HOLD_FIRST_MS = 2200;
const MIN_HOLD_REPEAT_MS = 1200;
const HARD_MAX_MS = 4000;
const POSTER_SRC = "/intro/loading-poster.jpg?v=20260824-fast";

export function IntroGate() {
  const { t, locale } = useI18n();
  const { isPending } = useCurrentUserState();
  const [phase, setPhase] = useState<"in" | "leaving" | "off">("in");
  const [percent, setPercent] = useState(0);
  const [label, setLabel] = useState("正在啟動昭梧");
  const [bootReady, setBootReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [holdDone, setHoldDone] = useState(false);
  const startedAt = useRef(0);
  const holdTarget = useRef(MIN_HOLD_FIRST_MS);
  const finishTimer = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const finished = useRef(false);

  const clearTimers = useCallback(() => {
    if (finishTimer.current !== null) {
      window.clearTimeout(finishTimer.current);
      finishTimer.current = null;
    }
    if (raf.current !== null) {
      window.cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    clearTimers();
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setPercent(100);
    setPhase("leaving");
    window.setTimeout(() => setPhase("off"), 320);
  }, [clearTimers]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    startedAt.current = performance.now();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      seen = false;
    }
    holdTarget.current = prefersReduced ? 900 : seen ? MIN_HOLD_REPEAT_MS : MIN_HOLD_FIRST_MS;

    const tick = () => {
      const elapsed = performance.now() - startedAt.current;
      const target = holdTarget.current;
      const ratio = Math.min(1, elapsed / target);
      setPercent(Math.min(99, Math.round(ratio * 100)));

      if (elapsed >= target) setHoldDone(true);
      if (elapsed >= HARD_MAX_MS) {
        setHoldDone(true);
        finish();
        return;
      }
      raf.current = window.requestAnimationFrame(tick);
    };
    raf.current = window.requestAnimationFrame(tick);

    return () => {
      if (raf.current !== null) window.cancelAnimationFrame(raf.current);
    };
  }, [finish]);

  useEffect(() => {
    let cancelled = false;
    setBootError(null);
    setBootReady(false);

    void runBootstrapReadiness((progress) => {
      if (cancelled) return;
      setLabel(progress.label);
    })
      .then(() => {
        if (!cancelled) {
          setBootReady(true);
          setLabel(locale === "en" ? "Ready" : locale === "zh-Hans" ? "准备完成" : "準備完成");
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        // 启动检查失败不堵进站；标一下即可
        const message = error instanceof Error ? error.message : "啟動檢查未完成。";
        setBootError(message);
        setBootReady(true);
        setLabel(
          locale === "en" ? "Ready" : locale === "zh-Hans" ? "准备完成" : "準備完成",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, locale]);

  useEffect(() => {
    if (phase !== "in") return;
    if (!holdDone) return;
    // 最短展示结束后：boot 好或已超时 → 进站；auth 仍 pending 时也允许进（不卡死）
    if (!bootReady && performance.now() - startedAt.current < HARD_MAX_MS - 200) return;
    if (isPending && performance.now() - startedAt.current < HARD_MAX_MS - 200) return;

    clearTimers();
    finishTimer.current = window.setTimeout(finish, 180);
    return clearTimers;
  }, [bootReady, clearTimers, finish, holdDone, isPending, phase]);

  if (phase === "off") return null;

  const skipLabel = locale === "en" ? "Skip" : locale === "zh-Hans" ? "跳过" : "跳過";

  return (
    <div
      className={`fixed inset-0 z-[90] overflow-hidden bg-[#0f1410] transition-opacity duration-[320ms] ease-out ${phase === "leaving" ? "opacity-0" : "opacity-100"}`}
      role="status"
      aria-live="polite"
      aria-label={t("introAria")}
    >
      <div className="absolute inset-0 bg-[#0c100e]" aria-hidden>
        <img
          src={POSTER_SRC}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,10,.16)_0%,rgba(8,12,10,.06)_42%,rgba(8,12,10,.4)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,239,179,.12),transparent_34%)] mix-blend-screen" />
      </div>

      <div className="absolute bottom-[max(18px,env(safe-area-inset-bottom))] right-[max(16px,env(safe-area-inset-right))] z-20">
        <button
          type="button"
          onClick={skip}
          className="rounded-full border border-[#f0dfb4]/4 bg-[#152018]/6 px-4 py-2 text-[11px] tracking-[0.22em] text-[#f7edd0] backdrop-blur-sm"
        >
          {skipLabel}
        </button>
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pb-[max(56px,env(safe-area-inset-bottom))] pt-[max(36px,env(safe-area-inset-top))] text-center text-[#fff9e8]">
        <div className="pt-2">
          <p className="text-[11px] tracking-[0.48em] text-[#f0dfb4]">Z H A O W U</p>
          <p className="mt-2 text-[9px] tracking-[0.34em] text-[#d9c89d]">DESTINY · TIMING · CHOICE</p>
        </div>

        <div className="mt-[10vh] rounded-[28px] border border-[#f8e7bb]/18 bg-[#172018]/2 px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,.12)]">
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
            className="mx-auto flex h-[104px] w-[104px] items-center justify-center rounded-full p-[5px] shadow-[0_0_42px_rgba(241,205,116,.2)]"
            style={{
              background: `conic-gradient(rgba(248,223,155,.98) ${percent * 3.6}deg, rgba(255,255,255,.16) 0deg)`,
            }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1a211a]/72 ring-1 ring-[#f5dfaa]/2">
              <span className="font-display text-[28px] tabular-nums text-[#fff6dc]">
                {percent}
                <span className="ml-0.5 text-sm">%</span>
              </span>
            </div>
          </div>

          <p className="mt-5 font-display text-[17px] tracking-[0.16em] text-[#fff7e5]">
            {locale === "en" ? "Opening" : locale === "zh-Hans" ? "正在开启" : "正在開啟"}
          </p>
          <p className="mt-2 min-h-5 text-[11px] tracking-[0.12em] text-[#e2d5b6]">
            {isPending
              ? locale === "en"
                ? "Checking account"
                : locale === "zh-Hans"
                  ? "正在确认账号状态"
                  : "正在確認帳號狀態"
              : label}
          </p>
          <p className="mt-2 text-[9px] tracking-[0.14em] text-[#cabd9e]">
            {locale === "en"
              ? "Tap Skip anytime"
              : locale === "zh-Hans"
                ? "随时可点跳过"
                : "隨時可點跳過"}
          </p>

          {bootError ? (
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="mt-3 rounded-full border border-[#edd7a3]/45 px-4 py-2 text-[11px] tracking-[0.12em] text-[#fff3d1]"
            >
              {locale === "en" ? "Retry services" : locale === "zh-Hans" ? "重试连接" : "重試連接"}
            </button>
          ) : null}

          <div className="mx-auto mt-5 h-px w-40 bg-[#ecd9a8]/4" />
          <p className="mt-3 text-[9px] tracking-[0.22em] text-[#d4c39f]">STONE 原創 · 2026</p>
        </div>
      </div>
    </div>
  );
}
