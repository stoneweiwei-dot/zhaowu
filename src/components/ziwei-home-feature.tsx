import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import "@/ziwei-home-section.css";

const BRANCHES = [
  ["巳", "is-si"], ["午", "is-wu"], ["未", "is-wei"], ["申", "is-shen"],
  ["辰", "is-chen"], ["酉", "is-you"], ["卯", "is-mao"], ["戌", "is-xu"],
  ["寅", "is-yin"], ["丑", "is-chou"], ["子", "is-zi"], ["亥", "is-hai"],
] as const;

export function ZiweiHomeFeature() {
  const { locale } = useI18n();
  const copy = locale === "en"
    ? {
        kicker: "ZHAOWU · ZI WEI DOU SHU",
        title: "A deterministic 12-palace chart",
        lead: "Life Palace, Body Palace, the 14 major stars, transformations, supporting stars, 10-year cycles and annual overlays are calculated first. AI does not invent star positions.",
        points: ["Fixed late-Zi and leap-month policy", "Traceable calculation version", "Chart facts stay separate from interpretation"],
        badge: "NEW · TRUTH LAYER v0.5",
        action: "Open Zi Wei chart",
        center: "12\nPALACES",
      }
    : locale === "zh-Hans"
      ? {
          kicker: "昭梧 · 紫微斗数",
          title: "紫微斗数・十二宫真值命盘",
          lead: "命宫、身宫、五行局、十四主星、四化、辅煞、大限与流年先由固定算法排出，再交给解读层；不让 AI 猜星位。",
          points: ["晚子时与闰月规则固定", "计算版本与来源可追溯", "排盘事实与命理解读彻底分层"],
          badge: "新增 · 真值层 v0.5",
          action: "打开紫微命盘",
          center: "十二\n星宫",
        }
      : {
          kicker: "昭梧 · 紫微斗數",
          title: "紫微斗數・十二宮真值命盤",
          lead: "命宮、身宮、五行局、十四主星、四化、輔煞、大限與流年先由固定算法排出，再交給解讀層；不讓 AI 猜星位。",
          points: ["晚子時與閏月規則固定", "計算版本與來源可追溯", "排盤事實與命理解讀徹底分層"],
          badge: "新增 · 真值層 v0.5",
          action: "打開紫微命盤",
          center: "十二\n星宮",
        };

  return (
    <section className="zhaowu-ziwei-feature" aria-labelledby="ziwei-home-title">
      <div className="zhaowu-ziwei-feature-copy">
        <div className="zhaowu-ziwei-badge">{copy.badge}</div>
        <p className="zhaowu-ziwei-kicker">{copy.kicker}</p>
        <h2 id="ziwei-home-title">{copy.title}</h2>
        <p className="zhaowu-ziwei-lead">{copy.lead}</p>
        <ul>
          {copy.points.map((point) => <li key={point}>{point}</li>)}
        </ul>
        <Link to="/ziwei" className="zhaowu-ziwei-action">
          <span>{copy.action}</span><b aria-hidden>→</b>
        </Link>
      </div>

      <div className="zhaowu-ziwei-mini-chart" aria-hidden="true">
        {BRANCHES.map(([branch, className]) => (
          <span key={branch} className={className}>{branch}</span>
        ))}
        <div className="zhaowu-ziwei-mini-center">
          {copy.center.split("\n").map((line) => <strong key={line}>{line}</strong>)}
          <i>紫微 · 天府</i>
        </div>
      </div>
    </section>
  );
}
