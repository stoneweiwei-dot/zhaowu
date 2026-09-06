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
    "zh-Hant": { title: "印度古法占星", hint: "看業力細分層；D60 對出生分鐘非常敏感。" },
    "zh-Hans": { title: "印度古法占星", hint: "看业力细分层；D60 对出生分钟非常敏感。" },
    en: { title: "Classical Indian astrology", hint: "Karmic pattern. D60 is highly sensitive to the birth minute." },
  },
  western: {
    "zh-Hant": { title: "西洋星座", hint: "主要看太陽、月亮、上升、相位與人生領域（西洋星盤）。" },
    "zh-Hans": { title: "西洋星座", hint: "主要看太阳、月亮、上升、相位与人生领域（西洋星盘）。" },
    en: { title: "Western astrology", hint: "Sun, Moon, Rising, aspects and life areas." },
  },
  ziwei: {
    "zh-Hant": { title: "紫微斗數", hint: "主要看性格、關係、事業、財務與十年主軸。" },
    "zh-Hans": { title: "紫微斗数", hint: "主要看性格、关系、事业、财务与十年主轴。" },
    en: { title: "Zi Wei Dou Shu", hint: "Character, relationships, work, money and the decade focus." },
  },
  qizheng: {
    "zh-Hant": { title: "七政四餘", hint: "主要看性情、節奏、壓力反應與天時變化。" },
    "zh-Hans": { title: "七政四余", hint: "主要看性情、节奏、压力反应与天时变化。" },
    en: { title: "Seven Luminaries", hint: "Temperament, rhythm, pressure response and timing." },
  },
  past: {
    "zh-Hant": { title: "前世今生", hint: "看前四世文化象意、反覆習性與獨立旁證。" },
    "zh-Hans": { title: "前世今生", hint: "看前四世文化象意、反复习性与独立旁证。" },
    en: { title: "Past & Present", hint: "Carried patterns, prior-life symbolism and an independent supporting layer." },
  },
  dharma: {
    "zh-Hant": { title: "達摩一掌經", hint: "看四世象意，以及被重複加強、留到今生的習慣。" },
    "zh-Hans": { title: "达摩一掌经", hint: "看四世象意，以及被重复加强、留到今生的习惯。" },
    en: { title: "Dharma One-Palm Classic", hint: "Four-life symbolism and repeated habits carried into this life." },
  },
} as const;

const COPY = {
  "zh-Hant": {
    ready: "已讀取共享出生資料",
    auto: "已依同一份生辰自動生成本體系結果",
    missing: "目前還沒有共享出生資料。請先在首頁四柱八字分區填寫一次。",
    edit: "修改出生資料",
    add: "去填寫一次出生資料",
  },
  "zh-Hans": {
    ready: "已读取共享出生资料",
    auto: "已依同一份生辰自动生成本体系结果",
    missing: "目前还没有共享出生资料。请先在首页四柱八字分区填写一次。",
    edit: "修改出生资料",
    add: "去填写一次出生资料",
  },
  en: {
    ready: "Shared birth record ready",
    auto: "This system has automatically generated its result from the same birth record",
    missing: "No shared birth record yet. Add it once in the Zi Ping BaZi section on the homepage.",
    edit: "Edit birth record",
    add: "Add birth record once",
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
  const [birth, setBirth] = useState<SharedBirthRecord | null>(null);

  useEffect(() => {
    const server = sharedBirthFromUnknown(user?.birthData);
    const next = server ?? readSharedBirthRecord();
    setBirth(next);
    if (server) writeSharedBirthRecord(server);
  }, [user?.id, user?.birthData]);

  const reading = useMemo(() => {
    if (!birth) return null;
    return buildReading(id, birth, locale);
  }, [birth, id, locale]);

  useEffect(() => {
    if (!birth || (id !== "indian" && id !== "past" && id !== "dharma")) return;
    const detail = !birth.timeUnknown && birth.city
      ? { year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, minute: birth.minute, city: birth.city }
      : null;
    window.dispatchEvent(new CustomEvent(D60_BIRTH_EVENT, { detail }));
  }, [birth, id]);

  return (
    <main className="zhaowu-specialist-page">
      <section className="zhaowu-specialist-sheet" aria-labelledby="specialist-title">
        <h1 id="specialist-title">{page.title}</h1>
        <p className="lead">{page.hint}</p>
        {birth ? (
          <div className="zhaowu-specialist-birth">
            <span>{copy.ready}</span>
            <strong>{formatSharedBirthRecord(birth, locale)}</strong>
            <small className="mt-1 block text-ink-soft">{copy.auto}</small>
          </div>
        ) : (
          <p className="zhaowu-specialist-warning">{copy.missing}</p>
        )}
        {reading?.warning ? <p className="zhaowu-specialist-warning">{reading.warning}</p> : null}
        <div className="zhaowu-specialist-actions">
          <a href="/#bazi">{birth ? copy.edit : copy.add}</a>
        </div>
        {reading ? (
          <div className="zhaowu-specialist-sections">
            {reading.lead ? <article><h2>{reading.title}</h2><p>{reading.lead}</p></article> : null}
            {reading.sections.map((section) => (
              <article key={`${section.title}-${section.body.slice(0, 24)}`}><h2>{section.title}</h2><p>{section.body}</p></article>
            ))}
          </div>
        ) : null}
        {id === "indian" ? <div className="mt-5"><D60KarmaSection variant="standalone" /></div> : null}
      </section>
    </main>
  );
}
