import type { AnalysisResult } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { buildAuraBlueprint, auraColorLabel, auraTextSummary, chakraLabel } from "@/lib/report/aura-chakra-blueprint";
import { buildFunctionalTraining, FIVE_ELEMENT_FUNCTIONS, functionalStateLabel } from "@/lib/report/five-element-functional-training";

const COPY = {
  "zh-Hant": {
    eyebrow: "五行功能訓練",
    why: "為什麼是現在",
    how: "現在怎麼用",
    observe: "先看什麼結果",
    avoid: "不要過頭",
    status: "目前狀態",
    auraEyebrow: "個人靈光提示",
    auraTitle: "象徵色與脈輪主題",
    mainColour: "主色",
    supportingColours: "輔色",
    chakraTheme: "視覺主題",
    disclaimer: "靈光／脈輪只作象徵性人格與人生主題圖譜，不是醫學或人體能量檢測。",
  },
  "zh-Hans": {
    eyebrow: "五行功能训练",
    why: "为什么是现在",
    how: "现在怎么用",
    observe: "先看什么结果",
    avoid: "不要过头",
    status: "目前状态",
    auraEyebrow: "个人灵光提示",
    auraTitle: "象征色与脉轮主题",
    mainColour: "主色",
    supportingColours: "辅色",
    chakraTheme: "视觉主题",
    disclaimer: "灵光／脉轮只作象征性人格与人生主题图谱，不是医学或人体能量检测。",
  },
  en: {
    eyebrow: "Five-element function training",
    why: "Why this now",
    how: "What to practise",
    observe: "What to watch first",
    avoid: "Do not overdo it",
    status: "Current status",
    auraEyebrow: "Personal aura cue",
    auraTitle: "Symbolic colour and chakra themes",
    mainColour: "Main colour",
    supportingColours: "Supporting colours",
    chakraTheme: "Visual theme",
    disclaimer: "Aura and chakra language is used only as symbolic personality and life-theme imagery. It is not a medical or body-energy test.",
  },
} as const;

export function FiveElementTrainingBlock({ result }: { result: AnalysisResult }) {
  const { locale } = useI18n();
  const reportLocale = result.locale ?? locale;
  const copy = COPY[reportLocale];
  const training = buildFunctionalTraining(result.chart, reportLocale);
  const aura = buildAuraBlueprint(training);
  const elementCopy = training.selectedElement ? FIVE_ELEMENT_FUNCTIONS[training.selectedElement][reportLocale] : null;

  return (
    <section className="zhaowu-five-element-training grid gap-4" data-five-element-training data-analysis-status={training.analysisStatus}>
      <article className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-6">
        <p className="text-[11px] tracking-[0.24em] text-cinnabar">{copy.eyebrow}</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h4 className="font-display text-xl text-ink">{elementCopy ? `${elementCopy.name}｜${training.functionalTheme}` : training.functionalTheme}</h4>
          <span className="text-xs text-ink-mute">{copy.status}：{functionalStateLabel(training.selectedState, reportLocale)}</span>
        </div>
        <p className="mt-3 text-[15px] leading-7 text-ink-soft">{training.freeTextSummary}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <h5 className="text-sm font-semibold text-ink">{copy.why}</h5>
            <p className="mt-1 text-sm leading-6 text-ink-soft">{training.whySelected}</p>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-ink">{copy.observe}</h5>
            <p className="mt-1 text-sm leading-6 text-ink-soft">{training.observationMarker}</p>
          </div>
        </div>

        {training.howToUse.length ? (
          <div className="mt-5">
            <h5 className="text-sm font-semibold text-ink">{copy.how}</h5>
            <ul className="mt-2 grid gap-2 text-sm leading-6 text-ink-soft">
              {training.howToUse.map((item) => <li key={item} className="flex gap-2"><span aria-hidden>·</span><span>{item}</span></li>)}
            </ul>
          </div>
        ) : null}

        <div className="mt-5 border-t border-line/70 pt-4">
          <h5 className="text-sm font-semibold text-ink">{copy.avoid}</h5>
          <p className="mt-1 text-sm leading-6 text-ink-soft">{training.excessWarning}</p>
          <p className="mt-3 text-xs leading-5 text-ink-mute">{training.warnings.join(" ")}</p>
        </div>
      </article>

      {aura ? (
        <article className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-6" data-aura-symbolic="true">
          <p className="text-[11px] tracking-[0.24em] text-cinnabar">{copy.auraEyebrow}</p>
          <h4 className="mt-2 font-display text-xl text-ink">{copy.auraTitle}</h4>
          <p className="mt-3 text-[15px] leading-7 text-ink-soft">{auraTextSummary(training, aura)}</p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div><span className="block text-xs text-ink-mute">{copy.mainColour}</span><b className="mt-1 block text-ink">{auraColorLabel(aura.primaryColor, reportLocale)}</b></div>
            <div><span className="block text-xs text-ink-mute">{copy.supportingColours}</span><b className="mt-1 block text-ink">{aura.secondaryColors.map((color) => auraColorLabel(color, reportLocale)).join(" · ")}</b></div>
            <div><span className="block text-xs text-ink-mute">{copy.chakraTheme}</span><b className="mt-1 block text-ink">{aura.chakraThemes.slice(0, 2).map((item) => chakraLabel(item.chakra, reportLocale)).join(" · ")}</b></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-ink-mute">{copy.disclaimer}</p>
        </article>
      ) : null}
    </section>
  );
}
