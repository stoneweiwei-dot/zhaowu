import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Mark } from "@/components/marks";
import { INTRO_FRAMES } from "@/lib/intro-frames";

const KEY = "zhaowu.intro.v2";
const MIN_MS = 2400;
const MAX_MS = 7000;
const FRAME_MS = 850;

export function IntroGate() {
  const { t } = useI18n();
  const { isPending } = useCurrentUserState();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const [minElapsed, setMinElapsed] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try { if (sessionStorage.getItem(KEY)) return; } catch { /* still show */ }
    setVisible(true);
    timers.current.push(window.setTimeout(() => setMinElapsed(true), reduced ? 250 : MIN_MS));
    timers.current.push(window.setTimeout(() => { setMinElapsed(true); setSkipped(true); }, MAX_MS));
    if (!reduced) {
      timers.current.push(window.setTimeout(() => setFrameIdx(1), FRAME_MS));
      timers.current.push(window.setTimeout(() => setFrameIdx(2), FRAME_MS * 2));
      timers.current.push(window.setTimeout(() => setFrameIdx(3), FRAME_MS * 3));
    } else setFrameIdx(3);
    return () => timers.current.forEach((id) => window.clearTimeout(id));
  }, [reduced]);

  useEffect(() => {
    if (!visible || leaving || !minElapsed || isPending) return;
    setLeaving(true);
    const id = window.setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    }, reduced ? 20 : 500);
    return () => window.clearTimeout(id);
  }, [visible, leaving, minElapsed, isPending, reduced]);

  if (!visible) return null;
  const showText = reduced || skipped || frameIdx >= 2;
  return (
    <div className={`fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#0d0a08] transition-opacity duration-500 ${leaving ? "pointer-events-none opacity-0" : "opacity-100"}`} role="status" aria-live="polite">
      {!reduced && !skipped ? <div className="absolute inset-0" aria-hidden>{INTRO_FRAMES.map((src, i) => <img key={i} src={src} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === frameIdx ? "opacity-100" : "opacity-0"}`} draggable={false} />)}</div> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#5d321f_0%,#1a1210_42%,#0d0a08_75%)]" />}
      <div className={`relative z-10 flex flex-col items-center gap-5 px-6 text-center transition-opacity duration-500 ${showText ? "opacity-100" : "opacity-0"}`}><Mark id="brand" size={88} className="h-20 w-20 text-[#e8c9a0] intro-seal" /><p className="font-display text-4xl tracking-[0.34em] text-[#f7f0e4]">{t("brand")}</p><p className="text-sm tracking-[0.22em] text-[#e8c9a0]">{t("heroSlogan")}</p><p className="mt-2 text-[11px] tracking-[0.12em] text-white/55">{isPending ? "正在载入账号与报告状态…" : "正在进入昭梧…"}</p>{!reduced && !skipped ? <button type="button" onClick={() => setSkipped(true)} className="mt-3 rounded-full border border-white/20 px-4 py-2 text-[11px] tracking-[0.16em] text-white/55">跳过动画</button> : null}</div>
    </div>
  );
}
