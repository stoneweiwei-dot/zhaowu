import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FiveToneGift } from "@/components/five-tone-gift";
import { PurchaseConsent, usePurchaseConsent } from "@/components/purchase-consent";
import { DataGradeFooter } from "@/components/data-grade-footer";
import { assessBirthRecord } from "@/lib/bazi/data-grade";
import type { Locale } from "@/lib/i18n";
import type { SharedBirthRecord } from "@/lib/shared-birth";
import {
  REPORT_ACCESS_PRODUCTS,
  redeemPromoCode,
  resolveReportAccess,
  startReportCheckout,
  type ReportAccessLevel,
  type ReportAccessProduct,
  type ReportSystemId,
} from "@/lib/report-access";
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
  bundle: string;
  bundleBody: string;
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
    lead: "The basic chart is free. Interpretation after the chart is a one-time purchase in USD, never auto-renewed.",
    free: "Free",
    freeBody: "Basic chart and calculated placements",
    quick: "Quick read",
    quickBody: "See this system's main conclusion and the first thing to watch in your chart",
    system: "Full system",
    systemBody: "Every section of this system, plus the personal profile written from your own chart",
    bundle: "All systems",
    bundleBody: "Every section of all six systems, plus your full personal chart profile",
    buy: "Unlock",
    unlocked: "Unlocked",
    pending: "Payment received. Access is being confirmed…",
    unavailable: "Checkout is not active yet. The prices and free/paid boundary are already fixed.",
    distinction: "You are purchasing the chart interpretation. A playable five-tone sequence matched to the chart is included as an additional gift.",
    toneBoundary: "Five-tone listening is a traditional cultural practice for rest and self-care, not medical or mental-health treatment.",
    previewLabel: "Your chart in one line",
    bonus: {
      quick: "Included with the report · 1 chart-matched primary-tone track",
      system: "Included with the report · 3 support, primary, and release tracks",
      bundle: "Included with the report · the complete 5-track tone cycle",
    },
    welcomeGift: "🎁 New-user welcome gift · Quick read is free for everyone",
    promoToggle: "Have a code?",
    promoPlaceholder: "Enter code",
    promoSubmit: "Apply",
    promoSuccess: "Code applied — unlocked below.",
    promoError: {
      PROMO_CODE_REQUIRED: "Enter a code first.",
      PROMO_NOT_FOUND: "That code isn't recognised.",
      PROMO_EXPIRED: "That code has expired.",
      PROMO_EXHAUSTED: "That code has already reached its limit.",
      PROMO_WRONG_SYSTEM: "That code doesn't apply to this system.",
      PROMO_ALREADY_REDEEMED: "This browser has already used that code.",
      PROMO_UNAVAILABLE: "The code could not be applied. Please try again.",
    },
  };
  if (locale === "zh-Hans") return {
    title: "选择读取深度",
    lead: "基本盘免费；基本盘之后的解读按次付费，不自动续费。价格以美元计，一次付款。",
    free: "免费",
    freeBody: "基本盘、落位与计算结果",
    quick: "快速读",
    quickBody: "先看到本系统的核心结论，以及你最需要留意的第一件事",
    system: "完整单盘",
    systemBody: "本系统的全部段落，加上依你这张盘写成的个人命格专页",
    bundle: "六盘全读",
    bundleBody: "六个系统的全部段落，加上完整的个人命格专页",
    buy: "解锁",
    unlocked: "已解锁",
    pending: "付款已收到，正在确认读取权限……",
    unavailable: "付款通道尚未启用；价格与免费／付费边界已经固定。",
    distinction: "你购买的是命盘解读；昭梧另随报告附赠依命盘功能取向配置、可直接播放的五音聆听曲。",
    toneBoundary: "此处“疗愈”指放松、调息与自我照顾的文化聆听，不替代医疗、心理治疗或专业诊断。",
    previewLabel: "你这张盘的一句结论",
    bonus: {
      quick: "随报告附赠｜命盘主音 1 首",
      system: "随报告附赠｜生扶音・主音・疏导音 3 首",
      bundle: "随报告附赠｜完整五音序列 5 首",
    },
    welcomeGift: "🎁 新用户的福利 · 快速读对所有人免费开放",
    promoToggle: "有优惠码？",
    promoPlaceholder: "输入代码",
    promoSubmit: "使用",
    promoSuccess: "代码已生效，已为你解锁。",
    promoError: {
      PROMO_CODE_REQUIRED: "请先输入代码。",
      PROMO_NOT_FOUND: "这个代码无法识别。",
      PROMO_EXPIRED: "这个代码已过期。",
      PROMO_EXHAUSTED: "这个代码的名额已用完。",
      PROMO_WRONG_SYSTEM: "这个代码不适用于本系统。",
      PROMO_ALREADY_REDEEMED: "此浏览器已经使用过这个代码。",
      PROMO_UNAVAILABLE: "代码暂时无法使用，请再试一次。",
    },
  };
  return {
    title: "選擇讀取深度",
    lead: "基本盤免費；基本盤之後的解讀按次付費，不自動續費。價格以美元計，一次付款。",
    free: "免費",
    freeBody: "基本盤、落位與計算結果",
    quick: "快速讀",
    quickBody: "先看到本系統的核心結論，以及你最需要留意的第一件事",
    system: "完整單盤",
    systemBody: "本系統的全部段落，加上依你這張盤寫成的個人命格專頁",
    bundle: "六盤全讀",
    bundleBody: "六個系統的全部段落，加上完整的個人命格專頁",
    buy: "解鎖",
    unlocked: "已解鎖",
    pending: "付款已收到，正在確認讀取權限……",
    unavailable: "付款通道尚未啟用；價格與免費／付費邊界已經固定。",
    distinction: "你購買的是命盤解讀；昭梧另隨報告附贈依命盤功能取向配置、可直接播放的五音聆聽曲。",
    toneBoundary: "此處「療癒」指放鬆、調息與自我照顧的文化聆聽，不替代醫療、心理治療或專業診斷。",
    previewLabel: "你這張盤的一句結論",
    bonus: {
      quick: "隨報告附贈｜命盤主音 1 首",
      system: "隨報告附贈｜生扶音・主音・疏導音 3 首",
      bundle: "隨報告附贈｜完整五音序列 5 首",
    },
    welcomeGift: "🎁 新用戶的福利 · 快速讀對所有人免費開放",
    promoToggle: "有優惠碼？",
    promoPlaceholder: "輸入代碼",
    promoSubmit: "使用",
    promoSuccess: "代碼已生效，已為你解鎖。",
    promoError: {
      PROMO_CODE_REQUIRED: "請先輸入代碼。",
      PROMO_NOT_FOUND: "這個代碼無法識別。",
      PROMO_EXPIRED: "這個代碼已過期。",
      PROMO_EXHAUSTED: "這個代碼的名額已用完。",
      PROMO_WRONG_SYSTEM: "這個代碼不適用於本系統。",
      PROMO_ALREADY_REDEEMED: "此瀏覽器已經使用過這個代碼。",
      PROMO_UNAVAILABLE: "代碼暫時無法使用，請再試一次。",
    },
  };
}

const tiers: Array<{ id: ReportAccessProduct; copy: "quick" | "system" | "bundle"; body: "quickBody" | "systemBody" | "bundleBody" }> = [
  { id: "quick", copy: "quick", body: "quickBody" },
  { id: "system", copy: "system", body: "systemBody" },
  { id: "bundle", copy: "bundle", body: "bundleBody" },
];

export function ReportAccessGate({
  system,
  locale,
  quick,
  full,
  personal,
  birth,
  preview,
}: {
  system: ReportSystemId;
  locale: Locale;
  quick: ReactNode;
  full: ReactNode;
  personal?: ReactNode;
  birth?: SharedBirthRecord | null;
  preview?: string;
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
    let cancelled = false;
    void resolveReportAccess(system).then((result) => {
      if (cancelled) return;
      setLevel(result.level);
      setOwner(result.owner === true);
      setPending(result.pending);
    }).finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [system]);

  async function purchase(product: ReportAccessProduct) {
    if (!consent.require()) return;
    setBusy(product);
    setError("");
    try {
      await startReportCheckout(product, system);
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : "";
      setError(code === "PAYMENT_NOT_CONFIGURED" ? copy.unavailable : copy.unavailable);
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
  if (level === "bundle" || level === "system") return <section className="zhaowu-report-access-content" data-report-access={level}><p className="zhaowu-report-access-status">{owner ? (locale === "en" ? "Owner access · Full report, no payment" : locale === "zh-Hans" ? "站主权限 · 完整报告免费阅读" : "站主權限 · 完整報告免費閱讀") : copy.unlocked}</p>{personal}{full}<FiveToneGift birth={birth} locale={locale} level={level} /><DataGradeFooter grade={grade} locale={locale} /></section>;

  return (
    <section className="zhaowu-report-paywall" data-report-paywall={system}>
      {level === "quick" ? <div className="zhaowu-report-access-content" data-report-access="quick"><p className="zhaowu-report-access-status" data-welcome-gift>{copy.welcomeGift}</p>{quick}<FiveToneGift birth={birth} locale={locale} level="quick" /></div> : null}
      <header>
        <h6>{copy.title}</h6>
        {preview ? <p className="zhaowu-report-preview" data-report-preview><span>{copy.previewLabel}</span>{preview}</p> : null}
        <p>{copy.lead}</p>
        <p className="zhaowu-report-distinction">{copy.distinction}</p>
      </header>
      <div className="zhaowu-report-pricing" role="list">
        <article role="listitem" className="is-free">
          <strong>{copy.free}</strong>
          <span>$0</span>
          <p>{copy.freeBody}</p>
        </article>
        {tiers.filter((tier) => level !== "quick" || tier.id !== "quick").map((tier) => (
          <article role="listitem" key={tier.id} className={tier.id === "system" ? "is-featured" : undefined}>
            <strong>{copy[tier.copy]}</strong>
            <span>{REPORT_ACCESS_PRODUCTS[tier.id].price}</span>
            <p>{copy[tier.body]}</p>
            <small>{copy.bonus[tier.id]}</small>
            <button type="button" disabled={busy !== null} onClick={() => void purchase(tier.id)}>
              {busy === tier.id ? "…" : `${copy.buy} ${REPORT_ACCESS_PRODUCTS[tier.id].price}`}
            </button>
          </article>
        ))}
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
