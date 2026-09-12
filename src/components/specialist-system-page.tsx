import { SpecialistChart } from "@/components/specialist-chart";
import { useEffect, useMemo, useState } from "react";
import { D60KarmaSection } from "@/components/d60-karma-section";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import {
  formatSharedBirthRecord,
  readSharedBirthRecord,
  sharedBirthFromUnknown,
  writeSharedBirthRecord,
  type SharedBirthRecord,
} from "@/lib/shared-birth";
import {
  buildIndianReading,
  buildPalmReading,
  buildQizhengReading,
  buildWesternReading,
  buildZiweiReading,
  type SpecialistId,
  type SpecialistReading,
} from "@/lib/specialist-reading";
import "@/specialist-system.css";

const D60_BIRTH_EVENT = "zhaowu:d60-birth";

const PAGE = {
  indian: {
    "zh-Hant": { title: "印度古法占星", hint: "古典印度占星的獨立旁證。D60 對出生分鐘非常敏感。" },
    "zh-Hans": { title: "印度古法占星", hint: "古典印度占星的独立旁证。D60 对出生分钟非常敏感。" },
    en: { title: "Classical Indian astrology", hint: "An independent classical Indian reading. D60 is highly sensitive to the birth minute." },
  },
  western: {
    "zh-Hant": { title: "西洋星座", hint: "從太陽、月亮、上升、相位與人生領域看另一種性格與生活視角。" },
    "zh-Hans": { title: "西洋星座", hint: "从太阳、月亮、上升、相位与人生领域看另一种性格与生活视角。" },
    en: { title: "Western astrology", hint: "A separate view through the Sun, Moon, Rising sign, aspects and life areas." },
  },
  ziwei: {
    "zh-Hant": { title: "紫微斗數", hint: "以宮位與時限作獨立旁證，重點看性格、關係、事業、財務與階段主軸。" },
    "zh-Hans": { title: "紫微斗数", hint: "以宫位与时限作独立旁证，重点看性格、关系、事业、财务与阶段主轴。" },
    en: { title: "Zi Wei Dou Shu", hint: "An independent palace-and-timing view of character, relationships, work, money and life phases." },
  },
  qizheng: {
    "zh-Hant": { title: "七政四餘", hint: "從七曜運行看性情、節奏、壓力反應與天時變化。" },
    "zh-Hans": { title: "七政四余", hint: "从七曜运行看性情、节奏、压力反应与天时变化。" },
    en: { title: "Seven Luminaries", hint: "A separate reading of temperament, rhythm, pressure response and timing." },
  },
  past: {
    "zh-Hant": { title: "前世今生", hint: "以文化象意看反覆出現的習性與課題，只作獨立旁證。" },
    "zh-Hans": { title: "前世今生", hint: "以文化象意看反复出现的习性与课题，只作独立旁证。" },
    en: { title: "Past & Present", hint: "Cultural symbolism for recurring habits and themes, kept as an independent supporting layer." },
  },
  dharma: {
    "zh-Hant": { title: "達摩一掌經", hint: "看四世象意，以及被重複加強、留到今生的習慣。" },
    "zh-Hans": { title: "达摩一掌经", hint: "看四世象意，以及被重复加强、留到今生的习惯。" },
    en: { title: "Dharma One-Palm Classic", hint: "Four-life symbolism and repeated habits carried into this life." },
  },
} as const;

const COPY = {
  "zh-Hant": {
    ready: "本卷使用的生辰",
    auto: "分析已依同一份生辰自動完成",
    missing: "尚未找到生辰資料。回首頁填寫一次，六份命理專卷即可共用。",
    edit: "回首頁修改生辰",
    add: "回首頁填寫生辰",
    back: "返回六種專卷",
    overview: "本卷總覽",
  },
  "zh-Hans": {
    ready: "本卷使用的生辰",
    auto: "分析已依同一份生辰自动完成",
    missing: "尚未找到生辰资料。回首页填写一次，六份命理专卷即可共用。",
    edit: "回首页修改生辰",
    add: "回首页填写生辰",
    back: "返回六种专卷",
    overview: "本卷总览",
  },
  en: {
    ready: "Birth record for this volume",
    auto: "This reading was generated from the same saved birth record",
    missing: "No birth record yet. Add it once on the homepage and all six specialist readings can reuse it.",
    edit: "Edit birth record",
    add: "Add birth record",
    back: "Back to six readings",
    overview: "Reading overview",
  },
} as const;

function buildReading(id: SpecialistId, birth: SharedBirthRecord, locale: "zh-Hant" | "zh-Hans" | "en"): SpecialistReading {
  if (id === "western") return buildWesternReading(birth, locale);
  if (id === "ziwei") return buildZiweiReading(birth, locale);
  if (id === "qizheng") return buildQizhengReading(birth, locale);
  if (id === "indian") return buildIndianReading(birth, locale);
  return buildPalmReading(birth, locale);
}

export function SpecialistSystemPage({ id }: { id: SpecialistId }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const page = PAGE[id][locale];
  const { user } = useCurrentUserState();
  const [birth, setBirth] = useState<SharedBirthRecord | null>(() => readSharedBirthRecord());

  useEffect(() => {
    const server = sharedBirthFromUnknown(user?.birthData);
    const next = server ?? readSharedBirthRecord();
    setBirth(next);
    if (server) writeSharedBirthRecord(server);
  }, [user?.id, user?.birthData]);

  const reading = useMemo(() => birth ? buildReading(id, birth, locale) : null, [birth, id, locale]);

  useEffect(() => {
    if (!birth || (id !== "indian" && id !== "past" && id !== "dharma")) return;
    const detail = !birth.timeUnknown && birth.city
      ? { year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, minute: birth.minute, city: birth.city }
      : null;
    window.dispatchEvent(new CustomEvent(D60_BIRTH_EVENT, { detail }));
  }, [birth, id]);

  return (
    <main className="zhaowu-specialist-page" data-specialist-report={id}>
      <section className="zhaowu-specialist-sheet" aria-labelledby="specialist-title">
        <header className="zhaowu-specialist-hero">
          <p className="zhaowu-specialist-kicker">{locale === "en" ? "INDEPENDENT READING" : locale === "zh-Hans" ? "独立分析" : "獨立分析"}</p>
          <h1 id="specialist-title">{page.title}</h1>
          <p className="lead">{page.hint}</p>
        </header>

        {birth ? (
          <div className="zhaowu-specialist-birth">
            <span>{copy.ready}</span>
            <strong>{formatSharedBirthRecord(birth, locale)}</strong>
            {id !== "indian" ? <small>{copy.auto}</small> : null}
          </div>
        ) : <p className="zhaowu-specialist-warning">{copy.missing}</p>}

        {reading?.warning ? <p className="zhaowu-specialist-warning">{reading.warning}</p> : null}

        <div className="zhaowu-specialist-actions">
          <a href="/#bazi">{birth ? copy.edit : copy.add}</a>
          <a href="/#analysis-reports" className="is-secondary">{copy.back}</a>
        </div>

        {reading?.chart ? <SpecialistChart chart={reading.chart} locale={locale} /> : null}

        {reading ? (
          <div className="zhaowu-specialist-sections">
            {reading.lead ? <article className="zhaowu-specialist-overview"><h2>{copy.overview}</h2><p>{reading.lead}</p></article> : null}
            {reading.sections.map((section) => (
              <article key={`${section.title}-${section.body.slice(0, 24)}`}><h2>{section.title}</h2><p>{section.body}</p></article>
            ))}
          </div>
        ) : null}
        {id === "indian" ? <div className="mt-6"><D60KarmaSection variant="standalone" reportBirth={birth && !birth.timeUnknown ? birth : null} /></div> : null}
      </section>
    </main>
  );
}
