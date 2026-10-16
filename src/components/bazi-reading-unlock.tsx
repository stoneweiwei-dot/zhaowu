import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { REPORT_ACCESS_PRODUCTS, resolveReportAccess, startReportCheckout } from "@/lib/report-access";
import { PurchaseConsent, usePurchaseConsent } from "@/components/purchase-consent";
import type { DataGradeReport } from "@/lib/bazi/data-grade";

/** Default closed; access comes only from the existing server verification. */
export function useBaziReadingAccess() {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    let alive = true;
    void resolveReportAccess("bazi").then(access => {
      if (alive) setUnlocked(access.level === "system" || access.level === "bundle");
    }).catch(() => { if (alive) setUnlocked(false); });
    return () => { alive = false; };
  }, []);
  return unlocked;
}

export function BaziReadingUnlock({ locale, reportId, grade }: { locale: Locale; reportId?: string; grade?: DataGradeReport | null }) {
  const consent = usePurchaseConsent(grade);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const text = (hant: string, hans: string, en: string) => locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
  async function unlock() {
    if (!consent.require() || busy) return;
    setBusy(true);
    setError("");
    try { await startReportCheckout("system", "bazi", reportId); }
    catch { setError(text("暫時無法前往付款，請稍後重試。", "暂时无法前往付款，请稍后重试。", "Checkout could not open. Please try again.")); setBusy(false); }
  }
  return <section className="mb-4 mt-4 border-t border-line/60 pt-4" data-bazi-reading-locked>
    <h3 className="font-display text-lg">{text("完整命書", "完整命书", "Full BaZi reading")}</h3>
    <p className="mt-2 text-sm leading-6">{text("基本排盤與兩段試讀免費；完整解讀、詳細時運及連續追問，解鎖後閱讀。", "基本排盘与两段试读免费；完整解读、详细时运及连续追问，解锁后阅读。", "Your basic chart and two preview paragraphs are free. Unlock the full reading, detailed timing and follow-up questions.")}</p>
    <PurchaseConsent locale={locale} checked={consent.checked} needed={consent.needed} onChange={consent.toggle} grade={grade} gradeAck={consent.gradeAck} gradeNeeded={consent.gradeNeeded} onGradeChange={consent.toggleGrade} />
    <button type="button" disabled={busy} onClick={() => void unlock()} className="mt-3 min-h-11 rounded-lg bg-cinnabar px-5 text-sm text-cream disabled:opacity-50">{busy ? "…" : text("解鎖", "解锁", "Unlock") + " " + REPORT_ACCESS_PRODUCTS.system.price}</button>
    {error ? <p role="alert" className="mt-2 text-sm text-cinnabar">{error}</p> : null}
  </section>;
}
