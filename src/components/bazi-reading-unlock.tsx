import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { reportAccessPrice, resolveReportAccess, startReportCheckout } from "@/lib/report-access";
import { watchReportAccess } from "@/lib/report-access-watch";
import { oncePerSession, trackConversion } from "@/lib/observability/conversion-telemetry";
import { PurchaseConsent, usePurchaseConsent } from "@/components/purchase-consent";
import type { DataGradeReport } from "@/lib/bazi/data-grade";

/** Default closed; access comes only from the existing server verification. */
export function useBaziReadingAccess() {
  const [unlocked, setUnlocked] = useState(false);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    return watchReportAccess(() => resolveReportAccess("bazi"), access => {
      setUnlocked(access.level === "system");
      setPending(access.pending && access.level !== "system");
    }, () => setUnlocked(false));
  }, []);
  return { unlocked, pending };
}

export function BaziReadingUnlock({ locale, reportId, grade, pending = false }: { locale: Locale; reportId?: string; grade?: DataGradeReport | null; pending?: boolean }) {
  const consent = usePurchaseConsent(grade);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const text = (hant: string, hans: string, en: string) => locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
  useEffect(() => {
    // Rendered only while the reading is locked, so mounting == paywall visible.
    if (oncePerSession("paywall:bazi")) trackConversion("zhaowu_paywall_viewed", { system: "bazi", level: "quick" });
  }, []);
  async function unlock() {
    if (!consent.require() || busy) return;
    setBusy(true);
    setError("");
    try { await startReportCheckout("system", "bazi", reportId); }
    catch (cause) { setError(cause instanceof Error && cause.message === "CHECKOUT_STORAGE_UNAVAILABLE" ? text("無法在此瀏覽器保存付款憑證。請允許網站儲存資料或使用其他瀏覽器後再付款。", "无法在此浏览器保存付款凭证。请允许网站存储数据或使用其他浏览器后再付款。", "This browser cannot save your purchase for recovery. Allow site storage or use another browser before paying.") : text("暫時無法前往付款，請稍後重試。", "暂时无法前往付款，请稍后重试。", "Checkout could not open. Please try again.")); setBusy(false); }
  }
  return <section className="mb-4 mt-4 border-t border-line/60 pt-4" data-bazi-reading-locked>
    <h3 className="font-display text-lg">{text("完整命書", "完整命书", "Full BaZi reading")}</h3>
    <p className="mt-2 text-sm leading-6">{text("你的基本命盤與兩段核心試讀已免費呈現。如想繼續了解完整解讀、詳細時運及連續追問，可按需要開卷。單次付費，不自動續費。", "你的基本命盘与两段核心试读已免费呈现。如想继续了解完整解读、详细时运及连续追问，可按需要开卷。单次付费，不自动续费。", "Your basic chart and two core preview paragraphs are already free. When you want to explore further, unlock the full reading, detailed timing and follow-up questions with a one-time purchase. No automatic renewal.")}</p>
    <PurchaseConsent locale={locale} checked={consent.checked} needed={consent.needed} onChange={consent.toggle} grade={grade} gradeAck={consent.gradeAck} gradeNeeded={consent.gradeNeeded} onGradeChange={consent.toggleGrade} />
    <button type="button" disabled={busy} onClick={() => void unlock()} className="mt-3 min-h-11 rounded-lg bg-cinnabar px-5 text-sm text-cream disabled:opacity-50">{busy ? "…" : text("解鎖", "解锁", "Unlock") + " " + reportAccessPrice("system", "bazi").price}</button>
    {pending ? <p role="status" className="mt-2 text-sm">{text("正在確認付款狀態。如等待較久，請先重新整理本頁，避免重複付款。", "正在确认付款状态。如等待较久，请先刷新本页，避免重复付款。", "Checking payment status. If this takes longer, refresh this page before trying to pay again.")}</p> : null}
    {error ? <p role="alert" className="mt-2 text-sm text-cinnabar">{error}</p> : null}
  </section>;
}
