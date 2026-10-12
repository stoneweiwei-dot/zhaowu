import { ChartTable, SpecialistChart } from "@/components/specialist-chart";
import { ReportAccessGate } from "@/components/report-access-gate";
import { PersonalPaidProfile } from "@/components/personal-paid-profile";
import { useEffect, useMemo, useState } from "react";
import { D60ReliabilityGate } from "@/components/d60-reliability-gate";
import { specialistHeadline, type HeadlineSystem } from "@/lib/specialist-headline";
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
    "zh-Hant": { title: "西洋星座", hint: "從完整本命盤、七曜落宮、十二宮、四軸與主要相位看另一種性格與生活視角。" },
    "zh-Hans": { title: "西洋星座", hint: "从完整本命盘、七曜落宫、十二宫、四轴与主要相位看另一种性格与生活视角。" },
    en: { title: "Western astrology", hint: "A separate view through the full natal chart, seven classical planets, twelve houses, four angles and major aspects." },
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
    basicFree: "基本盤免費公開；盤後解讀按次付費。",
  },
  "zh-Hans": {
    ready: "本卷使用的生辰",
    auto: "分析已依同一份生辰自动完成",
    missing: "尚未找到生辰资料。回首页填写一次，六份命理专卷即可共用。",
    edit: "回首页修改生辰",
    add: "回首页填写生辰",
    back: "返回六种专卷",
    overview: "本卷总览",
    basicFree: "基本盘免费公开；盘后解读按次付费。",
  },
  en: {
    ready: "Birth record for this volume",
    auto: "This reading was generated from the same saved birth record",
    missing: "No birth record yet. Add it once on the homepage and all six specialist readings can reuse it.",
    edit: "Edit birth record",
    add: "Add birth record",
    back: "Back to six readings",
    overview: "Reading overview",
    basicFree: "The basic chart is free. Interpretation after the chart is paid per reading.",
  },
} as const;


const PARASHARI_PUBLIC_GUIDE = {
  "zh-Hant": {
    title: "Parashari Jyotish｜印度占星怎麼判讀",
    lead: "印度占星的主盤是 D-1（Rashi），以恆星黃道、上升與九曜位置為起點，再對照宮主、星曜相位、格局及時間週期。它是昭梧的獨立輔助專項，不取代子平八字主判。",
    status: "目前計算狀態：完整 D-1、D-12、Shadbala、SAV、IshtaPhala／KashtaPhala 與 Vimshottari Dasha 尚未接入經驗證的運算快照，不能生成個人數值與事件預測。",
    d60: "現有 D60 僅是獨立的細分旁證，須先確認出生分鐘，且通過 ±2 分鐘邊界檢查；它不能替代 D-1 主盤或完整運程。",
    noBirth: "尚未保存生辰。以下是通用方法介紹，不是個人的命盤結果。",
    unknown: "出生時間未確認：不判上升、十二宮與高敏感分盤；月宿和運期也必須確認是否跨界。",
    recorded: "已填出生時間，但「填到分鐘」不等於有可靠記錄。高敏感分盤仍須確認時間來源並逐項做邊界檢查。",
    orderTitle: "傳統判讀順序與資料要求",
    order: "先核對出生地、歷史時區及 Lahiri／Raman／KP 歲差設定；再由星曆計算 D-1、上升、九曜與月宿；之後依問題調用 D-12、Dasha、行運、Shadbala 與 SAV。沒有算出的資料必須標明「未計算」，不能由 AI 猜出。",
    housesTitle: "第十二宮主落入不同宮位｜十二個研究主題",
    housesLead: "這些只是第十二宮主的傳統主題索引，並非單條斷事；仍需檢查主星力量、吉凶性、合照、格局與運期。",
    familyTitle: "原生家庭專題與限制",
    family: "完整家庭報告應先看 D-1 的第 2、4、9 宮及太陽、月亮，再以 D-12 與經計算的運期驗證。不可從星盤直接宣稱父母做過甚麼、母親孕期狀態、疾病或祖輩詛咒。缺 Shadbala、SAV 或 Dasha，就明示缺少，不生成虛構數據。",
    source: "方法版本：ZW-JYOTISH-PARASHARI-1.1。以上屬傳統文化／象徵解讀，不是科學驗證的醫療或人生事件預測。",
    houses: ["獨處與自我定位","金錢、家族資源與支出","努力、手足及幕後溝通","家庭、遷移及安全感","創造、子女與研究投入","勞務、債務與競爭","伴侶、合作及私人界線","共享資源、變動與深度探索","遠行、信念與父輩關係","事業、海外與服務角色","收益、人脈及共同志向","休息、隱退、慈善與解脫"],
  },
  "zh-Hans": {
    title: "Parashari Jyotish｜印度占星如何分析",
    lead: "印度占星的主盘是 D-1（Rashi），以恒星黄道、上升与九曜位置为起点，再对照宫主、行星照射、格局和时间周期。它是昭梧的独立辅助专项，不取代子平八字主判。",
    status: "目前计算状态：完整 D-1、D-12、Shadbala、SAV、IshtaPhala／KashtaPhala 与 Vimshottari Dasha 尚未接入经过验证的计算快照，不会生成个人数值和事件预测。",
    d60: "现有 D60 只是独立的细分旁证，需要先确认出生分钟，并通过 ±2 分钟边界检查；它不能代替 D-1 主盘或完整运程。",
    noBirth: "尚未保存生辰。以下只是通用方法介绍，不是你的个人星盘。",
    unknown: "出生时间不明确：不判定上升、十二宫及高敏感分盘；月宿和运期也需要确认有没有跨界。",
    recorded: "已填写出生时间，但填写到分钟不代表记录一定准确。高敏感分盘仍需核实时间来源并分别检查边界。",
    orderTitle: "传统分析顺序与数据要求",
    order: "先核对出生地、历史时区与 Lahiri／Raman／KP 岁差设置；再以星历计算 D-1、上升、九曜和月宿；之后按问题调用 D-12、Dasha、行运、Shadbala 和 SAV。没有算出的数据必须标记“未计算”，不能由 AI 猜测。",
    housesTitle: "第十二宫主落入不同宫位｜十二项研究主题",
    housesLead: "这里只是第十二宫主的传统主题索引，不是单项断语；还要看主星力量、吉凶属性、照射、格局与运期。",
    familyTitle: "原生家庭专题与限制",
    family: "完整家庭报告应先看 D-1 的第 2、4、9 宫，以及太阳、月亮，再用 D-12 和经过计算的运期验证。不能从星盘直接断定父母行为、母亲孕期状态、疾病或祖辈诅咒。没有 Shadbala、SAV 或 Dasha 就明确说明，不生成虚构数据。",
    source: "方法版本：ZW-JYOTISH-PARASHARI-1.1。内容属于传统文化与象征分析，并非经科学验证的医疗或人生事件预测。",
    houses: ["独处与自我定位","金钱、家族资源与支出","努力、手足与幕后沟通","家庭、迁移与安全感","创作、子女与研究投入","劳务、债务与竞争","伴侣、合作与个人界限","共同资源、变化与深入探索","远行、信念与父辈关系","事业、海外与服务角色","收益、人脉与共同志向","休息、隐退、慈善与解脱"],
  },
  en: {
    title: "How Parashari Jyotish works",
    lead: "The foundation is the birth chart (D-1 or Rashi), using sidereal planetary positions, the rising sign and the nine traditional planets. House rulers, aspects, combinations and timing cycles provide context. This is a separate supporting tradition within Zhaowu; BaZi remains the main system.",
    status: "Calculation status: a verified full D-1, D-12, Shadbala, SAV, Ishta/Kashta and Vimshottari Dasha calculation is not yet available. We do not invent personalised figures or event predictions.",
    d60: "The existing D60 feature is a separate, very time-sensitive supporting check. It requires confirmation of a recorded birth minute and a ±2-minute boundary check. It is not a substitute for a complete birth chart or timing analysis.",
    noBirth: "No birth record is saved. This is general guidance, not your personal chart.",
    unknown: "Birth time unknown: the rising sign, houses and sensitive divisional charts cannot be confirmed; Moon mansion and timing boundaries also need checking.",
    recorded: "A time entered to the minute is not necessarily a verified time. Sensitive divisions still require a reliable source and boundary checks.",
    orderTitle: "Reading order and required calculations",
    order: "First verify birthplace, historical time zone and the selected Lahiri, Raman or KP sidereal offset. Calculate the D-1 chart, rising sign, planets and Moon mansion from an ephemeris. Only then use the relevant D-12, Dasha, transits and strength measures. Missing results must say 'not calculated', never be guessed by AI.",
    housesTitle: "Where the 12th-house ruler falls: twelve study themes",
    housesLead: "These are traditional areas of inquiry, not automatic outcomes. The ruler's condition, aspects, combinations and timing all matter.",
    familyTitle: "Family background and safeguards",
    family: "A detailed family reading should begin with houses 2, 4 and 9, the Sun and Moon in D-1, and then examine a calculated D-12 and timing periods. A chart cannot establish what a parent did, a mother's pregnancy experience, illness or an ancestral curse. When Shadbala, SAV or Dasha is unavailable, the reading must say so.",
    source: "Method: ZW-JYOTISH-PARASHARI-1.1. This is traditional symbolic interpretation, not scientifically established medical advice or an event forecast.",
    houses: ["Self and solitude","Resources and family spending","Effort, siblings and quiet communication","Home, moves and inner security","Creativity, children and study","Work, debt and competition","Partnerships and boundaries","Shared resources and change","Travel, beliefs and father figures","Career, overseas work and service","Income, networks and ambitions","Rest, retreat and charitable giving"],
  },
} as const;

function IndianParashariGuide({ locale, birth }: { locale: "zh-Hant" | "zh-Hans" | "en"; birth: SharedBirthRecord | null }) {
  const c = PARASHARI_PUBLIC_GUIDE[locale];
  return (
    <section className="zhaowu-specialist-sections" aria-label={c.title} data-parashari-policy="ZW-JYOTISH-PARASHARI-1.1" data-parashari-d1-status="NOT_COMPUTED">
      <article className="zhaowu-specialist-overview">
        <h2>{c.title}</h2>
        <p>{c.lead}</p>
        <p className="zhaowu-specialist-warning" role="status">{c.status}</p>
        <p>{birth ? (birth.timeUnknown ? c.unknown : c.recorded) : c.noBirth}</p>
        <p>{c.d60}</p>
      </article>
      <details className="zhaowu-chart-details">
        <summary>{c.orderTitle}</summary>
        <p className="mt-3 text-base leading-7 text-ink">{c.order}</p>
      </details>
      <details className="zhaowu-chart-details">
        <summary>{c.housesTitle}</summary>
        <p className="mt-3 text-base leading-7 text-ink">{c.housesLead}</p>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-base leading-7 text-ink">
          {c.houses.map((theme, index) => <li key={index}>{locale === "en" ? `House ${index + 1}: ${theme}` : locale === "zh-Hans" ? `第${index + 1}宫：${theme}` : `第${index + 1}宮：${theme}`}</li>)}
        </ol>
      </details>
      <details className="zhaowu-chart-details">
        <summary>{c.familyTitle}</summary>
        <p className="mt-3 text-base leading-7 text-ink">{c.family}</p>
      </details>
      <p className="zhaowu-specialist-free-note">{c.source}</p>
    </section>
  );
}

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
  const headlineSystem: HeadlineSystem = id === "past" || id === "dharma" ? "palm" : id;
  const headline = useMemo(() => specialistHeadline(headlineSystem, reading, locale), [headlineSystem, reading, locale]);
  // D60 only runs for a documented minute-level birth time and place.
  const d60Birth = birth && !birth.timeUnknown && birth.city
    ? { year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, minute: birth.minute, city: birth.city }
    : null;

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

        {id === "indian" ? <IndianParashariGuide locale={locale} birth={birth} /> : null}

        {reading?.warning ? <p className="zhaowu-specialist-warning">{reading.warning}</p> : null}

        <div className="zhaowu-specialist-actions">
          <a href="/#bazi" className="is-secondary">{birth ? copy.edit : copy.add}</a>
          <a href="/#analysis-reports" className="is-secondary">{copy.back}</a>
        </div>

        {reading?.chart ? <SpecialistChart chart={reading.chart} locale={locale} /> : null}
        {reading?.chart ? <p className="zhaowu-specialist-free-note">{copy.basicFree}</p> : null}

        {reading ? (
          <ReportAccessGate
            system={id === "past" || id === "dharma" ? "palm" : id}
            locale={locale}
            birth={birth}
            preview={headline}
            quick={<div className="zhaowu-specialist-sections">
              {reading.lead ? <article className="zhaowu-specialist-overview"><h2>{copy.overview}</h2><p>{reading.lead}</p></article> : null}
              {reading.sections.slice(0, 2).map((section) => <ReadingSection key={`${section.title}-quick`} section={section} />)}
              {id === "indian" ? <div className="mt-6"><D60ReliabilityGate depth="quick" reportBirth={d60Birth} /></div> : null}
            </div>}
            personal={birth ? <PersonalPaidProfile birth={birth} locale={locale} /> : undefined}
            full={<div className="zhaowu-specialist-sections">
              {reading.lead ? <article className="zhaowu-specialist-overview"><h2>{copy.overview}</h2><p>{reading.lead}</p></article> : null}
              {reading.sections.map((section) => <ReadingSection key={`${section.title}-${section.body.slice(0, 24)}`} section={section} />)}
              {id === "indian" ? <div className="mt-6"><D60ReliabilityGate reportBirth={birth && !birth.timeUnknown && birth.city ? { year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, minute: birth.minute, city: birth.city } : null} /></div> : null}
            </div>}
          />
        ) : null}
      </section>
    </main>
  );
}

function ReadingSection({ section }: { section: SpecialistReading["sections"][number] }) {
  return (
    <article data-summary-table={section.table ? "true" : undefined} data-summary-description={section.layout === "description" ? "true" : undefined}>
      {section.table ? <ChartTable title={section.title} headers={section.table.headers} rows={section.table.rows} /> : <><h2>{section.title}</h2><p>{section.body}</p></>}
    </article>
  );
}
