import { useMemo, useState, type FormEvent } from "react";
import { BaziChart } from "@/components/bazi-chart";
import { CityPicker } from "@/components/city-picker";
import { buildChart } from "@/lib/bazi/chart";
import { FEATURED_CITIES } from "@/lib/bazi/cities";
import type { AnalyzeInput, Chart, CityHit, Gender } from "@/lib/bazi/types";
import {
  buildHepanIndex,
  buildPalmPairSection,
  buildQizhengPairSection,
  buildZiweiPairSection,
  HEPAN_SYSTEM_TITLES,
  type HepanCivilInput,
  type HepanIndex,
} from "@/lib/hepan/pair-model";
import { useI18n, type Locale } from "@/lib/i18n";
import "./hepan-page.css";

/**
 * Hepan 合盤・緣分指數 page (draft PR, no merge/deploy).
 *
 * Free, no login, no price/payment/auth changes. Two birth records in,
 * two real bazi charts out (the same buildChart the report flow uses),
 * then the hepan pair model scores what the site actually has rules for.
 * Only bazi has a pair score today; ziwei, 一掌經 and 七政 are shown as
 * qualitative comparisons from their own engines (never scored) — each
 * person read by single-person rules, placed side by side. That is the
 * permanent method: Shi has confirmed she has no pair data anywhere
 * and none will arrive, so these sections are not placeholders waiting
 * for pair instructions. Numerology has no single-person data at all
 * and stays out of hepan for now.
 *
 * Visual: the v6 language merged in #1091 — warm paper, gold frame,
 * thin-line sections, Songti headings, no card walls. 390px first.
 */

type PersonDraft = {
  name: string;
  gender: Gender;
  date: string;
  time: string;
  timeUnknown: boolean;
  city: CityHit | null;
};

const EMPTY_PERSON: PersonDraft = {
  name: "",
  gender: "unspecified",
  date: "",
  time: "",
  timeUnknown: false,
  city: null,
};

const SYDNEY = FEATURED_CITIES.find((city) => city.display === "雪梨，澳洲") ?? null;

const DEMO_A: PersonDraft = {
  name: "",
  gender: "male",
  date: "1990-06-15",
  time: "10:30",
  timeUnknown: false,
  city: SYDNEY,
};

const DEMO_B: PersonDraft = {
  name: "",
  gender: "female",
  date: "1992-03-08",
  time: "08:15",
  timeUnknown: false,
  city: SYDNEY,
};

const COPY: Record<Locale, Record<string, string>> = {
  "zh-Hant": {
    kicker: "ZHAOWU · 合盤",
    title: "合盤・緣分指數",
    lead: "兩個人的出生資料，一次對照。八字、紫微、一掌經、七政——有單人規則的系統，兩人各看各的盤，並排對照（哪裡一致、哪裡補充、哪裡角度不同）；生命靈數、西方占星、印度占星、手相目前沒有合盤欄位。八字有分數，其他系統只作定性對照，不造分、不補零。",
    referenceOnly: "僅供參考：分數是契合順暢度，不是命定 verdict。相處從來不是一串數字說了算。",
    formTitle: "兩位當事人",
    personA: "甲",
    personB: "乙",
    nameLabel: "姓名（可留空）",
    namePh: "例如：阿梧",
    genderLabel: "性別",
    genderMale: "男",
    genderFemale: "女",
    genderUnspecified: "不指定",
    dateLabel: "出生日期",
    timeLabel: "出生時間",
    timeUnknownLabel: "不知道時間",
    timeUnknownNote: "不知道時間也可以對照八字：時柱未定，但日主、日支與五行對照不受影響；紫微斗數沒有準確時辰不得使用，一掌經時宮不作判定，七政不排盤。",
    cityLabel: "出生城市",
    cityPh: "請輸入出生城市與國家",
    popularCities: "常用城市",
    optional: "選填",
    submit: "排出兩人命盤，對照一次",
    demo: "填入示範",
    demoNote: "示範：甲 1990-06-15 10:30 雪梨；乙 1992-03-08 08:15 雪梨。只填出生資料，不寫死任何命盤結果。",
    needBoth: "請把兩人的出生日期與出生城市都填好。",
    badDate: "出生日期不正確，請檢查年、月、日。",
    buildFailed: "排盤失敗，請檢查出生資料後再試一次。",
    indexTitle: "緣分指數",
    formulaTitle: "公式（攤開來算）",
    weightsTitle: "這次實際用的權重",
    baziTitle: "八字對照",
    baziLead: "三項都由兩人的真實命盤算出，點開看證據。",
    systemsTitle: "各系統對照",
    conflictsTitle: "分歧要先看",
    noConflicts: "暫無分歧可標：八字三項分數相差不到 30 分，且目前只有一個系統計分，尚無系統間分歧。",
    pendingBadge: "尚無合盤方法 · 不計分",
    qualitativeBadge: "定性對照 · 不計分",
    scoredBadge: "已計分",
    dayPillarTitle: "日柱對照",
    dayMaster: "日主",
    evidenceTitle: "證據",
    methodTitle: "怎麼算的",
    methodBody:
      "日主生剋看兩日主的五行相生、比和或相剋；日支關係看兩日支的六合、三合、沖、刑、害、破與半三合／半三會；五行互補看一方的強項補不補另一方的弱項。性別只作記錄，不參與計分。分數只論契合順暢度：高分是相處省力，低分是需要更多磨合，都不是命定。日支分數是合盤啟發式（compatibility heuristic），不是判命：合先判牽制、合絆，再驗化氣；沖是變動與資源重排的觸發器，不是必凶；六合不是必吉。",
    backToForm: "改出生資料，重新對照",
  },
  "zh-Hans": {
    kicker: "ZHAOWU · 合盘",
    title: "合盘・缘分指数",
    lead: "两个人的出生资料，一次对照。八字、紫微、一掌经、七政——有单人规则的系统，两人各看各的盘，并排对照（哪里一致、哪里补充、哪里角度不同）；生命灵数、西方占星、印度占星、手相目前没有合盘栏位。八字有分数，其他系统只作定性对照，不造分、不补零。",
    referenceOnly: "仅供参考：分数是契合顺畅度，不是命定 verdict。相处从来不是一串数字说了算。",
    formTitle: "两位当事人",
    personA: "甲",
    personB: "乙",
    nameLabel: "姓名（可留空）",
    namePh: "例如：阿梧",
    genderLabel: "性别",
    genderMale: "男",
    genderFemale: "女",
    genderUnspecified: "不指定",
    dateLabel: "出生日期",
    timeLabel: "出生时间",
    timeUnknownLabel: "不知道时间",
    timeUnknownNote: "不知道时间也可以对照八字：时柱未定，但日主、日支与五行对照不受影响；紫微斗数没有准确时辰不得使用，一掌经时宫不作判定，七政不排盘。",
    cityLabel: "出生城市",
    cityPh: "请输入出生城市与国家",
    popularCities: "常用城市",
    optional: "选填",
    submit: "排出两人命盘，对照一次",
    demo: "填入示范",
    demoNote: "示范：甲 1990-06-15 10:30 悉尼；乙 1992-03-08 08:15 悉尼。只填出生资料，不写死任何命盘结果。",
    needBoth: "请把两人的出生日期与出生城市都填好。",
    badDate: "出生日期不正确，请检查年、月、日。",
    buildFailed: "排盘失败，请检查出生资料后再试一次。",
    indexTitle: "缘分指数",
    formulaTitle: "公式（摊开来算）",
    weightsTitle: "这次实际用的权重",
    baziTitle: "八字对照",
    baziLead: "三项都由两人的真实命盘算出，点开看证据。",
    systemsTitle: "各系统对照",
    conflictsTitle: "分歧要先看",
    noConflicts: "暂无分歧可标：八字三项分数相差不到 30 分，且目前只有一个系统计分，尚无系统间分歧。",
    pendingBadge: "尚无合盘方法 · 不计分",
    qualitativeBadge: "定性对照 · 不计分",
    scoredBadge: "已计分",
    dayPillarTitle: "日柱对照",
    dayMaster: "日主",
    evidenceTitle: "证据",
    methodTitle: "怎么算的",
    methodBody:
      "日主生克看两日主的五行相生、比和或相克；日支关系看两日支的六合、三合、冲、刑、害、破与半三合／半三会；五行互补看一方的强项补不补另一方的弱项。性别只作记录，不参与计分。分数只论契合顺畅度：高分是相处省力，低分是需要更多磨合，都不是命定。日支分数是合盘启发式（compatibility heuristic），不是判命：合先判牵制、合绊，再验化气；冲是变动与资源重排的触发器，不是必凶；六合不是必吉。",
    backToForm: "改出生资料，重新对照",
  },
  en: {
    kicker: "ZHAOWU · Compatibility",
    title: "Compatibility · Yuanfen Index",
    lead: "Two birth records, compared once. BaZi, Zi Wei, One-Palm and Seven Luminaries — every system with single-person rules is read person by person and placed side by side (where they agree, where they supplement, where the angle differs); numerology, Western astrology, Vedic astrology and palmistry have no compatibility section for now. Only BaZi is scored; the rest are qualitative comparisons. No invented scores, no silent zeros.",
    referenceOnly: "For reference only: the score measures how smoothly two charts meet, not a fated verdict. No relationship is decided by one number.",
    formTitle: "The two people",
    personA: "A",
    personB: "B",
    nameLabel: "Name (optional)",
    namePh: "e.g. A-Wu",
    genderLabel: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderUnspecified: "Prefer not to say",
    dateLabel: "Birth date",
    timeLabel: "Birth time",
    timeUnknownLabel: "Birth time unknown",
    timeUnknownNote: "You can still compare BaZi without a birth time: the hour pillar stays unset, but the day-master, day-branch and five-element comparisons are unaffected. Without an exact birth hour, Zi Wei must not be used, the One-Palm hour palace is not judged, and Seven Luminaries is not calculated.",
    cityLabel: "Birth city",
    cityPh: "Enter birth city and country",
    popularCities: "Popular cities",
    optional: "Optional",
    submit: "Build both charts and compare",
    demo: "Fill in a demo pair",
    demoNote: "Demo: A, 1990-06-15 10:30 Sydney; B, 1992-03-08 08:15 Sydney. Birth data only — no chart result is hardcoded.",
    needBoth: "Please fill in both birth dates and birth cities.",
    badDate: "The birth date looks wrong — please check year, month and day.",
    buildFailed: "The charts could not be built. Please check the birth data and try again.",
    indexTitle: "Yuanfen Index",
    formulaTitle: "The formula, shown openly",
    weightsTitle: "Weights actually applied this time",
    baziTitle: "BaZi comparison",
    baziLead: "All three readings are computed from the two real charts. Open each one for the evidence.",
    systemsTitle: "System by system",
    conflictsTitle: "Disagreements first",
    noConflicts: "Nothing to flag yet: the three BaZi readings are within 30 points of each other, and only one system is scored, so there is no cross-system disagreement.",
    pendingBadge: "No pair method yet · not scored",
    qualitativeBadge: "Qualitative comparison · not scored",
    scoredBadge: "Scored",
    dayPillarTitle: "Day pillars, side by side",
    dayMaster: "Day master",
    evidenceTitle: "Evidence",
    methodTitle: "How it is calculated",
    methodBody:
      "Day-master generation/control compares the two day-master elements; day-branch relations compare the two day branches (six combinations, triple combinations, clashes, punishments, harms and breaks, plus half-triples); five-element complement checks whether one person's strong elements cover the other's weak ones. Gender is recorded only and never scored. A high score means the meeting is easy; a low score means more conscious work is needed. Neither is fate. Day-branch scores are a compatibility heuristic, not a fate judgement: a combination is first judged as restraint or entanglement, then checked for transformation; a clash is a trigger for change and rearrangement of resources, not automatic harm; a combination is not automatic luck.",
    backToForm: "Change the birth data and compare again",
  },
};

function parseDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

function parseTime(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

function toAnalyzeInput(draft: PersonDraft, locale: Locale): AnalyzeInput | null {
  const date = parseDate(draft.date);
  if (!date || !draft.city) return null;
  const time = draft.timeUnknown ? { hour: 12, minute: 0 } : parseTime(draft.time);
  if (!time) return null;
  return {
    question: "",
    locale,
    year: date.year,
    month: date.month,
    day: date.day,
    hour: time.hour,
    minute: time.minute,
    timeUnknown: draft.timeUnknown,
    gender: draft.gender,
    relation: "any",
    city: draft.city,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: true,
    timeSource: draft.timeUnknown ? undefined : "family-memory",
  };
}

function displayName(draft: PersonDraft, fallback: string): string {
  const name = draft.name.trim();
  return name || fallback;
}

function PersonForm({
  title,
  draft,
  onChange,
  copy,
  locale,
  idPrefix,
}: {
  title: string;
  draft: PersonDraft;
  onChange: (next: PersonDraft) => void;
  copy: Record<string, string>;
  locale: Locale;
  idPrefix: string;
}) {
  const set = (patch: Partial<PersonDraft>) => onChange({ ...draft, ...patch });
  return (
    <section className="hepan-person" aria-label={title}>
      <h3>{title}</h3>
      <label htmlFor={`${idPrefix}-name`}>
        <span>{copy.nameLabel}</span>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={draft.name}
          placeholder={copy.namePh}
          onChange={(event) => set({ name: event.target.value })}
        />
      </label>
      <label htmlFor={`${idPrefix}-gender`}>
        <span>{copy.genderLabel}</span>
        <select
          id={`${idPrefix}-gender`}
          value={draft.gender}
          onChange={(event) => set({ gender: event.target.value as Gender })}
        >
          <option value="male">{copy.genderMale}</option>
          <option value="female">{copy.genderFemale}</option>
          <option value="unspecified">{copy.genderUnspecified}</option>
        </select>
      </label>
      <label htmlFor={`${idPrefix}-date`}>
        <span>{copy.dateLabel}</span>
        <input
          id={`${idPrefix}-date`}
          type="date"
          value={draft.date}
          onChange={(event) => set({ date: event.target.value })}
        />
      </label>
      <div className="hepan-time-row">
        <label htmlFor={`${idPrefix}-time`}>
          <span>{copy.timeLabel}</span>
          <input
            id={`${idPrefix}-time`}
            type="time"
            value={draft.time}
            disabled={draft.timeUnknown}
            onChange={(event) => set({ time: event.target.value })}
          />
        </label>
        <label className="hepan-time-unknown" htmlFor={`${idPrefix}-time-unknown`}>
          <input
            id={`${idPrefix}-time-unknown`}
            type="checkbox"
            checked={draft.timeUnknown}
            onChange={(event) => set({ timeUnknown: event.target.checked })}
          />
          <span>{copy.timeUnknownLabel}</span>
        </label>
      </div>
      <p className="hepan-hint">{copy.timeUnknownNote}</p>
      <CityPicker
        id={`${idPrefix}-city`}
        label={copy.cityLabel}
        placeholder={copy.cityPh}
        optionalLabel={copy.optional}
        popularLabel={copy.popularCities}
        locale={locale}
        value={draft.city}
        onSelect={(city) => set({ city })}
      />
    </section>
  );
}

function DayPillarStrip({
  label,
  chart,
  copy,
}: {
  label: string;
  chart: Chart;
  copy: Record<string, string>;
}) {
  const day = chart.pillars.find((p) => p.key === "day");
  if (!day) return null;
  return (
    <div className="hepan-day-strip">
      <p className="hepan-day-strip__who">{label}</p>
      <p className="hepan-day-strip__pillar" aria-label={`${copy.dayPillarTitle} ${day.ganZhi}`}>
        <span className="hepan-day-strip__gan">{day.gan}</span>
        <span className="hepan-day-strip__zhi">{day.zhi}</span>
      </p>
      <p className="hepan-day-strip__meta">
        {copy.dayMaster} {chart.dayMaster}
        {chart.dayMasterElement} · {chart.cityLabel}
      </p>
      <p className="hepan-day-strip__meta">
        {chart.timeUnknown ? "" : `${chart.trueSolarStamp}`}
      </p>
    </div>
  );
}

export function HepanPage() {
  const { locale } = useI18n();
  const copy = COPY[locale] ?? COPY["zh-Hant"];
  const [personA, setPersonA] = useState<PersonDraft>({ ...EMPTY_PERSON });
  const [personB, setPersonB] = useState<PersonDraft>({ ...EMPTY_PERSON });
  const [result, setResult] = useState<{
    chartA: Chart;
    chartB: Chart;
    index: HepanIndex;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nameA = useMemo(() => displayName(personA, copy.personA), [personA, copy.personA]);
  const nameB = useMemo(() => displayName(personB, copy.personB), [personB, copy.personB]);

  function handleCompare(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const inputA = toAnalyzeInput(personA, locale);
    const inputB = toAnalyzeInput(personB, locale);
    if (!inputA || !inputB) {
      setError(copy.needBoth);
      return;
    }
    if (!parseDate(personA.date) || !parseDate(personB.date)) {
      setError(copy.badDate);
      return;
    }
    try {
      const chartA = buildChart(inputA);
      const chartB = buildChart(inputB);
      const civilA: HepanCivilInput = {
        year: inputA.year,
        month: inputA.month,
        day: inputA.day,
        hour: inputA.hour,
        minute: inputA.minute,
      };
      const civilB: HepanCivilInput = {
        year: inputB.year,
        month: inputB.month,
        day: inputB.day,
        hour: inputB.hour,
        minute: inputB.minute,
      };
      setResult({
        chartA,
        chartB,
        index: buildHepanIndex(chartA, chartB, {
          ziwei: buildZiweiPairSection(chartA, civilA, chartB, civilB),
          yizhangjing: buildPalmPairSection(chartA, civilA, chartB, civilB),
          qizheng: buildQizhengPairSection(chartA, civilA, chartB, civilB),
        }),
      });
    } catch {
      setError(copy.buildFailed);
    }
  }

  function fillDemo() {
    setPersonA({ ...DEMO_A });
    setPersonB({ ...DEMO_B });
    setError(null);
    setResult(null);
  }

  return (
    <div className="zhaowu-focused-report zhaowu-report-continuous-sheet zhaowu-v6-report-pages hepan-page">
      <header className="zhaowu-report-header">
        <p className="zhaowu-report-kicker">{copy.kicker}</p>
        <h1 className="zhaowu-report-title">{copy.title}</h1>
        <p className="zhaowu-report-lead">{copy.lead}</p>
        <p className="hepan-reference-only" role="note">
          {copy.referenceOnly}
        </p>
      </header>

      <form className="hepan-form" onSubmit={handleCompare}>
        <h2 className="zhaowu-section-heading">{copy.formTitle}</h2>
        <div className="hepan-form-grid">
          <PersonForm
            title={copy.personA}
            draft={personA}
            onChange={setPersonA}
            copy={copy}
            locale={locale}
            idPrefix="hepan-a"
          />
          <PersonForm
            title={copy.personB}
            draft={personB}
            onChange={setPersonB}
            copy={copy}
            locale={locale}
            idPrefix="hepan-b"
          />
        </div>
        {error ? (
          <p className="hepan-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="hepan-form-actions">
          <button type="submit">{copy.submit}</button>
          <button type="button" className="hepan-demo-button" onClick={fillDemo}>
            {copy.demo}
          </button>
        </div>
        <p className="hepan-hint">{copy.demoNote}</p>
      </form>

      {result ? (
        <div className="hepan-result">
          <section className="zhaowu-report-fold zhaowu-report-fold--section hepan-index" aria-labelledby="hepan-index-title">
            <h2 id="hepan-index-title" className="zhaowu-section-heading">
              {copy.indexTitle}
            </h2>
            <p className="hepan-index__number" aria-label={`${copy.indexTitle} ${result.index.index}`}>
              {result.index.index}
              <span className="hepan-index__denominator"> / 100</span>
            </p>
            <p className="hepan-reference-only" role="note">
              {copy.referenceOnly}
            </p>
            <h3>{copy.formulaTitle}</h3>
            <p className="zhaowu-report-copy">{result.index.formula}</p>
            <h3>{copy.weightsTitle}</h3>
            <ul className="hepan-weights">
              {result.index.appliedWeights.map((w) => (
                <li key={w.system}>
                  {HEPAN_SYSTEM_TITLES[w.system]}：{Math.round(w.weight * 100)}%
                </li>
              ))}
            </ul>
          </section>

          <section className="zhaowu-report-fold zhaowu-report-fold--section" aria-labelledby="hepan-charts-title">
            <h2 id="hepan-charts-title" className="zhaowu-section-heading">
              {copy.dayPillarTitle}
            </h2>
            <div className="hepan-day-strips">
              <DayPillarStrip label={nameA} chart={result.chartA} copy={copy} />
              <DayPillarStrip label={nameB} chart={result.chartB} copy={copy} />
            </div>
            <div className="hepan-charts">
              <section className="hepan-chart" aria-label={nameA}>
                <h3>{nameA}</h3>
                <BaziChart chart={result.chartA} showHeader={false} />
              </section>
              <section className="hepan-chart" aria-label={nameB}>
                <h3>{nameB}</h3>
                <BaziChart chart={result.chartB} showHeader={false} />
              </section>
            </div>
          </section>

          <section className="zhaowu-report-fold zhaowu-report-fold--section" aria-labelledby="hepan-bazi-title">
            <h2 id="hepan-bazi-title" className="zhaowu-section-heading">
              {copy.baziTitle} · {result.index.bazi.subScore}
            </h2>
            <p className="zhaowu-report-lead">{copy.baziLead}</p>
            {result.index.bazi.readings.map((reading) => (
              <details key={reading.id} className="zhaowu-report-stage-fold hepan-reading">
                <summary>
                  <span className="zhaowu-report-stage-no">{reading.score}</span>
                  {reading.title}
                </summary>
                <div className="zhaowu-report-stage-fold__body">
                  <h4>{copy.evidenceTitle}</h4>
                  <ul>
                    {reading.evidence.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                  <p className="zhaowu-report-copy">{reading.note}</p>
                </div>
              </details>
            ))}
          </section>

          <section className="zhaowu-report-fold zhaowu-report-fold--section" aria-labelledby="hepan-systems-title">
            <h2 id="hepan-systems-title" className="zhaowu-section-heading">
              {copy.systemsTitle}
            </h2>
            <ul className="hepan-systems">
              {result.index.systems.map((system) => (
                <li key={system.id} className="hepan-system" data-status={system.status}>
                  <h3>
                    {system.title}
                    <span className="hepan-system__badge">
                      {system.status === "scored"
                        ? `${copy.scoredBadge} · ${system.score}`
                        : system.status === "qualitative"
                          ? copy.qualitativeBadge
                          : copy.pendingBadge}
                    </span>
                  </h3>
                  <p>{system.detail}</p>
                  {system.lines?.length ? (
                    <ul className="hepan-system-lines">
                      {system.lines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="zhaowu-report-fold zhaowu-report-fold--section" aria-labelledby="hepan-conflicts-title">
            <h2 id="hepan-conflicts-title" className="zhaowu-section-heading">
              {copy.conflictsTitle}
            </h2>
            {result.index.conflicts.length ? (
              <ul className="hepan-conflicts">
                {result.index.conflicts.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="zhaowu-report-copy">{copy.noConflicts}</p>
            )}
          </section>

          <section className="zhaowu-report-fold zhaowu-report-fold--section" aria-labelledby="hepan-method-title">
            <h2 id="hepan-method-title" className="zhaowu-section-heading">
              {copy.methodTitle}
            </h2>
            <p className="zhaowu-report-copy">{copy.methodBody}</p>
            <p>
              <button
                type="button"
                className="mt-2 inline-flex min-h-11 items-center text-sm text-pine underline underline-offset-4"
                onClick={() => {
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {copy.backToForm}
              </button>
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default HepanPage;
