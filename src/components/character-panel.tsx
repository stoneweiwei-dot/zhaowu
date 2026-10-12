import type { Chart } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { characterFacts, chartTerm } from "@/lib/bazi/presentation";
import { DayStemPortrait } from "@/components/day-stem-portrait";
import { BranchScenery } from "@/components/branch-scenery";

// Legacy delivery props remain accepted for saved-report callers. This placement
// now uses only chart-bound local artwork, never a ranked gallery or generated URL.
type Props = {
  chart: Chart;
  question?: string;
  portraitUrl?: string | null;
  selectedAssetId?: string | null;
  onGenerate?: () => void;
  generating?: boolean;
  onImageError?: () => void;
};

export function CharacterPanel({ chart }: Props) {
  const { locale } = useI18n();
  const en = locale === "en", hans = locale === "zh-Hans";
  const title = chartTerm(chart.pillars.find((p) => p.key === "day")?.nayin ?? "", locale);
  return (
    <article className="zhaowu-personal-art seal-border" data-chart-artwork aria-label={en ? "Your stems and branches" : hans ? "你的天干地支" : "你的天干地支"}>
      <header>
        <p className="zhaowu-section-kicker">ZHAOWU · {en ? "YOUR STEMS AND BRANCHES" : "天干地支命象"}</p>
        <h2>{title}</h2>
      </header>
      <dl className="zhaowu-facts">{characterFacts(chart, locale).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
      <DayStemPortrait chart={chart} />
      <BranchScenery chart={chart} />
    </article>
  );
}
