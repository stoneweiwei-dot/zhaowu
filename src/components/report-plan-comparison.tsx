import { reportAccessPrice, type ReportSystemId } from "@/lib/report-access";
import type { Locale } from "@/lib/i18n";
import "./report-plan-comparison.css";

type Edition = {
  label: string;
  scope: string;
  benefits: string[];
};
type EditionCopy = {
  title: string;
  lead: string;
  free: Edition;
  standard: Edition;
  deep: Edition;
  current: string;
  once: string;
  portrait: string;
  portraitNote: string;
};

const COPY: Record<Locale, EditionCopy> = {
  "zh-Hant": {
    title: "命書方案，一目了然",
    lead: "依所選命盤系統計價；不是三份內容的累加套餐。",
    free: { label: "免費入門", scope: "所有訪客", benefits: ["基本排盤與計算結果", "核心摘要及開放的快速試讀", "不需購買、不自動續費"] },
    standard: { label: "完整單盤", scope: "七政、西占、印度占星、手相、數秘等一般系統", benefits: ["所選系統完整章節", "該命盤的個人解讀專頁", "附贈三首五音聆聽曲"] },
    deep: { label: "深度命書", scope: "八字或紫微斗數，按單盤計價", benefits: ["所選八字或紫微的完整深讀", "該命盤的個人解讀與時運內容", "附贈三首五音聆聽曲"] },
    current: "目前正在閱讀的方案",
    once: "單次購買・不自動續費",
    portrait: "專屬宋畫肖像",
    portraitNote: "藝術命書正在規劃：未接通自動生成、授權與交付前，不屬現行付費權益，亦不另行收費。",
  },
  "zh-Hans": {
    title: "命书方案，一目了然",
    lead: "按所选命盘系统计价；不是三份内容的叠加套餐。",
    free: { label: "免费入门", scope: "所有访客", benefits: ["基本排盘与计算结果", "核心摘要与开放的快速试读", "无需购买、不自动续费"] },
    standard: { label: "完整单盘", scope: "七政、西占、印度占星、手相、数秘等一般系统", benefits: ["所选系统完整章节", "该命盘的个人解读专页", "附赠三首五音聆听曲"] },
    deep: { label: "深度命书", scope: "八字或紫微斗数，按单盘计价", benefits: ["所选八字或紫微的完整深读", "该命盘的个人解读与时运内容", "附赠三首五音聆听曲"] },
    current: "当前正在阅读的方案",
    once: "单次购买・不自动续费",
    portrait: "专属宋画肖像",
    portraitNote: "艺术命书正在规划：自动生成、授权及交付未接通前，不属于现行付费权益，也不额外收费。",
  },
  en: {
    title: "Compare your reading options",
    lead: "Prices are per chosen system, not a three-report bundle.",
    free: { label: "Free introduction", scope: "Every visitor", benefits: ["Basic calculated chart", "Core summary and available quick preview", "No purchase or recurring charge"] },
    standard: { label: "Full single system", scope: "Qizheng, Western, Indian, palm, numerology and other standard systems", benefits: ["All chapters of the chosen system", "Chart-specific personal profile", "Three included five-tone listening tracks"] },
    deep: { label: "In-depth Destiny Book", scope: "BaZi or Ziwei, purchased separately", benefits: ["Full BaZi or Ziwei in-depth report", "Personal interpretation and timing", "Three included five-tone listening tracks"] },
    current: "You are viewing this plan",
    once: "One-time purchase · no auto-renewal",
    portrait: "Bespoke Song-style portrait",
    portraitNote: "The illustrated edition is in development. It is not included in current paid access until generation, consent and delivery are operational; no additional charge is collected.",
  },
};

const DEEP_SYSTEMS: ReadonlySet<ReportSystemId> = new Set(["bazi", "ziwei"]);

export function ReportPlanComparison({ locale, system }: { locale: Locale; system: ReportSystemId }) {
  const copy = COPY[locale] ?? COPY["zh-Hant"];
  const entries = [
    { key: "free", edition: copy.free, price: "$0", selected: false },
    { key: "standard", edition: copy.standard, price: reportAccessPrice("system", "western").price, selected: !DEEP_SYSTEMS.has(system) },
    { key: "deep", edition: copy.deep, price: reportAccessPrice("system", "bazi").price, selected: DEEP_SYSTEMS.has(system) },
  ];
  return <section className="zw-editions" aria-labelledby={`zw-editions-title-${system}`} data-report-editions={system}>
    <header className="zw-editions__heading">
      <h3 id={`zw-editions-title-${system}`}>{copy.title}</h3>
      <p>{copy.lead}</p>
    </header>
    <div className="zw-editions__list">
      {entries.map(({ key, edition, price, selected }, index) => <section key={key} className="zw-editions__row" data-edition={key} data-selected={selected ? "true" : undefined}>
        <div className="zw-editions__identity">
          <small>{String(index + 1).padStart(2, "0")}</small>
          <div><h4>{edition.label}</h4><p>{edition.scope}</p></div>
          <strong>{price}</strong>
        </div>
        <p className="zw-editions__benefits">{edition.benefits.join(" · ")}</p>
        {selected && <p className="zw-editions__selected">{copy.current}</p>}
      </section>)}
    </div>
    <p className="zw-editions__once">{copy.once}</p>
    <details className="zw-editions__art" data-portrait-roadmap>
      <summary>{copy.portrait}</summary>
      <p>{copy.portraitNote}</p>
    </details>
  </section>;
}
