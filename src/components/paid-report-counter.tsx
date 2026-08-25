import { useI18n } from "@/lib/i18n";
import { reportTierContract } from "@/lib/report/report-tier-contract";

const COPY = {
  "zh-Hant": {
    kicker: "昭梧・付費櫃檯",
    title: "宋式天地化形完整報告",
    lead: "免費結果已經交付；完整報告與個人天地化形圖在付費後獨立生成，不拖慢前面的文字答案。",
    items: ["問題導向完整報告", "9:16 宋式天地化形主圖", "畫面元素解碼與現實行動提示"],
    staged: "付款功能尚未開放",
    stagedNote: "目前只展示產品內容，不會扣款，也不會偷跑付費生成。",
    ownerPreview: "站主預覽完整報告",
    ownerNote: "站主預覽不代表公開付費已啟用。",
  },
  "zh-Hans": {
    kicker: "昭梧・付费柜台",
    title: "宋式天地化形完整报告",
    lead: "免费结果已经交付；完整报告与个人天地化形图在付费后独立生成，不拖慢前面的文字答案。",
    items: ["问题导向完整报告", "9:16 宋式天地化形主图", "画面元素解码与现实行动提示"],
    staged: "付款功能尚未开放",
    stagedNote: "目前只展示产品内容，不会扣款，也不会偷跑付费生成。",
    ownerPreview: "站主预览完整报告",
    ownerNote: "站主预览不代表公开付费已启用。",
  },
  en: {
    kicker: "ZHAOWU · PAID COUNTER",
    title: "Song-style elemental destiny report",
    lead: "Your free result is already delivered. The full report and personal 9:16 artwork are generated separately after purchase, so they never delay the text answer.",
    items: ["Question-focused full report", "Personal 9:16 Song-style destiny artwork", "Visual key and practical action guidance"],
    staged: "Checkout is not open yet",
    stagedNote: "This counter is a preview only. It cannot charge or start paid generation.",
    ownerPreview: "Owner preview: full report",
    ownerNote: "Owner preview does not mean public checkout is enabled.",
  },
} as const;

export function PaidReportCounter({
  canPreview,
  isBusy,
  onPreview,
}: {
  canPreview: boolean;
  isBusy: boolean;
  onPreview: () => void;
}) {
  const { locale } = useI18n();
  const copy = COPY[locale];

  return (
    <section className="seal-border overflow-hidden rounded-[1.5rem] bg-cream/95" aria-labelledby="paid-counter-title">
      <div className="border-b border-line/70 bg-[linear-gradient(135deg,#f7f0e2_0%,#edf1ea_58%,#e4edf0_100%)] p-5 sm:p-7">
        <p className="text-[10px] font-semibold tracking-[0.28em] text-earth">{copy.kicker}</p>
        <h3 id="paid-counter-title" className="mt-2 font-display text-2xl tracking-[0.04em] text-ink">{copy.title}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">{copy.lead}</p>
      </div>
      <div className="space-y-4 p-5 sm:p-7">
        <ul className="grid gap-2 text-sm leading-7 text-ink-soft">
          {copy.items.map((item) => <li key={item} className="flex gap-2"><span aria-hidden className="text-earth">◆</span><span>{item}</span></li>)}
        </ul>
        {canPreview ? (
          <div className="space-y-2">
            <button type="button" disabled={isBusy} onClick={onPreview} className="min-h-12 w-full rounded-full bg-wood px-5 text-sm font-medium text-cream disabled:opacity-60">
              {copy.ownerPreview}
            </button>
            <p className="text-xs leading-6 text-ink-mute">{copy.ownerNote}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <button type="button" disabled aria-disabled="true" className="min-h-12 w-full cursor-not-allowed rounded-full border border-line bg-paper-deep px-5 text-sm text-ink-mute opacity-80">
              {copy.staged}
            </button>
            <p className="text-xs leading-6 text-ink-mute">{copy.stagedNote}</p>
          </div>
        )}
        <p className="sr-only">{reportTierContract.id}</p>
      </div>
    </section>
  );
}

