import { useI18n, type Locale } from "@/lib/i18n";
import type { AnalysisResult } from "@/lib/bazi/types";
import {
  buildFamilyFacets,
  buildSeasonalFacet,
  buildShengKeYinYang,
  buildTenGodsPage,
  buildYearlyTable,
  type FamilyFacet,
  type TenGodFamily,
} from "@/lib/report/four-views-model";

/**
 * Four report views for #1091 (draft PR, no merge/deploy).
 * Mounted inside FocusedReportSections as stage 05, paid report only.
 * No scores anywhere: years are dates, everything else is text evidence.
 */

const COPY = {
  "zh-Hant": {
    stageTitle: "四個視圖",
    stageLead: "六維職業力、流年三欄表、十神與調候喜忌、七格行業策略——全部由本盤實際干支算出，不造數、不打分。",
    careerTitle: "六維職業力",
    careerNote: "六個面向為本次提案：十神五大家族加調候；每面向只列本盤實際出現的十神與位置。",
    yearlyTitle: "流年三欄表",
    yearlyNote: "當前大運十年加下一個大運十年；流年干支按立春換年。",
    tenGodsTitle: "十神與調候喜忌",
    tenGodsNote: "喜忌目前屬暫定；完整用神、喜神、忌神、仇神的定奪需要 UA1 主鏈裁決，目前模型無對應模組，故不強行定論。",
    industryTitle: "七格行業策略",
    industryNote: "七格的劃分是本次提案：五大家族加調候適配加歲運時機。方向只作傾向參考，單格不得直接推出職業。",
    shengKeTitle: "生剋與陰陽",
    provisional: "暫定",
    notSeen: "未見",
    currentYear: "今年",
    currentCycle: "當前大運",
    stem: "透干",
    hidden: "藏干",
    daySeat: "日支",
    yearStem: "年干",
    yearBranch: "年支主氣",
    noRelations: "無直接刑沖合害",
    noDayun: "未見大運資料",
    disease: "病",
    medicine: "藥",
    bridge: "通關",
    evidence: "證據",
    usefulLabel: "偏可用",
    drainLabel: "偏耗／需節制",
    seasonLabel: "月令季節",
    monthGodLabel: "月令主氣",
    generates: "生",
    controls: "剋",
    carriers: "本盤位置",
    element: "五行",
    stemsLabel: "天干",
    branchesLabel: "地支",
    colYear: "年份",
    colYearPillar: "流年",
    colCycle: "大運與觸發",
    statusClear: "條件已確認",
    statusProvisional: "條件未完整",
    statusInsufficient: "未能定性",
  },
  "zh-Hans": {
    stageTitle: "四个视图",
    stageLead: "六维职业力、流年三栏表、十神与调候喜忌、七格行业策略——全部由本盘实际干支算出，不造数、不打分。",
    careerTitle: "六维职业力",
    careerNote: "六个面向为本次提案：十神五大家族加调候；每面向只列本盘实际出现的十神与位置。",
    yearlyTitle: "流年三栏表",
    yearlyNote: "当前大运十年加下一个大运十年；流年干支按立春换年。",
    tenGodsTitle: "十神与调候喜忌",
    tenGodsNote: "喜忌目前属暂定；完整用神、喜神、忌神、仇神的定夺需要 UA1 主链裁决，目前模型无对应模块，故不强行定论。",
    industryTitle: "七格行业策略",
    industryNote: "七格的划分为本次提案：五大家族加调候适配加岁运时机。方向只作倾向参考，单格不得直接推出职业。",
    shengKeTitle: "生克与阴阳",
    provisional: "暂定",
    notSeen: "未见",
    currentYear: "今年",
    currentCycle: "当前大运",
    stem: "透干",
    hidden: "藏干",
    daySeat: "日支",
    yearStem: "年干",
    yearBranch: "年支主气",
    noRelations: "无直接刑冲合害",
    noDayun: "未见大运资料",
    disease: "病",
    medicine: "药",
    bridge: "通关",
    evidence: "证据",
    usefulLabel: "偏可用",
    drainLabel: "偏耗／需节制",
    seasonLabel: "月令季节",
    monthGodLabel: "月令主气",
    generates: "生",
    controls: "克",
    carriers: "本盘位置",
    element: "五行",
    stemsLabel: "天干",
    branchesLabel: "地支",
    colYear: "年份",
    colYearPillar: "流年",
    colCycle: "大运与触发",
    statusClear: "条件已确认",
    statusProvisional: "条件未完整",
    statusInsufficient: "未能定性",
  },
  en: {
    stageTitle: "Four views",
    stageLead: "Career facets, year-by-year table, ten gods with seasonal balance, and industry patterns — all computed from this chart. No invented numbers, no scores.",
    careerTitle: "Six-dimension career view",
    careerNote: "The six facets are proposed for this release: the five ten-god families plus seasonal balance. Each facet lists only the ten gods actually present in this chart.",
    yearlyTitle: "Year-by-year table",
    yearlyNote: "Current ten-year cycle plus the next; year pillars change at Lichun.",
    tenGodsTitle: "Ten gods & seasonal balance",
    tenGodsNote: "Favourability is still provisional; full determination of the guiding, favourable, unfavourable and hostile elements needs the UA1 main-chain ruling, which has no module yet, so nothing is forced.",
    industryTitle: "Seven-pattern industry view",
    industryNote: "The seven patterns are proposed for this release: the five families plus seasonal fit plus timing. Directions are tendencies only; one cell never decides a career.",
    shengKeTitle: "Generating, controlling, yin & yang",
    provisional: "provisional",
    notSeen: "not present",
    currentYear: "this year",
    currentCycle: "current cycle",
    stem: "stem",
    hidden: "hidden",
    daySeat: "day branch",
    yearStem: "year stem",
    yearBranch: "year branch",
    noRelations: "no direct clash, punishment, combination or harm",
    noDayun: "no luck-cycle data",
    disease: "Strain",
    medicine: "Remedy",
    bridge: "Bridge",
    evidence: "Evidence",
    usefulLabel: "currently usable",
    drainLabel: "drains / needs restraint",
    seasonLabel: "Birth-month season",
    monthGodLabel: "Month-command god",
    generates: "generates",
    controls: "controls",
    carriers: "In this chart",
    element: "Element",
    stemsLabel: "Stems",
    branchesLabel: "Branches",
    colYear: "Year",
    colYearPillar: "Year pillar",
    colCycle: "Cycle & triggers",
    statusClear: "conditions confirmed",
    statusProvisional: "conditions incomplete",
    statusInsufficient: "cannot be determined",
  },
} as const;

const FAMILY_COPY: Record<TenGodFamily, { hant: string; hans: string; en: string; tendency: { hant: string; hans: string; en: string } }> = {
  比劫: {
    hant: "比劫", hans: "比劫", en: "Peer",
    tendency: {
      hant: "同伴與競爭：並肩分擔，也帶來比較與爭奪。",
      hans: "同伴与竞争：并肩分担，也带来比较与争夺。",
      en: "Peers and competition: shared effort, and rivalry.",
    },
  },
  食傷: {
    hant: "食傷", hans: "食伤", en: "Output",
    tendency: {
      hant: "表達與輸出：才華流動的方向；過度則耗散。",
      hans: "表达与输出：才华流动的方向；过度则耗散。",
      en: "Expression and output: where talent flows; in excess it dissipates.",
    },
  },
  財星: {
    hant: "財星", hans: "财星", en: "Wealth",
    tendency: {
      hant: "資源與交換：經營、變現的方向；須看承載。",
      hans: "资源与交换：经营、变现的方向；须看承载。",
      en: "Resources and exchange: the direction of business and monetisation; capacity still matters.",
    },
  },
  官殺: {
    hant: "官殺", hans: "官杀", en: "Officer",
    tendency: {
      hant: "約束與責任：被看見的位置；有制化才成助力。",
      hans: "约束与责任：被看见的位置；有制化才成助力。",
      en: "Constraint and responsibility: visible positions; only useful when controlled and channelled.",
    },
  },
  印星: {
    hant: "印星", hans: "印星", en: "Resource",
    tendency: {
      hant: "學習與支持：庇護與成長；過度則依賴。",
      hans: "学习与支持：庇护与成长；过度则依赖。",
      en: "Learning and support: shelter and growth; in excess, dependence.",
    },
  },
};

const SEASON_COPY: Record<string, { hant: string; hans: string; en: string }> = {
  春: { hant: "春", hans: "春", en: "Spring" },
  夏: { hant: "夏", hans: "夏", en: "Summer" },
  秋: { hant: "秋", hans: "秋", en: "Autumn" },
  冬: { hant: "冬", hans: "冬", en: "Winter" },
};

const PILLAR_LABEL: Record<string, { stem: string; branch: string }> = {
  year: { stem: "年柱", branch: "年支" },
  month: { stem: "月柱", branch: "月支" },
  day: { stem: "日柱", branch: "日支" },
  time: { stem: "時柱", branch: "時支" },
};

const PILLAR_LABEL_HANS: Record<string, { stem: string; branch: string }> = {
  year: { stem: "年柱", branch: "年支" },
  month: { stem: "月柱", branch: "月支" },
  day: { stem: "日柱", branch: "日支" },
  time: { stem: "时柱", branch: "时支" },
};

const PILLAR_LABEL_EN: Record<string, { stem: string; branch: string }> = {
  year: { stem: "Year", branch: "Year branch" },
  month: { stem: "Month", branch: "Month branch" },
  day: { stem: "Day", branch: "Day branch" },
  time: { stem: "Time", branch: "Time branch" },
};

function pillarLabel(key: string, placement: "stem" | "branch", locale: Locale): string {
  if (locale === "en") return PILLAR_LABEL_EN[key]?.[placement] ?? key;
  if (locale === "zh-Hans") return PILLAR_LABEL_HANS[key]?.[placement] ?? key;
  return PILLAR_LABEL[key]?.[placement] ?? key;
}

function familyName(family: TenGodFamily, locale: Locale): string {
  const item = FAMILY_COPY[family];
  return locale === "en" ? item.en : locale === "zh-Hans" ? item.hans : item.hant;
}

function familyTendency(family: TenGodFamily, locale: Locale): string {
  const item = FAMILY_COPY[family].tendency;
  return locale === "en" ? item.en : locale === "zh-Hans" ? item.hans : item.hant;
}

function occurrenceText(
  occurrence: FamilyFacet["occurrences"][number],
  locale: Locale,
): string {
  const where = occurrence.placement === "stem"
    ? pillarLabel(occurrence.pillar, "stem", locale)
    : `${pillarLabel(occurrence.pillar, "branch", locale)}${locale === "en" ? " " : ""}${locale === "en" ? "hidden" : "藏干"}`;
  const seat = occurrence.daySeat ? (locale === "en" ? " · day branch" : " · 日支") : "";
  return `${where} ${occurrence.god}（${occurrence.element}）${seat}`;
}

function CareerFacetsView({ result, locale }: { result: AnalysisResult; locale: Locale }) {
  const copy = COPY[locale];
  const facets = buildFamilyFacets(result.chart);
  const seasonal = buildSeasonalFacet(result.chart);
  const season = SEASON_COPY[seasonal.season];
  const seasonName = locale === "en" ? season.en : locale === "zh-Hans" ? season.hans : season.hant;
  return (
    <div>
      {facets.map((facet) => (
        <section key={facet.family}>
          <h5>{familyName(facet.family, locale)}</h5>
          <p>{familyTendency(facet.family, locale)}</p>
          {facet.occurrences.length ? (
            <ul>
              {facet.occurrences.map((item, index) => (
                <li key={`${item.god}-${item.pillar}-${item.placement}-${index}`}>{occurrenceText(item, locale)}</li>
              ))}
            </ul>
          ) : (
            <p>{copy.notSeen}</p>
          )}
        </section>
      ))}
      <section>
        <h5>{locale === "en" ? "Seasonal balance" : locale === "zh-Hans" ? "调候" : "調候"}</h5>
        <p>
          {copy.seasonLabel}：{seasonName} · {copy.monthGodLabel}：{seasonal.monthGod ?? copy.notSeen}
        </p>
        <p>
          {copy.usefulLabel}：{seasonal.useful.length ? seasonal.useful.join("、") : copy.notSeen}；
          {copy.drainLabel}：{seasonal.drain.length ? seasonal.drain.join("、") : copy.notSeen}
          {seasonal.provisional ? `（${copy.provisional}）` : ""}
        </p>
        <p>
          {locale === "en"
            ? "Seasonal direction is still provisional."
            : locale === "zh-Hans"
              ? "月令季节与日主冷暖：调候方向仍属暂定。"
              : "月令季節與日主冷暖：調候方向仍屬暫定。"}
        </p>
      </section>
      <p>{copy.careerNote}</p>
    </div>
  );
}

function YearlyTableView({ result, locale }: { result: AnalysisResult; locale: Locale }) {
  const copy = COPY[locale];
  const rows = buildYearlyTable(result.chart);
  if (!rows.length) return <p>{copy.noDayun}</p>;
  return (
    <div>
      <p>{copy.yearlyNote}</p>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="border-b border-black/15 py-2 pr-2 align-top font-semibold">{copy.colYear}</th>
            <th className="border-b border-black/15 py-2 pr-2 align-top font-semibold">{copy.colYearPillar}</th>
            <th className="border-b border-black/15 py-2 align-top font-semibold">{copy.colCycle}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.year}>
              <td className="border-b border-black/10 py-2 pr-2 align-top">
                <b>{row.year}</b>
                {row.isCurrentYear ? <span> · {copy.currentYear}</span> : null}
              </td>
              <td className="border-b border-black/10 py-2 pr-2 align-top">
                <b>{row.ganZhi}</b>
                <br />
                <span>{copy.yearStem}：{row.stemGod}；{copy.yearBranch}：{row.branchGod}</span>
              </td>
              <td className="border-b border-black/10 py-2 align-top">
                <span>{row.dayun} · {row.dayunStartYear}–{row.dayunEndYear}{row.isCurrentDayun ? ` · ${copy.currentCycle}` : ""}</span>
                <br />
                <span>{row.relations.length ? row.relations.map((item) => item.label).join("、") : copy.noRelations}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TenGodsView({ result, locale }: { result: AnalysisResult; locale: Locale }) {
  const copy = COPY[locale];
  const page = buildTenGodsPage(result.chart);
  const remedy = page.remedy;
  const statusLabel = remedy.status === "clear"
    ? copy.statusClear
    : remedy.status === "provisional"
      ? copy.statusProvisional
      : copy.statusInsufficient;
  return (
    <div>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="border-b border-black/15 py-2 pr-2 align-top font-semibold">{locale === "en" ? "Pillar" : locale === "zh-Hans" ? "柱" : "柱"}</th>
            <th className="border-b border-black/15 py-2 pr-2 align-top font-semibold">{locale === "en" ? "Stem god" : locale === "zh-Hans" ? "天干十神" : "天干十神"}</th>
            <th className="border-b border-black/15 py-2 align-top font-semibold">{locale === "en" ? "Hidden stems" : locale === "zh-Hans" ? "藏干十神" : "藏干十神"}</th>
          </tr>
        </thead>
        <tbody>
          {page.pillars.map((pillar) => (
            <tr key={pillar.key}>
              <td className="border-b border-black/10 py-2 pr-2 align-top">{pillarLabel(pillar.key, "stem", locale)}</td>
              <td className="border-b border-black/10 py-2 pr-2 align-top">{pillar.stemGod}</td>
              <td className="border-b border-black/10 py-2 align-top">
                {pillar.hidden.length
                  ? pillar.hidden.map((item) => `${item.stem}·${item.god}（${item.element}）`).join("、")
                  : copy.notSeen}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section>
        <h5>{copy.disease} / {copy.medicine} · {statusLabel}</h5>
        <p><b>{copy.disease}：</b>{remedy.disease}</p>
        <p><b>{copy.medicine}：</b>{remedy.medicine}</p>
        {remedy.bridge ? <p><b>{copy.bridge}：</b>{remedy.bridge}</p> : null}
        {remedy.evidence.length ? (
          <div>
            <p>{copy.evidence}：</p>
            <ul>
              {remedy.evidence.map((line, index) => <li key={index}>{line}</li>)}
            </ul>
          </div>
        ) : null}
      </section>

      <p>
        {copy.usefulLabel}：{page.useful.length ? page.useful.join("、") : copy.notSeen}；
        {copy.drainLabel}：{page.drain.length ? page.drain.join("、") : copy.notSeen}
        {page.provisional ? `（${copy.provisional}）` : ""}
      </p>
      <p>{copy.tenGodsNote}</p>
    </div>
  );
}

function IndustryView({ result, locale }: { result: AnalysisResult; locale: Locale }) {
  const copy = COPY[locale];
  const facets = buildFamilyFacets(result.chart);
  const seasonal = buildSeasonalFacet(result.chart);
  const season = SEASON_COPY[seasonal.season];
  const seasonName = locale === "en" ? season.en : locale === "zh-Hans" ? season.hans : season.hant;
  const yearly = buildYearlyTable(result.chart);
  const currentRow = yearly.find((row) => row.isCurrentYear) ?? yearly.find((row) => row.isCurrentDayun);
  return (
    <div>
      {facets.map((facet) => (
        <section key={facet.family}>
          <h5>{familyName(facet.family, locale)}</h5>
          <p>{familyTendency(facet.family, locale)}</p>
          {facet.occurrences.length ? (
            <p>{facet.occurrences.map((item) => `${item.god}（${item.element}）`).join("、")}</p>
          ) : (
            <p>{copy.notSeen}</p>
          )}
        </section>
      ))}
      <section>
        <h5>{locale === "en" ? "Seasonal fit" : locale === "zh-Hans" ? "调候适配" : "調候適配"}</h5>
        <p>
          {copy.seasonLabel}：{seasonName} · {copy.monthGodLabel}：{seasonal.monthGod ?? copy.notSeen}
          {seasonal.provisional ? `（${copy.provisional}）` : ""}
        </p>
      </section>
      <section>
        <h5>{locale === "en" ? "Timing" : locale === "zh-Hans" ? "岁运时机" : "歲運時機"}</h5>
        {currentRow ? (
          <p>
            {currentRow.dayun} · {currentRow.dayunStartYear}–{currentRow.dayunEndYear}；{currentRow.year}{currentRow.ganZhi}
            {currentRow.relations.length ? `；${currentRow.relations.map((item) => item.label).join("、")}` : ""}
          </p>
        ) : (
          <p>{copy.noDayun}</p>
        )}
      </section>
      <p>{copy.industryNote}</p>
    </div>
  );
}

function ShengKeView({ result, locale }: { result: AnalysisResult; locale: Locale }) {
  const copy = COPY[locale];
  const { nodes, stems, branches } = buildShengKeYinYang(result.chart);
  return (
    <div>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="border-b border-black/15 py-2 pr-2 align-top font-semibold">{copy.element}</th>
            <th className="border-b border-black/15 py-2 pr-2 align-top font-semibold">{copy.carriers}</th>
            <th className="border-b border-black/15 py-2 pr-2 align-top font-semibold">{copy.generates}</th>
            <th className="border-b border-black/15 py-2 align-top font-semibold">{copy.controls}</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => (
            <tr key={node.element}>
              <td className="border-b border-black/10 py-2 pr-2 align-top"><b>{node.element}</b></td>
              <td className="border-b border-black/10 py-2 pr-2 align-top">
                {node.carriers.length
                  ? node.carriers.map((carrier, index) => `${pillarLabel(carrier.pillar, carrier.placement, locale)}`).join("、") + (node.carriers.length > 1 ? "" : "")
                  : copy.notSeen}
              </td>
              <td className="border-b border-black/10 py-2 pr-2 align-top">{node.generates}</td>
              <td className="border-b border-black/10 py-2 pr-2 align-top">{node.controls}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        {copy.stemsLabel}：{stems.map((item) => `${item.text}${item.yinYang === "陽" ? (locale === "en" ? " yang" : "陽") : (locale === "en" ? " yin" : "陰")}`).join(" · ")}
      </p>
      <p>
        {copy.branchesLabel}：{branches.map((item) => `${item.text}${item.yinYang === "陽" ? (locale === "en" ? " yang" : "陽") : (locale === "en" ? " yin" : "陰")}`).join(" · ")}
      </p>
    </div>
  );
}

export function ReportFourViews({ result }: { result: AnalysisResult }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  return (
    <details className="zhaowu-report-stage-fold" data-report-stage="four-views">
      <summary>
        <b className="zhaowu-report-stage-no">05</b>
        <span><strong>{copy.stageTitle}</strong><small>{copy.stageLead}</small></span>
      </summary>
      <div className="zhaowu-report-stage-fold__body">
        <details className="zhaowu-report-fold zhaowu-report-fold--section" data-report-fold>
          <summary><h4>{copy.careerTitle}</h4></summary>
          <div className="zhaowu-report-copy">
            <CareerFacetsView result={result} locale={locale} />
          </div>
        </details>

        <details className="zhaowu-report-fold zhaowu-report-fold--section" data-report-fold>
          <summary><h4>{copy.yearlyTitle}</h4></summary>
          <div className="zhaowu-report-copy">
            <YearlyTableView result={result} locale={locale} />
          </div>
        </details>

        <details className="zhaowu-report-fold zhaowu-report-fold--section" data-report-fold>
          <summary><h4>{copy.tenGodsTitle}</h4></summary>
          <div className="zhaowu-report-copy">
            <TenGodsView result={result} locale={locale} />
          </div>
        </details>

        <details className="zhaowu-report-fold zhaowu-report-fold--section" data-report-fold>
          <summary><h4>{copy.industryTitle}</h4></summary>
          <div className="zhaowu-report-copy">
            <IndustryView result={result} locale={locale} />
          </div>
        </details>

        <details className="zhaowu-report-fold zhaowu-report-fold--section" data-report-fold>
          <summary><h4>{copy.shengKeTitle}</h4></summary>
          <div className="zhaowu-report-copy">
            <ShengKeView result={result} locale={locale} />
          </div>
        </details>
      </div>
    </details>
  );
}
