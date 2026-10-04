import { useEffect, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import {
  REPORT_ACCESS_PRODUCTS,
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
};

function copyFor(locale: Locale): Copy {
  if (locale === "en") return {
    title: "Choose how far to read",
    lead: "The basic chart is free. Interpretation after the chart is a one-time purchase.",
    free: "Free",
    freeBody: "Basic chart and calculated placements",
    quick: "Quick read",
    quickBody: "The overview and first priority for this system",
    system: "Full system",
    systemBody: "Every interpretation section in this system",
    bundle: "All systems",
    bundleBody: "Full readings across all six systems on this device",
    buy: "Unlock",
    unlocked: "Unlocked",
    pending: "Payment received. Access is being confirmed…",
    unavailable: "Checkout is not active yet. The prices and free/paid boundary are already fixed.",
  };
  if (locale === "zh-Hans") return {
    title: "选择读取深度",
    lead: "基本盘免费；基本盘之后的解读按次付费，不自动续费。",
    free: "免费",
    freeBody: "基本盘、落位与计算结果",
    quick: "快速读",
    quickBody: "本系统总览与第一个重点",
    system: "完整单盘",
    systemBody: "本系统全部解读段落",
    bundle: "六盘全读",
    bundleBody: "本设备解锁全部六个系统的完整解读",
    buy: "解锁",
    unlocked: "已解锁",
    pending: "付款已收到，正在确认读取权限……",
    unavailable: "付款通道尚未启用；价格与免费／付费边界已经固定。",
  };
  return {
    title: "選擇讀取深度",
    lead: "基本盤免費；基本盤之後的解讀按次付費，不自動續費。",
    free: "免費",
    freeBody: "基本盤、落位與計算結果",
    quick: "快速讀",
    quickBody: "本系統總覽與第一個重點",
    system: "完整單盤",
    systemBody: "本系統全部解讀段落",
    bundle: "六盤全讀",
    bundleBody: "本裝置解鎖全部六個系統的完整解讀",
    buy: "解鎖",
    unlocked: "已解鎖",
    pending: "付款已收到，正在確認讀取權限……",
    unavailable: "付款通道尚未啟用；價格與免費／付費邊界已經固定。",
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
}: {
  system: ReportSystemId;
  locale: Locale;
  quick: ReactNode;
  full: ReactNode;
  personal?: ReactNode;
}) {
  const copy = copyFor(locale);
  const [level, setLevel] = useState<ReportAccessLevel>("none");
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState<ReportAccessProduct | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void resolveReportAccess(system).then((result) => {
      if (cancelled) return;
      setLevel(result.level);
      setPending(result.pending);
    }).finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [system]);

  async function purchase(product: ReportAccessProduct) {
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

  if (checking) return <div className="zhaowu-report-access-loading" aria-live="polite">{locale === "en" ? "Checking access…" : locale === "zh-Hans" ? "正在确认读取权限……" : "正在確認讀取權限……"}</div>;
  if (level === "bundle" || level === "system") return <section className="zhaowu-report-access-content" data-report-access={level}><p className="zhaowu-report-access-status">{copy.unlocked}</p>{personal}{full}</section>;

  return (
    <section className="zhaowu-report-paywall" data-report-paywall={system}>
      {level === "quick" ? <div className="zhaowu-report-access-content" data-report-access="quick"><p className="zhaowu-report-access-status">{copy.unlocked} · {copy.quick}</p>{quick}</div> : null}
      <header>
        <h6>{copy.title}</h6>
        <p>{copy.lead}</p>
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
            <button type="button" disabled={busy !== null} onClick={() => void purchase(tier.id)}>
              {busy === tier.id ? "…" : `${copy.buy} ${REPORT_ACCESS_PRODUCTS[tier.id].price}`}
            </button>
          </article>
        ))}
      </div>
      {pending ? <p className="zhaowu-report-payment-note" role="status">{copy.pending}</p> : null}
      {error ? <p className="zhaowu-report-payment-note is-error" role="alert">{error}</p> : null}
    </section>
  );
}
