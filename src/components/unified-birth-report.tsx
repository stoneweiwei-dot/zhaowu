import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { calculateLifeNumber, NUMEROLOGY_PROFILES, tx } from "@/lib/numerology";
import type { SharedBirthRecord } from "@/lib/shared-birth";
import { comicStemTeaser, SongComicReportInsert, SongComicShareCard } from "@/components/song-comic-layer";
import { specialistHeadline } from "@/lib/specialist-headline";
import "@/report-hub.css";
import type { ReportSystemId } from "@/lib/report-access";
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

const NO_PLAIN_LEAD: string[] = [];

type ReportSection = { title: string; body: string[]; teaser?: string; groups?: ReportSection[] };

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
    kicker: "ZHAOWU DESTINY BOOK · NATAL VOLUME",
    title: "Your ZHAOWU Destiny Book",
    summaryStage: "Overall summary",
    visualStage: "Illustrated destiny",
    bodyStage: "Body areas to watch",
    bodyFallback: "Birth-time detail is not complete enough for house-based body symbolism. Keep this section to daily workload, sleep and recovery; persistent symptoms need qualified medical assessment.",

    basis: "Core structure",
    nature: "Temperament and inner rhythm",
    relation: "Relationships and interaction",
    work: "Work, resources and real-world direction",
    timing: "Life phase and timing",
    lesson: "Recurring lesson and practical move",
    structureRule: "This reading does not try to make the five elements equal or use a ‘replace what is missing’ rule. It reads season, structure, functional remedy, flow and capacity first; a natural bias is not a defect by itself.",
    imageryRule: "No Heavenly Stem is inherently better or worse. Stem imagery translates function into a picture; it never overrides the full-chart judgement.",
    formalMode: "Full Destiny Book",
    comicMode: "Comic Destiny Book",
    systemsMode: "Six Systems",
    comicKicker: "YOUR STORY · SIX FRAMES",
    comicLead: "Six illustrated scenes first; text stays secondary and opens only when you want detail.",
    systemsLead: "One conclusion per system. Open any card for its full chart.",
    frame: "Frame",
    openFull: "Expand",
    closeFull: "Collapse",
    specialistTitle: "Deeper readings by system",
    specialistLead: "Optional. Each system below is folded; open only the one you want. They are supporting evidence and never override the main BaZi judgement.",
    numerology: "Life-path numerology",
    freeChart: "Open free basic chart",
    notesStage: "Notes",
    notesLead: "Full paragraphs for each theme, the basis behind them, and how to read them",
    bodyCare: "Body notes here are about daily load, sleep and recovery, not disease judgement. Persistent or worsening symptoms need a qualified medical assessment.",
    freeNote: "The basic chart is free. Interpretation after the chart is paid per reading.",
    karmaBadge: "Karma",
    basisDetail: "How this was read",
    openLabels: { ziwei: "Open my Zi Wei chart", qizheng: "Open my Seven Luminaries chart", western: "Open my Western chart", indian: "Open my karma chart", palm: "Open my past-life reading", numerology: "Open my numerology" } as Record<string, string>,


  };
  if (locale === "zh-Hans") return {
    kicker: "昭梧命书 · 本命卷",
    title: "你的昭梧命书",
    summaryStage: "总体概括",
    visualStage: "命书图解",
    bodyStage: "身体需要注意的地方",
    notesStage: "附注",
    bodyFallback: "出生时间不足时，不做依赖宫位的身体细分；这里只保留日常负荷、睡眠与恢复的观察。持续或加重的不适，以实际医疗检查为准。",

    basis: "核心底盘",
    nature: "性格与内在节奏",
    relation: "关系与互动方式",
    work: "事业、资源与现实方向",
    timing: "人生阶段与时间重点",
    lesson: "反复课题与现实行动",
    structureRule: "这份命书不把五行凑平均，也不按“缺什么补什么”处理；先看月令、格局、病药、流通与承载，偏向本身不是缺陷。",
    imageryRule: "十干没有高下。天干图像只是把功能翻成容易理解的画面，不替代整局判断。",
    formalMode: "完整命书",
    comicMode: "漫画命书",
    systemsMode: "六大系统",
    comicKicker: "你的故事 · 六格读完",
    comicLead: "先看六格漫画把主线看懂；文字解释放在后面，需要时再展开。",
    systemsLead: "每个系统先给你一句结论；点进去看完整盘。",
    frame: "第",
    openFull: "展开",
    closeFull: "收起",
    specialistTitle: "分系统深读",
    specialistLead: "可选阅读，每个系统默认收合，想看哪个再展开。皆为旁证，不覆盖子平八字主判。",
    numerology: "生命灵数",
    freeChart: "查看免费基本盘",
    notesLead: "各主题的完整段落、判读依据与阅读说明",
    bodyCare: "身体提醒以日常负荷、睡眠与恢复为主，不作疾病判断；持续或加重的不适，请以实际医疗检查为准。",
    freeNote: "基本盘免费公开；盘后解读按次付费。",
    karmaBadge: "业力",
    basisDetail: "判读依据",
    openLabels: { ziwei: "看我的紫微命盘", qizheng: "看我的七政命盘", western: "看我的西洋星盘", indian: "看我的业力分盘", palm: "看我的前世今生", numerology: "看我的灵数盘" } as Record<string, string>,


  };
  return {
    kicker: "昭梧命書 · 本命卷",
    title: "你的昭梧命書",
    summaryStage: "總體概括",
    visualStage: "命書圖解",
    bodyStage: "身體需要注意的地方",
    notesStage: "附註",
    bodyFallback: "出生時間不足時，不做依賴宮位的身體細分；這裡只保留日常負荷、睡眠與恢復的觀察。持續或加重的不適，以實際醫療檢查為準。",

    basis: "核心底盤",
    nature: "性格與內在節奏",
    relation: "關係與互動方式",
    work: "事業、資源與現實方向",
    timing: "人生階段與時間重點",
    lesson: "反覆課題與現實行動",
    structureRule: "這份命書不把五行湊平均，也不按「缺什麼補什麼」處理；先看月令、格局、病藥、流通與承載，偏向本身不是缺陷。",
    imageryRule: "十干沒有高下。天干圖像只是把功能翻成容易理解的畫面，不替代整局判斷。",
    formalMode: "完整命書",
    comicMode: "漫畫命書",
    systemsMode: "六大系統",
    comicKicker: "你的故事 · 六格讀完",
    comicLead: "先看六格漫畫把主線看懂；文字解釋放在後面，需要時再展開。",
    systemsLead: "每個系統先給你一句結論；點進去看完整盤。",
    frame: "第",
    openFull: "展開",
    closeFull: "收起",
    specialistTitle: "分系統深讀",
    specialistLead: "可選閱讀，每個系統預設收合，想看哪個再展開。皆為旁證，不覆蓋子平八字主判。",
    numerology: "生命靈數",
    freeChart: "查看免費基本盤",
    notesLead: "各主題的完整段落、判讀依據與閱讀說明",
    bodyCare: "身體提醒以日常負荷、睡眠與恢復為主，不作疾病判斷；持續或加重的不適，請以實際醫療檢查為準。",
    freeNote: "基本盤免費公開；盤後解讀按次付費。",
    karmaBadge: "業力",
    basisDetail: "判讀依據",
    openLabels: { ziwei: "看我的紫微命盤", qizheng: "看我的七政命盤", western: "看我的西洋星盤", indian: "看我的業力分盤", palm: "看我的前世今生", numerology: "看我的靈數盤" } as Record<string, string>,
  };
}

export function UnifiedBirthReport({ birth, locale, foundation, plainLead = NO_PLAIN_LEAD }: { birth: SharedBirthRecord; locale: Locale; foundation: Foundation; plainLead?: string[] }) {
  const copy = reportCopy(locale);
  const [mode, setMode] = useState<"formal" | "comic" | "systems">("formal");
  const sections = useMemo<ReportSection[]>(() => {
    const western = buildWesternReading(birth, locale);
    const ziwei = buildZiweiReading(birth, locale);
    const qizheng = buildQizhengReading(birth, locale);
    const palm = buildPalmReading(birth, locale);
    const lifeNumber = calculateLifeNumber(birth.year, birth.month, birth.day).number;
    const numberProfile = NUMEROLOGY_PROFILES[lifeNumber];

    return [
      {
        title: copy.basis,
        body: unique([
          ...plainLead,
          `${foundation.dayMaster}｜${foundation.monthOrder}`,
          foundation.strength,
          `${foundation.structure}；${foundation.features}`,
          copy.structureRule,
          copy.imageryRule,
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
        ], locale),
      },
      {
        title: copy.timing,
        body: unique([
          numberedBody(ziwei, 5),
          sectionBody(qizheng, /行動與壓力|行动与压力|Action|Pressure/),
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
  }, [birth, copy.basis, copy.lesson, copy.nature, copy.relation, copy.timing, copy.work, foundation, locale, plainLead]);

  const formalStages = useMemo<ReportSection[]>(() => {
    const [basis, nature, relation, work, timing, lesson] = sections;
    const western = buildWesternReading(birth, locale);
    const bodyLines = unique(tableInterpretations(western, /十二宮|十二宫|twelve houses/i, [5]), locale);
    const bodyCore = bodyLines.length ? bodyLines : [copy.bodyFallback];
    // Each illustrated line carries the title of the theme it comes from, so a relationship
    // paragraph is never presented under an unlabeled heading.
    const themed = [relation, work, timing, lesson]
      .filter((section): section is ReportSection => Boolean(section?.body[0]))
      .map((section) => `${section.title}：${section.body[0]}`);
    const detailGroups: ReportSection[] = [nature, relation, work, timing, lesson]
      .filter((section): section is ReportSection => Boolean(section))
      .map((section) => ({ title: section.title, body: unique(section.body.slice(section === nature ? 2 : 1), locale) }))
      .filter((group) => group.body.length > 0);
    // Reading rules and technical labels stay available, but after the substantive paragraphs.
    const basisDetail: ReportSection = { title: copy.basisDetail, body: unique(basis?.body.slice(plainLead.length + 2) ?? [], locale) };
    return [
      {
        title: copy.summaryStage,
        body: unique([
          ...(basis?.body.slice(0, plainLead.length + 2) ?? []),
          ...(nature?.body.slice(0, 2) ?? []),
        ], locale),
      },
      {
        title: copy.visualStage,
        teaser: comicStemTeaser(foundation.dayMaster, locale),
        body: unique(themed, locale),
      },
      {
        title: copy.bodyStage,
        body: bodyLines.length ? [...bodyCore, copy.bodyCare] : bodyCore,
      },
      {
        title: copy.notesStage,
        teaser: copy.notesLead,
        body: unique([...detailGroups.flatMap((group) => group.body), ...basisDetail.body], locale),
        groups: [...detailGroups, basisDetail].filter((group) => group.body.length > 0),
      },
    ];
  }, [birth, copy.basisDetail, copy.bodyCare, copy.bodyFallback, copy.bodyStage, copy.notesLead, copy.notesStage, copy.summaryStage, copy.visualStage, foundation.dayMaster, locale, plainLead, sections]);

  return (
    <section className="zhaowu-unified-birth-report" data-unified-birth-report aria-labelledby="zhaowu-unified-report-title">
      <header>
        <p className="zhaowu-section-kicker">{copy.kicker}</p>
        <h3 id="zhaowu-unified-report-title">{copy.title}</h3>
        <div className="zhaowu-report-mode-switch" role="group" aria-label={copy.title}>
          <button type="button" aria-pressed={mode === "formal"} onClick={() => setMode("formal")}>{copy.formalMode}</button>
          <button type="button" aria-pressed={mode === "comic"} onClick={() => setMode("comic")}>{copy.comicMode}</button>
          <button type="button" aria-pressed={mode === "systems"} onClick={() => setMode("systems")}>{copy.systemsMode}</button>
        </div>
      </header>
      {mode === "formal" ? (
        <>
          <nav className="zhaowu-report-reading-path" aria-label={locale === "en" ? "Reading order" : locale === "zh-Hans" ? "阅读顺序" : "閱讀順序"}>
            {formalStages.map((section, index) => <span key={section.title}><b>{String(index + 1).padStart(2, "0")}</b>{section.title}</span>)}
          </nav>
          <div className="zhaowu-unified-report-flow" data-report-mode="formal">
            {formalStages.map((section, index) => (
              <article key={section.title} data-formal-stage={index + 1}>
                {index === 0 ? (
                  <div className="zhaowu-unified-summary-stage">
                    <span className="zhaowu-unified-fold__step">01</span>
                    <h4>{section.title}</h4>
                    <div className="zhaowu-unified-fold__body">
                      {/* Only the single direct-conclusion line stays open by
                          default (matching the SUMMARY_VISIBLE_LINES=1 convention
                          used on the continuous report page) — users were not
                          reading the second always-visible paragraph, so it now
                          folds with the rest instead of showing automatically. */}
                      {section.body.slice(0, 1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </div>
                    {section.body.length > 1 ? (
                      <details className="zhaowu-unified-fold zhaowu-unified-fold--more" data-report-fold>
                        <summary>{copy.openFull}</summary>
                        <div className="zhaowu-unified-fold__body">
                          {section.body.slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                        </div>
                      </details>
                    ) : null}
                  </div>
                ) : (
                  <details className="zhaowu-unified-fold" data-report-fold>
                    <summary>
                      <span className="zhaowu-unified-fold__step">{String(index + 1).padStart(2, "0")}</span>
                      <h4>{section.title}</h4>
                      {section.teaser || section.body[0] ? <span className="zhaowu-unified-fold__teaser">{section.teaser ?? section.body[0]}</span> : null}
                    </summary>
                    <div className="zhaowu-unified-fold__body">
                      {index === 1 ? <SongComicReportInsert dayMaster={foundation.dayMaster} locale={locale} /> : null}
                      {section.groups?.length
                        ? section.groups.map((group) => (
                          <div className="zhaowu-unified-fold__group" key={group.title}>
                            <h5>{group.title}</h5>
                            {group.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                          </div>
                        ))
                        : section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </div>
                  </details>
                )}
              </article>
            ))}
          </div>
        </>
      ) : mode === "comic" ? (
        <ComicLiteReport sections={sections} dayMaster={foundation.dayMaster} locale={locale} copy={copy} />
      ) : (
        <SpecialistHub birth={birth} locale={locale} copy={copy} />
      )}
      <SongComicShareCard dayMaster={foundation.dayMaster} locale={locale} />
    </section>
  );
}

type SpecialistEntry = { id: ReportSystemId; route: string; title: string; headline: string; lead?: string; warning?: string; sections: { title: string; lines: string[] }[] };

const SPECIALIST_ROUTES: Record<ReportSystemId, string> = {
  ziwei: "/ziwei",
  qizheng: "/qizheng",
  western: "/astrology",
  indian: "/indian-astrology",
  palm: "/yizhangjing",
  numerology: "/numerology",
};

function fromReading(id: ReportSystemId, reading: SpecialistReading, locale: Locale): SpecialistEntry {
  return {
    id,
    route: SPECIALIST_ROUTES[id],
    title: reading.title,
    headline: specialistHeadline(id, reading, locale),
    lead: reading.lead,
    warning: reading.warning,
    sections: reading.sections.map((section) => ({
      title: section.title,
      lines: [section.body, ...(section.table?.rows.map((row) => row.join(" · ")) ?? [])].filter(Boolean),
    })),
  };
}

// Six specialist systems are a first-class report mode rather than a buried disclosure.
function SpecialistHub({ birth, locale, copy }: { birth: SharedBirthRecord; locale: Locale; copy: ReturnType<typeof reportCopy> }) {
  const entries = useMemo<SpecialistEntry[]>(() => {
    const profile = NUMEROLOGY_PROFILES[calculateLifeNumber(birth.year, birth.month, birth.day).number];
    return [
      fromReading("ziwei", buildZiweiReading(birth, locale), locale),
      fromReading("qizheng", buildQizhengReading(birth, locale), locale),
      fromReading("western", buildWesternReading(birth, locale), locale),
      fromReading("indian", buildIndianReading(birth, locale), locale),
      fromReading("palm", buildPalmReading(birth, locale), locale),
      {
        id: "numerology",
        route: SPECIALIST_ROUTES.numerology,
        title: copy.numerology,
        headline: specialistHeadline("numerology", { title: copy.numerology, lead: "", sections: [{ title: copy.numerology, body: tx(locale, profile.core) }] }, locale),
        sections: [{ title: copy.numerology, lines: [tx(locale, profile.core), tx(locale, profile.challenge), tx(locale, profile.lesson), tx(locale, profile.action)].filter(Boolean) }],
      },
    ];
  }, [birth, copy.numerology, locale]);

  const labels: Partial<Record<ReportSystemId, string>> = {
    indian: copy.karmaBadge,
    palm: locale === "en" ? "One-Palm" : locale === "zh-Hans" ? "一掌经" : "一掌經",
  };

  return (
    <section className="zhaowu-specialist-hub" data-specialist-hub>
      <header>
        <p>{copy.systemsMode}</p>
        <h4>{copy.specialistTitle}</h4>
        <span>{copy.systemsLead}</span>
      </header>
      <div className="zhaowu-specialist-hub__grid">
        {entries.map((entry, index) => {
          const preview = entry.headline || entry.lead || entry.sections[0]?.lines[0] || "";
          return (
            <article key={entry.id} className="zhaowu-specialist-hub__card" data-specialist-node={entry.id}>
              <div className="zhaowu-specialist-hub__meta">
                <b>{String(index + 1).padStart(2, "0")}</b>
                {labels[entry.id] ? <em>{labels[entry.id]}</em> : null}
              </div>
              <h5>{entry.title}</h5>
              {preview ? <p>{preview}</p> : null}
              <a className="zhaowu-specialist-free-link" href={entry.route}>{copy.openLabels[entry.id] ?? copy.freeChart} →</a>
            </article>
          );
        })}
      </div>
      <p className="zhaowu-specialist-hub__note">{copy.freeNote}</p>
    </section>
  );
}

function ComicLiteReport({
  sections,
  dayMaster,
  locale,
  copy,
}: {
  sections: ReportSection[];
  dayMaster: string;
  locale: Locale;
  copy: ReturnType<typeof reportCopy>;
}) {
  const stem = dayMaster?.trim()?.[0] || "壬";

  return (
    <section className="zhaowu-comic-lite" data-report-mode="comic-lite" aria-label={copy.comicMode}>
      <header className="zhaowu-comic-lite__lead">
        <p>{copy.comicKicker}</p>
        <h4>{stem} · {copy.comicMode}</h4>
        <span>{copy.comicLead}</span>
        <i className="zhaowu-comic-lite__seal" aria-hidden="true">{stem}</i>
      </header>

      <div className="zhaowu-comic-lite__grid">
        {sections.map((section, index) => (
          <article
            key={section.title}
            className="zhaowu-comic-lite__frame"
            data-comic-scene={index + 1}
            aria-label={locale === "en" ? `${copy.frame} ${index + 1}: ${section.title}` : `${copy.frame}${index + 1}格：${section.title}`}
          >
            <div className="zhaowu-comic-lite__art" aria-hidden="true">
              <span className="zhaowu-comic-lite__scene-no">{String(index + 1).padStart(2, "0")}</span>
              <img src={`/comic/story-v2/scene-${index + 1}.webp`} alt="" loading="lazy" decoding="async" width="940" height="279" />
            </div>
            <div className="zhaowu-comic-lite__copy">
              <h5>{section.title}</h5>
              <p className="zhaowu-comic-lite__caption">{section.body[0]}</p>
              {section.body.length > 1 ? (
                <details>
                  <summary><span className="when-closed">{copy.openFull}</span><span className="when-open">{copy.closeFull}</span></summary>
                  <div className="zhaowu-comic-lite__more">
                    {section.body.slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </details>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
