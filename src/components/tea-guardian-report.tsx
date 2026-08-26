import { Link } from "@tanstack/react-router";
import type { Chart } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { localizeTea, recommendGuardianFromChart, type TeaProfile } from "@/lib/tea-guardian";

const COPY = {
  "zh-Hant": {
    kicker: "昭梧・茶仙守護譜",
    title: "你的本命茶仙守護",
    lead: "先按命盤的月令、旺衰底盤與流通候選選出茶型；再做 7 題口味測驗，可把結果修正成真正喝得下去的茶。",
    basis: "這次匹配看了",
    action: "再做口味測驗",
    boundary: "茶仙為昭梧原創文化形象；茶飲建議不是醫療或保健處方。咖啡因敏感、懷孕、服藥或有既往疾病時，請依專業意見調整。",
    imageAlt: "昭梧茶仙守護圖",
  },
  "zh-Hans": {
    kicker: "昭梧・茶仙守护谱",
    title: "你的本命茶仙守护",
    lead: "先按命盘的月令、旺衰底盘与流通候选选出茶型；再做 7 题口味测验，可把结果修正成真正喝得下去的茶。",
    basis: "这次匹配看了",
    action: "再做口味测验",
    boundary: "茶仙为昭梧原创文化形象；茶饮建议不是医疗或保健处方。咖啡因敏感、怀孕、服药或有既往疾病时，请依专业意见调整。",
    imageAlt: "昭梧茶仙守护图",
  },
  en: {
    kicker: "ZHAOWU · TEA GUARDIAN ATLAS",
    title: "Your chart-based tea guardian",
    lead: "This first match uses the Month Command, strength baseline and provisional flow candidates. The seven-question taste test then corrects it toward tea you would genuinely enjoy drinking.",
    basis: "What shaped this match",
    action: "Refine with the taste test",
    boundary: "The guardian is an original Zhaowu cultural character. This tea suggestion is not medical or health advice. Adjust for caffeine sensitivity, pregnancy, medication or existing conditions with appropriate professional guidance.",
    imageAlt: "Zhaowu tea guardian artwork",
  },
} as const;

export function TeaPortraitCard({ tea, label, locale, featured = false }: { tea: TeaProfile; label: string; locale: Locale; featured?: boolean }) {
  const item = localizeTea(tea, locale);
  return (
    <article className={`tea-result-card ${featured ? "is-featured" : ""}`}>
      <div className="tea-result-image-wrap">
        <img src={item.image} alt={`${COPY[locale].imageAlt}・${item.name}`} className="tea-result-image" loading="lazy" decoding="async" />
      </div>
      <div className="tea-result-copy">
        <p className="tea-result-label">{label}</p>
        <h3>{item.name}</h3>
        <p className="tea-result-guardian">{item.guardian}</p>
        <p className="tea-result-meta">{item.origin} · {item.category}</p>
        <p className="tea-result-note">{item.note}</p>
      </div>
    </article>
  );
}

export function TeaGuardianReport({ chart }: { chart: Chart }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const result = recommendGuardianFromChart(chart);
  if (!result.guardian) return null;

  return (
    <section className="tea-guardian-report seal-border" aria-labelledby="tea-guardian-report-title">
      <header className="tea-guardian-report-heading">
        <p>{copy.kicker}</p>
        <h2 id="tea-guardian-report-title">{copy.title}</h2>
        <span>{copy.lead}</span>
      </header>

      <TeaPortraitCard tea={result.guardian} label={copy.title} locale={locale} featured />

      <div className="tea-guardian-basis">
        <h3>{copy.basis}</h3>
        <ul>
          {result.chartEvidence.map((line) => <li key={line[locale]}>{line[locale]}</li>)}
        </ul>
      </div>

      <Link to="/tea-guardian" className="tea-guardian-action">{copy.action}<span aria-hidden>→</span></Link>
      <p className="tea-guardian-boundary">{copy.boundary}</p>
    </section>
  );
}
