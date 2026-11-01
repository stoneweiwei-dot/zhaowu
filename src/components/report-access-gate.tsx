import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FiveToneGift } from "@/components/five-tone-gift";
import { PremiumPoeticAfterword, type PremiumPoeticContext } from "@/components/premium-poetic-afterword";
import { PurchaseConsent, usePurchaseConsent } from "@/components/purchase-consent";
import { DataGradeFooter } from "@/components/data-grade-footer";
import { ReportPlanComparison } from "@/components/report-plan-comparison";
import { assessBirthRecord } from "@/lib/bazi/data-grade";
import type { Locale } from "@/lib/i18n";
import type { SharedBirthRecord } from "@/lib/shared-birth";
import {
  reportAccessPrice,
  redeemPromoCode,
  resolveReportAccess,
  startReportCheckout,
  type ReportAccessLevel,
  type ReportAccessProduct,
  type ReportSystemId,
} from "@/lib/report-access";
import { oncePerSession, trackConversion } from "@/lib/observability/conversion-telemetry";
import { watchReportAccess } from "@/lib/report-access-watch";
import "@/report-access.css";

type Copy = {
  title: string;
  lead: string;
  free: string;
  freeBody: string;
  quick: string;
  quickBody: string;
  system: string;
  systemBody: string;
  buy: string;
  unlocked: string;
  pending: string;
  unavailable: string;
  distinction: string;
  toneBoundary: string;
  previewLabel: string;
  bonus: Record<ReportAccessProduct, string>;
  welcomeGift: string;
  promoToggle: string;
  promoPlaceholder: string;
  promoSubmit: string;
  promoSuccess: string;
  promoError: Record<string, string>;
};

function copyFor(locale: Locale): Copy {
  if (locale === "en") return {
    title: "Choose how far to read",
    lead: "The basic chart is free. Paid reports are one-time purchases shown in a fixed local currency when available, never auto-renewed.",
    free: "Free",
    freeBody: "Basic chart and calculated placements",
    quick: "Quick read",
    quickBody: "See this system's main conclusion and the first thing to watch in your chart",
    system: "Full system",
    systemBody: "Every section of this system, plus the personal profile written from your own chart",
      buy: "Unlock",
    unlocked: "Unlocked",
    pending: "Checking payment status. If this takes longer, refresh this page before trying to pay again.",
    unavailable: "Checkout is not active yet. The prices and free/paid boundary are already fixed.",
    distinction: "You are purchasing the chart interpretation. A playable five-tone sequence matched to the chart is included as an additional gift.",
    toneBoundary: "Five-tone listening is a traditional cultural practice for rest and self-care, not medical or mental-health treatment.",
    previewLabel: "Your chart in one line",
    bonus: {
      quick: "Included with the report · 1 chart-matched primary-tone track",
      system: "Included with the report · 3 support, primary, and release tracks",
    },
    welcomeGift: "Complimentary first reading · Open to every visitor",
    promoToggle: "Have a code?",
    promoPlaceholder: "Enter code",
    promoSubmit: "Apply",
    promoSuccess: "Code applied — unlocked below.",
    promoError: {
      PROMO_CODE_REQUIRED: "Enter a code first.",
      PROMO_INVALID: "That code can't be used.",
      PROMO_UNAVAILABLE: "The code could not be applied. Please try again.",
    },
  };
  if (locale === "zh-Hans") return {
    title: "选择读取深度",
    lead: "基本盘免费；付费解读按次购买、不自动续费，并优先显示已固定的当地货币价格，不按实时汇率变化。",
    free: "免费",
    freeBody: "基本盘、落位与计算结果",
    quick: "快速读",
    quickBody: "先看到本系统的核心结论，以及你最需要留意的第一件事",
    system: "完整单盘",
    systemBody: "本系统的全部段落，加上依你这张盘写成的个人命格专页",
    buy: "解锁",
    unlocked: "已解锁",
    pending: "正在确认付款状态。如等待较久，请先刷新本页，避免重复付款。",
    unavailable: "付款通道尚未启用；价格与免费／付费边界已经固定。",
    distinction: "你购买的是命盘解读；昭梧另随报告附赠依命盘功能取向配置、可直接播放的五音聆听曲。",
    toneBoundary: "此处“疗愈”指放松、调息与自我照顾的文化聆听，不替代医疗、心理治疗或专业诊断。",
    previewLabel: "你这张盘的一句结论",
    bonus: {
      quick: "随报告附赠｜命盘主音 1 首",
      system: "随报告附赠｜生扶音・主音・疏导音 3 首",
    },
    welcomeGift: "免費試讀 · 所有訪客均可閱讀".replace("免費試讀 · 所有訪客均可閱讀","免费试读 · 向所有访客开放"),
    promoToggle: "有优惠码？",
    promoPlaceholder: "输入代码",
    promoSubmit: "使用",
    promoSuccess: "代码已生效，已为你解锁。",
    promoError: {
      PROMO_CODE_REQUIRED: "请先输入代码。",
      PROMO_INVALID: "这个代码无法使用。",
      PROMO_UNAVAILABLE: "代码暂时无法使用，请再试一次。",
    },
  };
  return {
    title: "選擇讀取深度",
    lead: "基本盤免費；付費解讀按次購買、不自動續費，並優先顯示已固定的當地貨幣價格，不按即時匯率變化。",
    free: "免費",
    freeBody: "基本盤、落位與計算結果",
    quick: "快速讀",
    quickBody: "先看到本系統的核心結論，以及你最需要留意的第一件事",
    system: "完整單盤",
    systemBody: "本系統的全部段落，加上依你這張盤寫成的個人命格專頁",
    buy: "解鎖",
    unlocked: "已解鎖",
    pending: "正在確認付款狀態。如等待較久，請先重新整理本頁，避免重複付款。",
    unavailable: "付款通道尚未啟用；價格與免費／付費邊界已經固定。",
    distinction: "你購買的是命盤解讀；昭梧另隨報告附贈依命盤功能取向配置、可直接播放的五音聆聽曲。",
    toneBoundary: "此處「療癒」指放鬆、調息與自我照顧的文化聆聽，不替代醫療、心理治療或專業診斷。",
    previewLabel: "你這張盤的一句結論",
    bonus: {
      quick: "隨報告附贈｜命盤主音 1 首",
      system: "隨報告附贈｜生扶音・主音・疏導音 3 首",
    },
    welcomeGift: "免費試讀 · 所有訪客均可閱讀",
    promoToggle: "有優惠碼？",
    promoPlaceholder: "輸入代碼",
    promoSubmit: "使用",
    promoSuccess: "代碼已生效，已為你解鎖。",
    promoError: {
      PROMO_CODE_REQUIRED: "請先輸入代碼。",
      PROMO_INVALID: "這個代碼無法使用。",
      PROMO_UNAVAILABLE: "代碼暫時無法使用，請再試一次。",
    },
  };
}

export function ReportAccessGate({
  system,
  locale,
  quick,
  full,
  personal,
  birth,
  preview,
  poeticContext,
}: {
  system: ReportSystemId;
  locale: Locale;
  quick: ReactNode;
  full: ReactNode;
  personal?: ReactNode;
  birth?: SharedBirthRecord | null;
  preview?: string;
  poeticContext?: PremiumPoeticContext;
}) {
  const copy = copyFor(locale);
  const [level, setLevel] = useState<ReportAccessLevel>("none");
  const [owner, setOwner] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState<ReportAccessProduct | null>(null);
  const [error, setError] = useState("");
  const grade = useMemo(() => (birth ? assessBirthRecord(birth) : null), [birth]);
  const consent = usePurchaseConsent(grade);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);

  useEffect(() => {
    return watchReportAccess(() => resolveReportAccess(system), (result) => {
      setLevel(result.level);
      setOwner(result.owner === true);
      setPending(result.pending);
      setChecking(false);
    }, () => setChecking(false));
  }, [system]);

  useEffect(() => {
    // Paywall is visible only to non-owner visitors without the paid tier.
    if (!checking && !owner && level !== "system" && oncePerSession(`paywall:${system}`)) {
      trackConversion("zhaowu_paywall_viewed", { system, level });
    }
  }, [checking, owner, level, system]);

  async function purchase(product: ReportAccessProduct) {
    if (!consent.require()) return;
    setBusy(product);
    setError("");
    try {
      await startReportCheckout(product, system);
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : "";
      setError(code === "CHECKOUT_STORAGE_UNAVAILABLE"
        ? (locale === "en" ? "This browser cannot save your purchase for recovery. Allow site storage or use another browser before paying." : locale === "zh-Hans" ? "无法在此浏览器保存付款凭证。请允许网站存储数据或使用其他浏览器后再付款。" : "無法在此瀏覽器保存付款憑證。請允許網站儲存資料或使用其他瀏覽器後再付款。")
        : copy.unavailable);
      setBusy(null);
    }
  }

  async function applyPromoCode() {
    if (!consent.require()) return;
    setPromoError("");
    setPromoSuccess(false);
    if (!promoCode.trim()) {
      setPromoError(copy.promoError.PROMO_CODE_REQUIRED);
      return;
    }
    setPromoBusy(true);
    try {
      const unlocked = await redeemPromoCode(promoCode, system);
      setLevel(unlocked);
      setPromoSuccess(true);
      setPromoCode("");
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : "";
      setPromoError(copy.promoError[code] ?? copy.promoError.PROMO_UNAVAILABLE);
    } finally {
      setPromoBusy(false);
    }
  }

  if (checking) return <div className="zhaowu-report-access-loading" aria-live="polite">{locale === "en" ? "Checking access…" : locale === "zh-Hans" ? "正在确认读取权限……" : "正在確認讀取權限……"}</div>;
  if (level === "system") return <section className="zhaowu-report-access-content" data-report-access={level}><p className="zhaowu-report-access-status">{owner ? (locale === "en" ? "Owner access · Full report, no payment" : locale === "zh-Hans" ? "站主权限 · 完整报告免费阅读" : "站主權限 · 完整報告免費閱讀") : copy.unlocked}</p>{personal}{full}<FiveToneGift birth={birth} locale={locale} level={level} /><DataGradeFooter grade={grade} locale={locale} />{poeticContext ? <PremiumPoeticAfterword locale={locale} context={poeticContext} /> : null}</section>;

  return (
    <section className="zhaowu-report-paywall" data-report-paywall={system}>
      {level === "quick" ? <div className="zhaowu-report-access-content" data-report-access="quick"><p className="zhaowu-report-access-status" data-welcome-gift>{copy.welcomeGift}</p>{quick}<FiveToneGift birth={birth} locale={locale} level="quick" /></div> : null}
      <header>
        <h6>{copy.title}</h6>
        {preview ? <p className="zhaowu-report-preview" data-report-preview><span>{copy.previewLabel}</span>{preview}</p> : null}
        <p>{copy.lead}</p>
        <p className="zhaowu-report-distinction">{copy.distinction}</p>
      </header>
      <ReportPlanComparison locale={locale} system={system} />
      <div className="zhaowu-report-pricing zw-editions-purchase">
        <p>{copy.system} · {reportAccessPrice("system", system).price}</p>
        <small>{copy.systemBody}</small>
        <button type="button" disabled={busy !== null} onClick={() => void purchase("system")}>
          {busy === "system" ? "…" : `${copy.buy} ${reportAccessPrice("system", system).price}`}
        </button>
      </div>
      <div className="zhaowu-report-promo" data-report-promo>
        {!promoOpen ? (
          <button type="button" className="zhaowu-report-promo-toggle" onClick={() => setPromoOpen(true)}>{copy.promoToggle}</button>
        ) : (
          <form
            className="zhaowu-report-promo-form"
            onSubmit={(event) => { event.preventDefault(); void applyPromoCode(); }}
          >
            <label className="sr-only" htmlFor={`promo-code-${system}`}>{copy.promoToggle}</label>
            <input
              id={`promo-code-${system}`}
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              placeholder={copy.promoPlaceholder}
              value={promoCode}
              disabled={promoBusy}
              onChange={(event) => { setPromoCode(event.target.value); setPromoError(""); setPromoSuccess(false); }}
            />
            <button type="submit" disabled={promoBusy}>{promoBusy ? "…" : copy.promoSubmit}</button>
          </form>
        )}
        {promoError ? <p className="zhaowu-report-promo-note is-error" role="alert">{promoError}</p> : null}
        {promoSuccess ? <p className="zhaowu-report-promo-note is-success" role="status">{copy.promoSuccess}</p> : null}
      </div>
      <PurchaseConsent locale={locale} checked={consent.checked} needed={consent.needed} onChange={consent.toggle} grade={grade} gradeAck={consent.gradeAck} gradeNeeded={consent.gradeNeeded} onGradeChange={consent.toggleGrade} />
      <p className="zhaowu-report-tone-boundary">{copy.toneBoundary}</p>
      {pending ? <p className="zhaowu-report-payment-note" role="status">{copy.pending}</p> : null}
      {error ? <p className="zhaowu-report-payment-note is-error" role="alert">{error}</p> : null}
    </section>
  );
}
