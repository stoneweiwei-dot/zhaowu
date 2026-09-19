import { useMemo } from "react";
import type { Locale } from "@/lib/i18n";
import { calculateLifeNumber, NUMEROLOGY_PROFILES, tx } from "@/lib/numerology";
import type { SharedBirthRecord } from "@/lib/shared-birth";
import {
  buildIndianReading,
  buildPalmReading,
  buildQizhengReading,
  buildWesternReading,
  buildZiweiReading,
  type SpecialistReading,
} from "@/lib/specialist-reading";

type Foundation = {
  dayMaster: string;
  monthOrder: string;
  strength: string;
  structure: string;
  features: string;
};

type ReportSection = { title: string; body: string[] };

function sectionBody(reading: SpecialistReading, title: RegExp, fallback = "") {
  return reading.sections.find((section) => title.test(section.title))?.body.trim() || fallback;
}

function numberedBody(reading: SpecialistReading, index: number) {
  return reading.sections.find((section) => section.title === String(index))?.body.trim() || "";
}

function tableInterpretations(reading: SpecialistReading, title: RegExp, rows: number[]) {
  const table = reading.sections.find((section) => title.test(section.title))?.table;
  if (!table) return [];
  return rows.map((rowIndex) => table.rows[rowIndex]?.at(-1)?.trim() || "").filter(Boolean);
}

function unique(lines: string[], locale: Locale) {
  return [...new Set(lines.map((line) => withoutMethodLabels(line, locale)).filter(Boolean))];
}

function withoutMethodLabels(text: string, locale: Locale) {
  const internal = locale === "en" ? "internal cross-check" : locale === "zh-Hans" ? "内部交叉校验" : "內部交叉校驗";
  const timeDetail = locale === "en" ? "time-sensitive detail" : locale === "zh-Hans" ? "时间敏感细分层" : "時間敏感細分層";
  return text
    .replace(/印度古法占星|Classical Indian Astrology|Indian astrology/gi, internal)
    .replace(/紫微斗數|紫微斗数|Zi Wei Dou Shu/gi, internal)
    .replace(/七政四餘|七政四余|Seven Luminaries/gi, internal)
    .replace(/西洋星座|Western astrology/gi, internal)
    .replace(/達摩一掌經|达摩一掌经|一掌經|一掌经|Dharma One-Palm Classic/gi, internal)
    .replace(/生命靈數|生命灵数|Numerology/gi, internal)
    .replace(/D60/gi, timeDetail)
    .replace(/本卷/g, "本報告")
    .replace(/\s+/g, " ")
    .trim();
}

function reportCopy(locale: Locale) {
  if (locale === "en") return {
    kicker: "ONE BIRTH RECORD · ONE REPORT",
    title: "Your complete integrated report",
    lead: "The specialist systems are cross-checked internally. You receive one continuous plain-language report, not separate schools or repeated cards.",
    basis: "Core structure",
    nature: "Temperament and inner rhythm",
    relation: "Relationships and interaction",
    work: "Work, resources and real-world direction",
    timing: "Life phase and timing",
    lesson: "Recurring lesson and practical move",
    boundaryTitle: "How to read this report",
    boundary: "Zi Ping BaZi remains the primary structural judgement. Other methods only add specialist supporting evidence and cannot overwrite the chart. Time-sensitive detail is reduced when the birth minute is uncertain.",
  };
  if (locale === "zh-Hans") return {
    kicker: "一份生辰 · 一份报告",
    title: "你的完整综合报告",
    lead: "不同体系只在后台交叉核对，前台合并成一份连续白话报告，不再显示流派入口或重复卡片。",
    basis: "核心底盘",
    nature: "性格与内在节奏",
    relation: "关系与互动方式",
    work: "事业、资源与现实方向",
    timing: "人生阶段与时间重点",
    lesson: "反复课题与现实行动",
    boundaryTitle: "报告边界",
    boundary: "子平八字仍是唯一结构主判；其他方法只补充各自擅长的旁证，不能反向覆盖主盘。出生分钟不确定时，时间敏感的细节会自动降级。",
  };
  return {
    kicker: "一份生辰 · 一份報告",
    title: "你的完整綜合報告",
    lead: "不同體系只在後台交叉核對，前台合併成一份連續白話報告，不再顯示流派入口或重複卡片。",
    basis: "核心底盤",
    nature: "性格與內在節奏",
    relation: "關係與互動方式",
    work: "事業、資源與現實方向",
    timing: "人生階段與時間重點",
    lesson: "反覆課題與現實行動",
    boundaryTitle: "報告邊界",
    boundary: "子平八字仍是唯一結構主判；其他方法只補充各自擅長的旁證，不能反向覆蓋主盤。出生分鐘不確定時，時間敏感的細節會自動降級。",
  };
}

export function UnifiedBirthReport({ birth, locale, foundation }: { birth: SharedBirthRecord; locale: Locale; foundation: Foundation }) {
  const copy = reportCopy(locale);
  const sections = useMemo<ReportSection[]>(() => {
    const western = buildWesternReading(birth, locale);
    const ziwei = buildZiweiReading(birth, locale);
    const qizheng = buildQizhengReading(birth, locale);
    const palm = buildPalmReading(birth, locale);
    const indian = buildIndianReading(birth, locale);
    const lifeNumber = calculateLifeNumber(birth.year, birth.month, birth.day).number;
    const numberProfile = NUMEROLOGY_PROFILES[lifeNumber];
    const timeBoundary = birth.timeUnknown
      ? (locale === "en" ? "Birth time is incomplete, so time-sensitive detail is not used as a firm conclusion." : locale === "zh-Hans" ? "出生时间不完整，时间敏感的细节不作为硬结论。" : "出生時間不完整，時間敏感的細節不作為硬結論。")
      : (locale === "en" ? "Time-sensitive detail is retained only as supporting evidence until the recorded minute is independently confirmed." : locale === "zh-Hans" ? "时间敏感的细分层在出生分钟独立确认前只保留为旁证。" : "時間敏感的細分層在出生分鐘獨立確認前只保留為旁證。");

    return [
      {
        title: copy.basis,
        body: unique([
          `${foundation.dayMaster}｜${foundation.monthOrder}`,
          foundation.strength,
          `${foundation.structure}；${foundation.features}`,
          tx(locale, numberProfile.core),
        ], locale),
      },
      {
        title: copy.nature,
        body: unique([
          sectionBody(qizheng, /命局性情|Temperament/),
          sectionBody(qizheng, /思考與表達|思考与表达|Thinking/),
          ...tableInterpretations(western, /七曜|planet/i, [0, 1, 2]),
          numberedBody(ziwei, 4),
        ], locale),
      },
      {
        title: copy.relation,
        body: unique([
          sectionBody(qizheng, /關係與選擇|关系与选择|Relationship/),
          numberedBody(ziwei, 3),
          ...tableInterpretations(western, /四軸|axis/i, [1]),
        ], locale),
      },
      {
        title: copy.work,
        body: unique([
          numberedBody(ziwei, 1),
          numberedBody(ziwei, 2),
          sectionBody(qizheng, /機會與成長|机会与成长|Opportunity|Growth/),
          ...tableInterpretations(western, /七曜|planet/i, [0, 2]),
        ], locale),
      },
      {
        title: copy.timing,
        body: unique([
          numberedBody(ziwei, 5),
          sectionBody(qizheng, /行動與壓力|行动与压力|Action|Pressure/),
          withoutMethodLabels(indian.warning || indian.lead, locale),
          timeBoundary,
        ], locale),
      },
      {
        title: copy.lesson,
        body: unique([
          sectionBody(palm, /重複出現|重复出现|Repeated/),
          sectionBody(palm, /今生怎麼用|今生怎么用|How to use/),
          tx(locale, numberProfile.challenge),
          tx(locale, numberProfile.lesson),
          tx(locale, numberProfile.action),
        ], locale),
      },
    ];
  }, [birth, copy.basis, copy.lesson, copy.nature, copy.relation, copy.timing, copy.work, foundation, locale]);

  return (
    <section className="zhaowu-unified-birth-report" data-unified-birth-report aria-labelledby="zhaowu-unified-report-title">
      <header>
        <p className="zhaowu-section-kicker">{copy.kicker}</p>
        <h3 id="zhaowu-unified-report-title">{copy.title}</h3>
        <p>{copy.lead}</p>
      </header>
      <div className="zhaowu-unified-report-flow">
        {sections.map((section) => (
          <article key={section.title}>
            <h4>{section.title}</h4>
            {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        ))}
      </div>
      <aside className="zhaowu-unified-report-boundary">
        <strong>{copy.boundaryTitle}</strong>
        <p>{copy.boundary}</p>
      </aside>
    </section>
  );
}
