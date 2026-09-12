import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { stemElement } from "@/lib/element-colors";
import { galleryPublicUrl, listPublicGalleryAssets, type GalleryAsset } from "@/lib/gallery-assets";
import { isPublicAtlasAsset } from "@/lib/gallery-groups";
import { dayGanzhi, hourPillar, yearMonthPillars, lunarDateLabel, toLunar } from "@/lib/bazi/calendar";

const PILLAR_KEYS = ["year", "month", "day", "hour"] as const;

function moonGlyph(date: Date) {
  const synodic = 29.53058867;
  const known = Date.UTC(2000, 0, 6, 18, 14, 0);
  const days = (date.getTime() - known) / 86400000;
  const age = ((days % synodic) + synodic) % synodic;
  if (age < 1.85 || age > 27.7) return "●";
  if (age < 7.4) return "◐";
  if (age < 22.1) return "○";
  return "◑";
}

function weekdayLabel(date: Date, locale: "zh-Hant" | "zh-Hans" | "en") {
  if (locale === "en") return new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(date);
  return ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][date.getDay()];
}

function monthDayLabel(date: Date, locale: "zh-Hant" | "zh-Hans" | "en") {
  if (locale === "en") return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long" }).format(date);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function timeLabel(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function lunarLabel(date: Date, locale: "zh-Hant" | "zh-Hans" | "en") {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (locale === "en") {
    const lunar = toLunar(year, month, day);
    if (!lunar) return new Intl.DateTimeFormat("en-AU", { year: "numeric", month: "short", day: "numeric" }).format(date);
    return `${lunar.isLeap ? "Leap lunar month" : "Lunar month"} ${lunar.month}, day ${lunar.day}`;
  }
  const label = lunarDateLabel(year, month, day);
  return locale === "zh-Hans" ? label.replace("農曆", "农历").replace("閏", "闰") : label;
}

function jieLabel(name: string, locale: "zh-Hant" | "zh-Hans" | "en") {
  const english: Record<string, string> = {
    立春: "Start of Spring", 驚蟄: "Awakening of Insects", 清明: "Clear and Bright", 立夏: "Start of Summer",
    芒種: "Grain in Ear", 小暑: "Minor Heat", 立秋: "Start of Autumn", 白露: "White Dew",
    寒露: "Cold Dew", 立冬: "Start of Winter", 大雪: "Major Snow", 小寒: "Minor Cold",
  };
  const hans: Record<string, string> = { 驚蟄: "惊蛰" };
  if (locale === "en") return english[name] ?? name;
  return locale === "zh-Hans" ? (hans[name] ?? name) : name;
}

function useLocalNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const SLIPS = {
  "zh-Hant": [
    ["靜心守中", "今日不必向外追太多答案。先把最重要的一件事守住，雜音自然會退。", "關係裡少猜一步，事情上慢半拍確認；你真正要保留的是自己的節奏。"],
    ["應緣而啟", "有些門不是硬推開的。今天適合看清哪一個回應是真正的邀請，再決定是否往前。", "先觀察、再靠近；有回聲的地方才值得投入更多心力。"],
    ["先定後行", "現在最重要的不是速度，而是把方向定清楚。方向一穩，後面的動作自然會快。", "涉及承諾、金錢或關係時，先確認核心條件，不要被一時情緒帶走。"],
    ["留白養氣", "今天的空白不是浪費，而是在替下一步保留判斷力。少安排一點，反而更容易抓到真正重要的訊號。", "把能量留給需要你親自決定的事，其餘能延後的就延後。"],
    ["順勢收心", "外面的事情可以很多，心裡只留一條主線。當你不再同時抓住所有答案，路會變清楚。", "今天宜完成、整理、回收；不宜為了證明自己而增加新的負擔。"],
  ],
  "zh-Hans": [
    ["静心守中", "今天不必向外追太多答案。先把最重要的一件事守住，杂音自然会退。", "关系里少猜一步，事情上慢半拍确认；你真正要保留的是自己的节奏。"],
    ["应缘而启", "有些门不是硬推开的。今天适合看清哪一个回应是真正的邀请，再决定是否往前。", "先观察、再靠近；有回声的地方才值得投入更多心力。"],
    ["先定后行", "现在最重要的不是速度，而是把方向定清楚。方向一稳，后面的动作自然会快。", "涉及承诺、金钱或关系时，先确认核心条件，不要被一时情绪带走。"],
    ["留白养气", "今天的空白不是浪费，而是在替下一步保留判断力。少安排一点，反而更容易抓到真正重要的讯号。", "把能量留给需要你亲自决定的事，其余能延后的就延后。"],
    ["顺势收心", "外面的事情可以很多，心里只留一条主线。当你不再同时抓住所有答案，路会变清楚。", "今天宜完成、整理、回收；不宜为了证明自己而增加新的负担。"],
  ],
  en: [
    ["Hold Your Centre", "You do not need more answers today. Protect the one thing that matters most and let the noise fall away.", "In relationships, guess less. In decisions, confirm first. Keep your own pace."],
    ["Open With Response", "Some doors are not meant to be forced. Notice what is genuinely responding to you before you invest more.", "Observe first, then move closer. Put energy where there is a real answer back."],
    ["Set Direction First", "Speed is not the priority today. Once the direction is clear, movement becomes much easier.", "For money, commitments or relationships, confirm the core conditions before acting on emotion."],
    ["Leave Some Space", "Empty space is useful today. Doing slightly less can preserve the judgement you need for the next move.", "Keep your capacity for decisions only you can make; postpone what does not need to happen now."],
    ["Gather Your Focus", "There can be many things outside you while you keep only one main line inside. Clarity comes from not gripping every answer at once.", "Finish, organise and close loops today. Do not add weight just to prove something."],
  ],
} as const;

export function DailyAlmanacWidget() {
  const { locale } = useI18n();
  const now = useLocalNow();
  const [slipOpen, setSlipOpen] = useState(false);
  const [asset, setAsset] = useState<GalleryAsset | null>(null);
  const [loadingSlip, setLoadingSlip] = useState(false);

  const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const pillars = useMemo(() => {
    const day = dayGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const ym = yearMonthPillars(now);
    return {
      year: ym.year,
      month: ym.month,
      day,
      hour: hourPillar(day, now.getHours()),
      jieName: ym.jieName,
    };
  }, [dayKey, now.getHours()]);

  const data = useMemo(() => {
    const day = pillars.day;
    const branch = day[1];
    const lowEnergy = ["子", "丑", "亥", "未"].includes(branch);
    const highMotion = ["寅", "巳", "申", "午"].includes(branch);
    const tone = lowEnergy ? "low" : highMotion ? "motion" : "steady";
    const four = `${pillars.year} · ${pillars.month} · ${pillars.day} · ${pillars.hour}`;
    const copy = locale === "en" ? {
      eyebrow: "TODAY · FOUR PILLARS", title: `${weekdayLabel(now, locale)} · ${monthDayLabel(now, locale)}`,
      energy: lowEnergy ? "Lower" : highMotion ? "Active" : "Steady", energyLabel: "Today’s rhythm",
      headline: lowEnergy ? "Conserve your attention and finish calmly" : highMotion ? "Choose a direction before you move" : "Move forward with a steady centre",
      lead: lowEnergy ? "Keep some capacity in reserve. Fewer well-finished things are enough today." : highMotion ? "There is momentum today; give it one clear direction and finish in sequence." : "The rhythm is steady. Narrow the priority list and leave room for the unexpected.",
      good: lowEnergy ? ["finish one important task", "eat on time", "tidy one small area"] : highMotion ? ["move one key task forward", "speak clearly", "finish before adding more"] : ["focus on the core task", "keep plans simple", "leave buffer time"],
      avoid: lowEnergy ? ["overcommitting", "late-night decisions", "absorbing other people’s urgency"] : highMotion ? ["starting too many things", "arguing from impulse", "rushing commitments"] : ["constant switching", "needless comparison", "overexplaining"],
      goodLabel: "Good for", avoidLabel: "Avoid", goodRoman: "YI", avoidRoman: "JI", foot: "Daily spirit slip",
      note: `${four} · Current solar-term month: ${jieLabel(pillars.jieName, locale)}.`, dayMark: `${pillars.day} day · ${timeLabel(now)}`,
      dateNum: String(now.getDate()), weekday: weekdayLabel(now, locale), monthDay: monthDayLabel(now, locale),
      lunar: lunarLabel(now, locale),
      moon: moonGlyph(now), detailsLabelClosed: "Today's guidance",
      pillarLabels: ["YEAR", "MONTH", "DAY", "HOUR"],
      detailsLabel: "View today’s pillars & guidance",
      slipTitle: "Today’s Spirit Slip", basis: "Today’s rhythm", close: "Close",
    } : locale === "zh-Hans" ? {
      eyebrow: "今日干支", title: `${weekdayLabel(now, locale)} · ${monthDayLabel(now, locale)}`,
      energy: lowEnergy ? "偏低" : highMotion ? "偏动" : "平稳", energyLabel: "今日节奏",
      headline: lowEnergy ? "宜收敛心力，从容完成" : highMotion ? "宜定向而行，不宜分散" : "守中有序，从容推进",
      lead: lowEnergy ? "先保留心力，宁可少做，也要把重要的事完整收好。" : highMotion ? "今日有推进之势，先定方向，再逐项完成。" : "节奏平稳，适合收窄优先次序，为临时变化留下余地。",
      good: lowEnergy ? ["完成一件重要的事", "按时吃饭", "整理一个小区域"] : highMotion ? ["推进一个关键任务", "把话说清楚", "做完再加下一件"] : ["专注核心任务", "计划简单一点", "给自己留余量"],
      avoid: lowEnergy ? ["过度答应别人", "深夜做重大决定", "替别人承接焦虑"] : highMotion ? ["同时开太多任务", "冲动争辩", "勿忙承诺"] : ["反复切换任务", "无谓比较", "过度解释"],
      goodLabel: "宜", avoidLabel: "忌", goodRoman: "", avoidRoman: "", foot: "今日灵签",
      note: `${four} · 当前节令：${jieLabel(pillars.jieName, locale)}。`, dayMark: `${pillars.day}日 · ${timeLabel(now)}`,
      dateNum: String(now.getDate()), weekday: weekdayLabel(now, locale), monthDay: monthDayLabel(now, locale),
      lunar: lunarLabel(now, locale),
      moon: moonGlyph(now), detailsLabelClosed: "今日指引",
      pillarLabels: ["年", "月", "日", "时"],
      detailsLabel: "展开今日干支与宜忌",
      slipTitle: "今日灵签", basis: "今日节奏", close: "收起",
    } : {
      eyebrow: "今日干支", title: `${weekdayLabel(now, locale)} · ${monthDayLabel(now, locale)}`,
      energy: lowEnergy ? "偏低" : highMotion ? "偏動" : "平穩", energyLabel: "今日節奏",
      headline: lowEnergy ? "宜收斂心力，從容完成" : highMotion ? "宜定向而行，不宜分散" : "守中有序，從容推進",
      lead: lowEnergy ? "先保留心力，寧可少做，也要把重要的事完整收好。" : highMotion ? "今日有推進之勢，先定方向，再逐項完成。" : "節奏平穩，適合收窄優先次序，為臨時變化留下餘地。",
      good: lowEnergy ? ["完成一件重要的事", "按時吃飯", "整理一個小區域"] : highMotion ? ["推進一個關鍵任務", "把話說清楚", "做完再加下一件"] : ["專注核心任務", "計畫簡單一點", "給自己留餘量"],
      avoid: lowEnergy ? ["過度答應別人", "深夜做重大決定", "替別人承接焦慮"] : highMotion ? ["同時開太多任務", "衝動爭辯", "勿忙承諾"] : ["反覆切換任務", "無謂比較", "過度解釋"],
      goodLabel: "宜", avoidLabel: "忌", goodRoman: "", avoidRoman: "", foot: "今日靈籤",
      note: `${four} · 當前節令：${jieLabel(pillars.jieName, locale)}。`, dayMark: `${pillars.day}日 · ${timeLabel(now)}`,
      dateNum: String(now.getDate()), weekday: weekdayLabel(now, locale), monthDay: monthDayLabel(now, locale),
      lunar: lunarLabel(now, locale),
      moon: moonGlyph(now), detailsLabelClosed: "今日指引",
      pillarLabels: ["年", "月", "日", "時"],
      detailsLabel: "展開今日干支與宜忌",
      slipTitle: "今日靈籤", basis: "今日節奏", close: "收起",
    };
    return { ...copy, tone, day };
  }, [locale, now, pillars]);

  const slip = useMemo(() => {
    const seed = stableHash(`${dayKey}|daily-spirit-slip`);
    return SLIPS[locale][seed % SLIPS[locale].length];
  }, [dayKey, locale]);

  async function drawSlip() {
    setLoadingSlip(true);
    setSlipOpen(true);
    try {
      if (!asset) {
        try {
          const rows = (await listPublicGalleryAssets("visual-library")).filter(isPublicAtlasAsset);
          if (rows.length) {
            const seed = stableHash(`${dayKey}|daily-spirit-slip|image`);
            setAsset(rows[seed % rows.length]);
          }
        } catch {
          // The public image is optional; the daily guidance must remain readable.
        }
      }
    } finally {
      setLoadingSlip(false);
    }
  }

  const values = [pillars.year, pillars.month, pillars.day, pillars.hour];

  return (
    <>
      <section id="daily-almanac" className="zhaowu-daily-almanac" data-tone={data.tone} aria-label={data.eyebrow}>
        <span className="zhaowu-daily-watermark" aria-hidden>{now.getDate()}</span>
        <div className="zhaowu-daily-top">
          <div className="zhaowu-daily-dateblock">
            <p className="zhaowu-daily-eyebrow">{data.eyebrow}</p>
            <p className="zhaowu-daily-dom">{data.dateNum}</p>
            <p className="zhaowu-daily-weekday">{data.weekday}</p>
            <p className="zhaowu-daily-md">{data.monthDay}</p>
          </div>
          <div className="zhaowu-daily-energy"><span>{data.energyLabel}</span><strong>{data.energy}</strong><em>{data.headline}</em></div>
        </div>
        <div className="zhaowu-daily-pillars" aria-label={locale === "en" ? "Current Four Pillars" : "當下年月日時干支"}>
          {values.map((value, index) => (
            <div className="zhaowu-daily-pillar" data-pillar={PILLAR_KEYS[index]} data-element={stemElement(value[0]) ?? undefined} key={`${data.pillarLabels[index]}-${value}`}>
              <strong><b>{value[0]}</b><i>{value[1]}</i></strong>
              <span>{data.pillarLabels[index]}</span>
            </div>
          ))}
        </div>
        <p className="zhaowu-daily-meta">{data.lunar}　｜　{locale === "en" ? "Moon" : locale === "zh-Hans" ? "月相" : "月相"} {data.moon}　｜　{locale === "en" ? "Solar term" : locale === "zh-Hans" ? "节令" : "節令"} {jieLabel(pillars.jieName, locale)}</p>
        <details className="zhaowu-daily-details">
          <summary><span>{data.detailsLabelClosed}</span><b aria-hidden>＋</b></summary>
          <div className="zhaowu-daily-details-body">
            <div className="zhaowu-daily-term"><span>{locale === "en" ? "Solar term" : locale === "zh-Hans" ? "节令" : "節令"}</span><b>{jieLabel(pillars.jieName, locale)}</b></div>
            <p className="zhaowu-daily-lead">{data.lead}</p>
            <div className="zhaowu-daily-pairs"><section aria-label={data.goodLabel}><p className="zhaowu-daily-pair-title"><small>{data.goodRoman}</small><b>{data.goodLabel}</b></p><ul className="zhaowu-daily-list">{data.good.map((item) => <li key={item}>{item}</li>)}</ul></section><section aria-label={data.avoidLabel}><p className="zhaowu-daily-pair-title"><small>{data.avoidRoman}</small><b>{data.avoidLabel}</b></p><ul className="zhaowu-daily-list">{data.avoid.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
            <footer className="zhaowu-daily-footer"><button type="button" className="zhaowu-daily-cta" onClick={() => void drawSlip()} disabled={loadingSlip} aria-label={data.foot}><span>{loadingSlip ? "…" : data.foot}</span><b aria-hidden>→</b></button></footer>
          </div>
        </details>
      </section>

      {slipOpen ? (
        <section className="zhaowu-spirit-slip" aria-label={data.slipTitle}>
          <button type="button" className="zhaowu-spirit-slip-close" onClick={() => setSlipOpen(false)} aria-label={data.close}>×</button>
          {asset ? <figure className="zhaowu-spirit-slip-art"><img src={galleryPublicUrl(asset.storage_path, asset.bucket_id)} alt={asset.title || data.slipTitle} /></figure> : <div className="zhaowu-spirit-slip-art is-empty" aria-hidden>昭梧</div>}
          <p className="zhaowu-spirit-slip-kicker"><img className="zhaowu-spirit-slip-gourd" src="/brand-ui/mark-gourd.svg" alt="" width={28} height={28} decoding="async" />{data.slipTitle}</p>
          <h2>{slip[0]}</h2>
          <div className="zhaowu-spirit-slip-copy"><p><strong>{slip[1]}</strong></p><p>{slip[2]}</p></div>
          <div className="zhaowu-spirit-slip-rule" aria-hidden />
          <p className="zhaowu-spirit-slip-basis">{data.basis} · {data.day}</p>
          <p className="zhaowu-spirit-slip-mark">{locale === "en" ? "STONE ORIGINAL" : locale === "zh-Hans" ? "STONE 原创" : "STONE 原創"}</p>
        </section>
      ) : null}
    </>
  );
}
