import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { buildPalm } from "@/lib/palm/engine";
import { calculateQizheng, localBirthToUtc } from "@/lib/qizheng/engine";
import { buildQizhengPlainSummary } from "@/lib/qizheng/plain-summary";
import {
  calculateMajorAspects,
  computeAngles,
  decoratePosition,
  julianDay,
  normalizeAngle,
} from "@/lib/western-astrology/engine";
import { normalizeZiweiCalendarBirth } from "@/lib/ziwei/calendar-normalization";
import { buildZiweiCoreChart } from "@/lib/ziwei/core";
import {
  formatSharedBirthRecord,
  readSharedBirthRecord,
  sharedBirthFromUnknown,
  writeSharedBirthRecord,
  type SharedBirthRecord,
} from "@/lib/shared-birth";

type Copy = {
  title: string;
  hint: string;
};

export type SharedMethodId = "western" | "vedic" | "ziwei" | "qizheng" | "past" | "palm";

type ResultSection = { title: string; body: string };

type GeneratedMethodResult = {
  lead: string;
  sections: ResultSection[];
  note?: string;
};

function qizhengChart(birth: SharedBirthRecord) {
  return calculateQizheng({
    year: birth.year,
    month: birth.month,
    day: birth.day,
    hour: birth.hour,
    minute: birth.minute,
    timezone: birth.city.timezone,
    timeUnknown: birth.timeUnknown,
  });
}

function gmstDegrees(date: Date) {
  const jd = julianDay(date);
  const t = (jd - 2_451_545) / 36_525;
  return normalizeAngle(
    280.46061837 + 360.98564736629 * (jd - 2_451_545) + 0.000387933 * t * t - (t * t * t) / 38_710_000,
  );
}

function degreeLabel(value: number) {
  return `${Math.floor(value)}°${String(Math.round((value % 1) * 60)).padStart(2, "0")}′`;
}

function westernResult(birth: SharedBirthRecord, locale: "zh-Hant" | "zh-Hans" | "en"): GeneratedMethodResult {
  const qz = qizhengChart(birth);
  if (!qz) {
    return {
      lead: locale === "en" ? "Your saved birth date is loaded, but an unknown birth time blocks the Rising sign and house calculation." : locale === "zh-Hans" ? "已自动读取出生日期；因为时辰未知，上升与宫位必须留白。" : "已自動讀取出生日期；因為時辰未知，上升與宮位必須留白。",
      sections: [],
      note: locale === "en" ? "Add an exact birth time to calculate the full Western chart." : locale === "zh-Hans" ? "补上准确出生时间后，本页会直接生成完整西洋星盘。" : "補上準確出生時間後，本頁會直接生成完整西洋星盤。",
    };
  }
  const body = (key: string) => qz.bodies.find((item) => item.key === key)!;
  const utc = localBirthToUtc({ year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, minute: birth.minute, timezone: birth.city.timezone });
  const sun = decoratePosition("Sun", body("sun").longitude);
  const moon = decoratePosition("Moon", body("moon").longitude);
  const angles = computeAngles({ date: utc, gmstDegrees: gmstDegrees(utc), latitude: birth.city.latitude, longitude: birth.city.longitude });
  const rising = decoratePosition("Ascendant", angles.ascendant);
  const planets = [
    decoratePosition("Sun", body("sun").longitude),
    decoratePosition("Moon", body("moon").longitude),
    decoratePosition("Mercury", body("mercury").longitude, body("mercury").retrograde),
    decoratePosition("Venus", body("venus").longitude, body("venus").retrograde),
    decoratePosition("Mars", body("mars").longitude, body("mars").retrograde),
    decoratePosition("Jupiter", body("jupiter").longitude, body("jupiter").retrograde),
    decoratePosition("Saturn", body("saturn").longitude, body("saturn").retrograde),
  ];
  const aspects = calculateMajorAspects(planets).slice(0, 4).map((item) => `${item.a} ${item.type} ${item.b} (${item.orb.toFixed(1)}°)`).join(" · ");
  return {
    lead: locale === "en" ? "Your saved birth record has been used automatically to calculate the core Western chart." : locale === "zh-Hans" ? "已直接沿用同一份生辰，自动生成西洋星盘核心位置。" : "已直接沿用同一份生辰，自動生成西洋星盤核心位置。",
    sections: [
      { title: locale === "en" ? "Sun" : "太陽", body: `${sun.sign} ${degreeLabel(sun.degreeInSign)}` },
      { title: locale === "en" ? "Moon" : "月亮", body: `${moon.sign} ${degreeLabel(moon.degreeInSign)}` },
      { title: locale === "en" ? "Rising" : "上升", body: `${rising.sign} ${degreeLabel(rising.degreeInSign)}` },
      { title: locale === "en" ? "Closest major aspects" : locale === "zh-Hans" ? "主要相位" : "主要相位", body: aspects || (locale === "en" ? "No tight major aspect in the displayed set." : "目前顯示範圍內沒有緊密主要相位。") },
    ],
  };
}

function qizhengResult(birth: SharedBirthRecord, locale: "zh-Hant" | "zh-Hans" | "en"): GeneratedMethodResult {
  const chart = qizhengChart(birth);
  if (!chart) {
    return {
      lead: locale === "en" ? "The shared birth record is loaded, but this calculation needs a known birth time." : locale === "zh-Hans" ? "已读取共享生辰；七政排盘需要明确出生时辰，因此时辰未知时不硬补。" : "已讀取共享生辰；七政排盤需要明確出生時辰，因此時辰未知時不硬補。",
      sections: [],
    };
  }
  const summary = buildQizhengPlainSummary(chart, locale);
  return { lead: summary.lead, sections: summary.sections.map((item) => ({ title: item.title, body: item.body })), note: summary.closing };
}

function palmResult(birth: SharedBirthRecord, locale: "zh-Hant" | "zh-Hans" | "en", integrated: boolean): GeneratedMethodResult {
  const palm = buildPalm({ year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, timeUnknown: birth.timeUnknown, gender: birth.gender });
  const hans = locale === "zh-Hans";
  const en = locale === "en";
  const sections: ResultSection[] = palm.palaces.map((item) => ({
    title: `${item.lifeLabel} · ${item.zhi}${item.star}`,
    body: `${item.dao} · ${item.meaning}`,
  }));
  if (palm.cause) sections.push({ title: en ? "Carried cause" : hans ? "前因" : "前因", body: palm.cause });
  if (palm.fruit) sections.push({ title: en ? "Present expression" : hans ? "今果" : "今果", body: palm.fruit });
  if (palm.seed) sections.push({ title: en ? "What to cultivate" : hans ? "后种" : "後種", body: palm.seed });
  if (integrated) {
    const qz = qizhengChart(birth);
    if (qz) {
      const summary = buildQizhengPlainSummary(qz, locale);
      sections.push({ title: en ? "Seven-Luminaries cross-check" : hans ? "七政旁证" : "七政旁證", body: summary.sections[0]?.body ?? summary.lead });
    }
  }
  return {
    lead: palm.firstSentence || (en ? "The shared birth record has been loaded automatically." : hans ? "已自动读取同一份生辰。" : "已自動讀取同一份生辰。"),
    sections,
    note: palm.boundary,
  };
}

function ziweiResult(birth: SharedBirthRecord, locale: "zh-Hant" | "zh-Hans" | "en"): GeneratedMethodResult {
  const normalized = normalizeZiweiCalendarBirth({
    civilDate: { year: birth.year, month: birth.month, day: birth.day, hour: birth.timeUnknown ? undefined : birth.hour, minute: birth.timeUnknown ? undefined : birth.minute },
    timeConfidence: birth.timeUnknown ? "unknown" : "certain",
    profile: { id: "zhaowu_default_current_day", lateZiPolicy: "current_day", leapMonthPolicy: "split_after_15", yearBoundary: "lunar_new_year" },
  });
  const en = locale === "en";
  const hans = locale === "zh-Hans";
  if (!normalized.coreInput) {
    return {
      lead: en ? "The shared birth date is loaded. Birth time is still required for the body palace and time-driven stars." : hans ? "已读取同一份出生资料；时辰未知时，身宫与时系星曜必须留白。" : "已讀取同一份出生資料；時辰未知時，身宮與時系星曜必須留白。",
      sections: [{ title: en ? "Calendar normalization" : hans ? "历法资料" : "曆法資料", body: `${normalized.effectiveYearGanzhi ?? "—"} · ${normalized.effectiveLunarDate.month}/${normalized.effectiveLunarDate.day}` }],
    };
  }
  const chart = buildZiweiCoreChart(normalized.coreInput, { mutagenProfile: "south_iztro_v1" });
  const lifeStars = Object.entries(chart.majorStars).filter(([, palace]) => palace === chart.soulPalace).map(([star]) => star).join("、") || "—";
  return {
    lead: en ? "The saved birth record has been normalized and used to generate the Zi Wei core chart." : hans ? "已沿用同一份生辰并完成历法标准化，直接生成紫微本命骨架。" : "已沿用同一份生辰並完成曆法標準化，直接生成紫微本命骨架。",
    sections: [
      { title: en ? "Life / Body palace" : hans ? "命宫 / 身宫" : "命宮 / 身宮", body: `${chart.soulPalace} / ${chart.bodyPalace}` },
      { title: en ? "Five-element bureau" : hans ? "五行局" : "五行局", body: chart.fiveElementsBureau.name },
      { title: en ? "Major stars in Life palace" : hans ? "命宫主星" : "命宮主星", body: lifeStars },
      { title: en ? "Natal transformations" : hans ? "生年四化" : "生年四化", body: `祿 ${chart.mutagens.祿} · 權 ${chart.mutagens.權} · 科 ${chart.mutagens.科} · 忌 ${chart.mutagens.忌}` },
    ],
    note: en ? "This is the verified deterministic core only; unsupported school-specific layers are not invented." : hans ? "这里只显示已验证的确定性核心；未验证的流派层不硬补。" : "這裡只顯示已驗證的確定性核心；未驗證的流派層不硬補。",
  };
}

function vedicResult(birth: SharedBirthRecord, locale: "zh-Hant" | "zh-Hans" | "en"): GeneratedMethodResult {
  const en = locale === "en";
  const hans = locale === "zh-Hans";
  const exact = !birth.timeUnknown;
  return {
    lead: en ? "The shared birth record is loaded automatically. D60 is extremely sensitive to the recorded birth minute." : hans ? "已自动读取同一份生辰。D60 对出生分钟高度敏感，本页先做资料精度检查，不用未经验证的算法硬排。" : "已自動讀取同一份生辰。D60 對出生分鐘高度敏感，本頁先做資料精度檢查，不用未經驗證的算法硬排。",
    sections: [
      { title: en ? "Birth-time precision" : hans ? "出生时间精度" : "出生時間精度", body: exact ? (en ? `${String(birth.hour).padStart(2, "0")}:${String(birth.minute).padStart(2, "0")} is available.` : `${String(birth.hour).padStart(2, "0")}:${String(birth.minute).padStart(2, "0")} 已有記錄。`) : (en ? "Birth time is unknown; D60 must not be calculated." : hans ? "时辰未知；D60 不计算。" : "時辰未知；D60 不計算。") },
      { title: en ? "Birth place" : hans ? "出生地" : "出生地", body: birth.city.display },
      { title: "D60", body: en ? "The D60 engine is not yet independently verified in production, so Zhaowu will not present a fabricated karmic result." : hans ? "D60 引擎目前尚未完成独立验证，因此昭梧不会把推测伪装成正式业力结论。" : "D60 引擎目前尚未完成獨立驗證，因此昭梧不會把推測偽裝成正式業力結論。" },
    ],
  };
}

function generateMethodResult(method: SharedMethodId, birth: SharedBirthRecord, locale: "zh-Hant" | "zh-Hans" | "en") {
  if (method === "western") return westernResult(birth, locale);
  if (method === "qizheng") return qizhengResult(birth, locale);
  if (method === "ziwei") return ziweiResult(birth, locale);
  if (method === "palm") return palmResult(birth, locale, false);
  if (method === "past") return palmResult(birth, locale, true);
  return vedicResult(birth, locale);
}

export function MethodExplainPage({
  copies,
  method,
}: {
  copies: { "zh-Hant": Copy; "zh-Hans": Copy; en: Copy };
  method: SharedMethodId;
}) {
  const { locale } = useI18n();
  const { user } = useCurrentUserState();
  const copy = copies[locale];
  const [birth, setBirth] = useState<SharedBirthRecord | null>(null);

  useEffect(() => {
    const server = sharedBirthFromUnknown(user?.birthData);
    const next = server ?? readSharedBirthRecord();
    setBirth(next);
    if (server) writeSharedBirthRecord(server);
  }, [user?.id, user?.birthData]);

  const result = useMemo(() => birth ? generateMethodResult(method, birth, locale) : null, [birth, locale, method]);

  const cta = locale === "en"
    ? { lead: "Birth details are kept as one shared Zhaowu record. This page calculates from that record automatically.", ready: "Shared birth record loaded", missing: "No shared birth record yet. Add it once in the Zi Ping BaZi section on the homepage.", action: "Edit birth record", add: "Add birth record once" }
    : locale === "zh-Hans"
      ? { lead: "出生资料只保存一份。本页会直接读取并自动生成对应内容，不再重复填写。", ready: "已读取共享出生资料", missing: "目前还没有共享出生资料。请先在首页四柱八字分区填写一次。", action: "修改出生资料", add: "去填写一次出生资料" }
      : { lead: "出生資料只保存一份。本頁會直接讀取並自動生成對應內容，不再重複填寫。", ready: "已讀取共享出生資料", missing: "目前還沒有共享出生資料。請先在首頁四柱八字分區填寫一次。", action: "修改出生資料", add: "去填寫一次出生資料" };

  return (
    <main className="zhaowu-method-explain mx-auto max-w-2xl px-1 py-6">
      <section className="zhaowu-method-sheet rounded-2xl border border-line bg-cream/95 p-5 sm:p-7">
        <h1 className="font-display text-2xl sm:text-3xl">{copy.title}</h1>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.hint}</p>
        <p className="mt-4 text-sm leading-7 text-ink-mute">{cta.lead}</p>
        {birth ? (
          <div className="zhaowu-method-birth-ready">
            <span>{cta.ready}</span>
            <strong>{formatSharedBirthRecord(birth, locale)}</strong>
          </div>
        ) : <p className="zhaowu-method-birth-missing">{cta.missing}</p>}

        {result ? (
          <section className="zhaowu-method-generated" aria-live="polite">
            <p className="zhaowu-method-generated-lead">{result.lead}</p>
            <div className="zhaowu-method-generated-grid">
              {result.sections.map((section, index) => (
                <article className="zhaowu-method-generated-card" key={`${section.title}-${index}`}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </article>
              ))}
            </div>
            {result.note ? <p className="zhaowu-method-generated-note">{result.note}</p> : null}
          </section>
        ) : null}

        <a href="/#bazi" className="zhaowu-method-birth-action">{birth ? cta.action : cta.add}</a>
      </section>
    </main>
  );
}
