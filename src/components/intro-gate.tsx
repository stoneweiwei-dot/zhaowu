import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { runBootstrapReadiness } from "@/lib/bootstrap-readiness";

const KEY = "zhaowu.intro.v19";
const POSTER_SRC = "/intro/loading-poster.jpg?v=20260824-still";

export function IntroGate() {
  const { locale } = useI18n();
  const [off, setOff] = useState(false);

  useEffect(() => {
    void runBootstrapReadiness(() => undefined).catch(() => undefined);
  }, []);

  const enter = useCallback(() => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setOff(true);
  }, []);

  if (off) return null;

  const enterLabel = locale === "en" ? "Enter" : locale === "zh-Hans" ? "进入" : "進入";
  const title = locale === "zh-Hans" ? "昭于未见，梧于有归。" : locale === "en" ? "See what lies unseen. Find where you belong." : "昭於未見，梧於有歸。";
  const lines =
    locale === "en"
      ? ["Destiny is not fate", "Timing is not an answer", "Choice is where it begins"]
      : locale === "zh-Hans"
        ? ["命理不是宿命", "运势不是答案", "选择才是开始"]
        : ["命理不是宿命", "運勢不是答案", "選擇才是開始"];

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden bg-[#1a1810] text-[#fff9e8]" role="dialog" aria-label="昭梧">
      <img src={POSTER_SRC} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 22%" }} draggable={false} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,10,.22)_0%,rgba(18,16,10,.08)_38%,rgba(18,16,10,.46)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pb-[max(56px,env(safe-area-inset-bottom))] pt-[max(36px,env(safe-area-inset-top))] text-center">
        <p className="text-[11px] tracking-[0.48em] text-[#f0dfb4]">Z H A O W U</p>
        <p className="mt-2 text-[9px] tracking-[0.34em] text-[#d9c89d]">DESTINY · TIMING · CHOICE</p>

        <div className="mt-[10vh] rounded-[28px] border border-[#f8e7bb]/18 bg-[#172018]/18 px-5 py-6">
          <h1 className="font-display text-[clamp(1.75rem,8vw,2.55rem)] leading-[1.35] tracking-[0.04em] text-[#fff8de]">{title}</h1>
          <div className="mx-auto mt-5 h-px w-24 bg-[#e9d39b]/75" />
          <div className="mt-5 space-y-2 font-display text-[15px] tracking-[0.12em] text-[#fff7df]">
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <p className="mt-5 font-serif text-[13px] italic tracking-[0.04em] text-[#eadcb8]">See the unseen. Find your ground.</p>
        </div>

        <div className="mt-auto pb-3">
          <button
            type="button"
            onClick={enter}
            className="min-h-12 min-w-[9.5rem] rounded-full border border-[#f0dfb4]/55 bg-[#1a261c]/82 px-8 font-display text-[15px] tracking-[0.28em] text-[#fff6d8]"
          >
            {enterLabel}
          </button>
          <p className="mt-3 text-[9px] tracking-[0.22em] text-[#d4c39f]">STONE 原創 · 2026</p>
        </div>
      </div>
    </div>
  );
}
