import { useMemo, useState, type FormEvent } from "react";
import { CityPicker } from "@/components/city-picker";
import { buildChart } from "@/lib/bazi/chart";
import { FEATURED_CITIES } from "@/lib/bazi/cities";
import type { AnalyzeInput, Chart, CityHit, Gender } from "@/lib/bazi/types";
import {
  buildHepanIndex,
  buildPalmPairSection,
  buildQizhengPairSection,
  buildZiweiPairSection,
  type HepanCivilInput,
  type HepanIndex,
} from "@/lib/hepan/pair-model";
import { loadHepanEphemeris } from "@/lib/hepan/ephemeris";
import { buildPlainLanguage } from "@/lib/hepan/plain-language";
import { buildNumerologyPairSection } from "@/lib/hepan/numerology";
import { buildVedicPairSection } from "@/lib/hepan/vedic";
import { buildWesternPairSection } from "@/lib/hepan/western";
import { useI18n, type Locale } from "@/lib/i18n";
import "./hepan-page.css";

/**
 * Hepan 合盤・緣分指數 page (draft PR, no merge/deploy).
 *
 * Free, no login, no price/payment/auth changes. Two birth records in,
 * two real bazi charts out (the same buildChart the report flow uses),
 * then the hepan pair model scores what the site actually has rules for.
 * Only bazi has a pair score today; ziwei, 一掌經 and 七政 are shown as
 * qualitative comparisons from their own engines (never scored), and
 * 生命靈數 / 西方占星 / 印度占星 are shown as 分項參考 (sub-scores
 * only — never merged into the headline index, never combined into a
 * cross-system reference total). 手相 is not in hepan in this version.
 * Each person is read by single-person rules, placed side by side.
 * That is the permanent method: Shi has confirmed she has no pair data
 * anywhere and none will arrive, so these sections are not placeholders
 * waiting for pair instructions. Numerology has no single-person data
 * at all (generic Pythagorean system, labelled so); western and vedic
 * positions come from the site's own Astronomy Engine vendor script
 * (loaded on demand when the form is submitted — see
 * src/lib/hepan/ephemeris.ts); if the ephemeris cannot load, those two
 * sections fall back to an honest "unavailable" note and everything
 * else still renders.
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
    lead: "兩個人的出生資料，一次對照。這頁只寫白話：合得來的地方、要多花心思的地方、日常相處的一個提醒。詳細推算都在後台，付費後可以拿到完整版文檔。",
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
    timeUnknownNote: "不知道出生時間也可以對照：只看生日和出生城市就能對照，結果一樣準。有時間會再多看一點。",
    cityLabel: "出生城市",
    cityPh: "請輸入出生城市與國家",
    popularCities: "常用城市",
    optional: "選填",
    submit: "對照一次",
    demo: "填入示範",
    demoNote: "示範：甲 1990-06-15 10:30 雪梨；乙 1992-03-08 08:15 雪梨。只填出生資料，不寫死任何命盤結果。",
    needBoth: "請把兩人的出生日期與出生城市都填好。",
    badDate: "出生日期不正確，請檢查年、月、日。",
    buildFailed: "排盤失敗，請檢查出生資料後再試一次。",
    indexTitle: "緣分指數",
    strengthsTitle: "合得來的地方",
    patienceTitle: "需要多一點耐心的地方",
    reminderTitle: "日常相處的一個提醒",
    plainNote: "這個數字只供參考，相處好不好，一個數字說了不算。",
    emptyStrengths: "這次沒有特別明顯的合拍處，合得來的地方要從日常相處裡慢慢找。",
    emptyPatience: "這次沒有需要特別提醒的地方，順其自然就好。",
    comparing: "正在對照星曆…",
    backToForm: "改出生資料，重新對照",
  },
  "zh-Hans": {
    kicker: "ZHAOWU · 合盘",
    title: "合盘・缘分指数",
    lead: "两个人的出生资料，一次对照。这页只写白话：合得来的地方、要多花心思的地方、日常相处的一个提醒。详细推算都在后台，付费后可以拿到完整版文档。",
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
    timeUnknownNote: "不知道出生时间也可以对照：只看生日和出生城市就能对照，结果一样准。有时间会再多看一点。",
    cityLabel: "出生城市",
    cityPh: "请输入出生城市与国家",
    popularCities: "常用城市",
    optional: "选填",
    submit: "对照一次",
    demo: "填入示范",
    demoNote: "示范：甲 1990-06-15 10:30 悉尼；乙 1992-03-08 08:15 悉尼。只填出生资料，不写死任何命盘结果。",
    needBoth: "请把两人的出生日期与出生城市都填好。",
    badDate: "出生日期不正确，请检查年、月、日。",
    buildFailed: "排盘失败，请检查出生资料后再试一次。",
    indexTitle: "缘分指数",
    strengthsTitle: "合得来的地方",
    patienceTitle: "需要多一点耐心的地方",
    reminderTitle: "日常相处的一个提醒",
    plainNote: "这个数字只供参考，相处好不好，一个数字说了不算。",
    emptyStrengths: "这次没有特别明显的合拍处，合得来的地方要从日常相处里慢慢找。",
    emptyPatience: "这次没有需要特别提醒的地方，顺其自然就好。",
    comparing: "正在对照星历…",
    backToForm: "改出生资料，重新对照",
  },
  en: {
    kicker: "ZHAOWU · Compatibility",
    title: "Compatibility · Yuanfen Index",
    lead: "Two birth records, compared once. This page is in plain words only: what works between you, what needs more patience, and one everyday reminder. The detailed calculation stays behind the scenes; a paid complete document has the full version.",
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
    timeUnknownNote: "You can still compare without a birth time: the date and city are enough, and the result is just as solid. With a time, we look at a little more.",
    cityLabel: "Birth city",
    cityPh: "Enter birth city and country",
    popularCities: "Popular cities",
    optional: "Optional",
    submit: "Compare once",
    demo: "Fill in a demo pair",
    demoNote: "Demo: A, 1990-06-15 10:30 Sydney; B, 1992-03-08 08:15 Sydney. Birth data only — no chart result is hardcoded.",
    needBoth: "Please fill in both birth dates and birth cities.",
    badDate: "The birth date looks wrong — please check year, month and day.",
    buildFailed: "The charts could not be built. Please check the birth data and try again.",
    indexTitle: "Yuanfen Index",
    strengthsTitle: "What works between you",
    patienceTitle: "What needs a little more patience",
    reminderTitle: "One everyday reminder",
    plainNote: "This number is only a reference — no number decides how well two people get along.",
    emptyStrengths: "Nothing stood out as an easy fit this time; the good parts will show up in everyday life.",
    emptyPatience: "Nothing needs a special reminder this time — just take it as it comes.",
    comparing: "Comparing ephemeris…",
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
  const [comparing, setComparing] = useState(false);

  // Plain-language result: computed from the (unchanged) backend model.
  // The page renders only this — no system names, scores, weights or
  // formulas — while the full model stays in the background for the
  // paid complete document.
  const plain = useMemo(
    () => (result ? buildPlainLanguage(result.index, locale) : null),
    [result, locale],
  );

  async function handleCompare(event: FormEvent) {
    event.preventDefault();
    if (comparing) return;
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
    setComparing(true);
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
      const numerology = buildNumerologyPairSection(civilA, civilB);
      // Western + vedic need real planet longitudes from the Astronomy
      // Engine vendor script (loaded on demand). If it cannot load,
      // those two sections fall back to an honest "unavailable" note;
      // everything else still renders.
      let western = buildWesternPairSection({
        available: false,
        reason: "星曆暫時無法載入（網路或天文引擎）",
      });
      let vedic = buildVedicPairSection({
        available: false,
        reason: "星曆暫時無法載入（網路或天文引擎）",
      });
      try {
        const eph = await Promise.race([
          loadHepanEphemeris(
            { civil: civilA, city: inputA.city, timeUnknown: inputA.timeUnknown },
            { civil: civilB, city: inputB.city, timeUnknown: inputB.timeUnknown },
          ),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("ephemeris timeout")), 20000),
          ),
        ]);
        western = buildWesternPairSection({
          available: true,
          a: eph.westernA,
          b: eph.westernB,
          moonReliable: eph.moonReliable,
        });
        if (eph.vedicA && eph.vedicB) {
          vedic = buildVedicPairSection({
            available: true,
            a: eph.vedicA,
            b: eph.vedicB,
            genderA: chartA.gender,
            genderB: chartB.gender,
            lowConfidence: inputA.timeUnknown || inputB.timeUnknown,
          });
        } else {
          vedic = buildVedicPairSection({
            available: false,
            reason: "月亮星座全天不穩定，無法判定",
          });
        }
      } catch {
        // Keep the fallbacks above; the bazi/ziwei/palm/qizheng/numerology
        // sections are unaffected.
      }
      setResult({
        chartA,
        chartB,
        index: buildHepanIndex(chartA, chartB, {
          ziwei: buildZiweiPairSection(chartA, civilA, chartB, civilB),
          yizhangjing: buildPalmPairSection(chartA, civilA, chartB, civilB),
          qizheng: buildQizhengPairSection(chartA, civilA, chartB, civilB),
          numerology,
          western,
          vedic,
        }),
      });
    } catch {
      setError(copy.buildFailed);
    } finally {
      setComparing(false);
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
          <button type="submit" disabled={comparing}>
            {comparing ? copy.comparing : copy.submit}
          </button>
          <button type="button" className="hepan-demo-button" onClick={fillDemo}>
            {copy.demo}
          </button>
        </div>
        <p className="hepan-hint">{copy.demoNote}</p>
      </form>

      {result && plain ? (
        <div className="hepan-result">
          <section className="zhaowu-report-fold zhaowu-report-fold--section hepan-index" aria-labelledby="hepan-index-title">
            <h2 id="hepan-index-title" className="zhaowu-section-heading">
              {copy.indexTitle}
            </h2>
            <p className="hepan-index__number" aria-label={`${copy.indexTitle} ${result.index.index}`}>
              {result.index.index}
              <span className="hepan-index__denominator"> / 100</span>
            </p>
            <p className="hepan-plain__headline">{plain.headline}</p>
            <p className="zhaowu-report-copy">{copy.plainNote}</p>
          </section>

          <section className="zhaowu-report-fold zhaowu-report-fold--section" aria-labelledby="hepan-strengths-title">
            <h2 id="hepan-strengths-title" className="zhaowu-section-heading">
              {copy.strengthsTitle}
            </h2>
            {plain.strengths.length ? (
              <ul className="hepan-plain-list">
                {plain.strengths.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="zhaowu-report-copy">{copy.emptyStrengths}</p>
            )}
          </section>

          <section className="zhaowu-report-fold zhaowu-report-fold--section" aria-labelledby="hepan-patience-title">
            <h2 id="hepan-patience-title" className="zhaowu-section-heading">
              {copy.patienceTitle}
            </h2>
            {plain.patience.length ? (
              <ul className="hepan-plain-list">
                {plain.patience.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="zhaowu-report-copy">{copy.emptyPatience}</p>
            )}
          </section>

          <section className="zhaowu-report-fold zhaowu-report-fold--section" aria-labelledby="hepan-reminder-title">
            <h2 id="hepan-reminder-title" className="zhaowu-section-heading">
              {copy.reminderTitle}
            </h2>
            <p className="zhaowu-report-copy">{plain.reminder}</p>
            <p className="hepan-plain__footer">{plain.footer}</p>
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
