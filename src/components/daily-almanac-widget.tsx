import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
const DAY_MS = 86_400_000;
const REFERENCE_UTC = Date.UTC(2024, 1, 10); // Verified 2024-02-10 甲辰 anchor; lightweight local-day cue only.

function ganzhiForDay(date: Date) {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = Math.round((utc - REFERENCE_UTC) / DAY_MS);
  const index = ((40 + offset) % 60 + 60) % 60;
  return `${STEMS[index % 10]}${BRANCHES[index % 12]}`;
}

function weekdayLabel(date: Date, locale: "zh-Hant" | "zh-Hans" | "en") {
  if (locale === "en") return new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(date);
  return ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][date.getDay()];
}

function monthDayLabel(date: Date, locale: "zh-Hant" | "zh-Hans" | "en") {
  if (locale === "en") return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long" }).format(date);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function useLocalDay() {
  const [now, setNow] = useState(() => new Date());
  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  useEffect(() => {
    const current = new Date();
    const next = new Date(current);
    next.setHours(24, 0, 0, 80);
    const timer = window.setTimeout(
      () => setNow(new Date()),
      Math.max(1_000, next.getTime() - current.getTime()),
    );
    return () => window.clearTimeout(timer);
  }, [dayKey]);

  return now;
}

export function DailyAlmanacWidget() {
  const { locale } = useI18n();
  const now = useLocalDay();
  const data = useMemo(() => {
    const day = ganzhiForDay(now);
    const branch = day[1];
    const lowEnergy = ["子", "丑", "亥", "未"].includes(branch);
    const highMotion = ["寅", "巳", "申", "午"].includes(branch);
    const tone = lowEnergy ? "low" : highMotion ? "motion" : "steady";

    const copy = locale === "en"
      ? {
          eyebrow: "TODAY · ALMANAC",
          title: `${weekdayLabel(now, locale)} · ${monthDayLabel(now, locale)}`,
          energy: lowEnergy ? "Lower" : highMotion ? "Active" : "Steady",
          energyLabel: "Today’s rhythm",
          headline: lowEnergy ? "Keep the day light and deliberate" : highMotion ? "Move, but do not scatter" : "Keep one clear centre",
          lead: lowEnergy ? "Protect your capacity first; fewer well-finished things are enough today." : highMotion ? "Momentum helps when it has a target. Finish before opening another front." : "A steady day works best when you keep priorities simple and leave some margin.",
          good: lowEnergy ? ["finish one important task", "eat on time", "tidy one small area"] : highMotion ? ["move one key task forward", "speak clearly", "finish before adding more"] : ["focus on the core task", "keep plans simple", "leave buffer time"],
          avoid: lowEnergy ? ["overcommitting", "late-night decisions", "absorbing other people’s urgency"] : highMotion ? ["starting too many things", "arguing from impulse", "rushing commitments"] : ["constant switching", "needless comparison", "overexplaining"],
          goodLabel: "Good for",
          avoidLabel: "Avoid",
          goodRoman: "YI",
          avoidRoman: "JI",
          foot: "Ask Zhaowu",
          note: `Day marker ${day} · a light daily rhythm cue based on your local date, not a substitute for a full BaZi reading or traditional date selection.`,
          dayMark: `${day} day · daily reference`,
        }
      : locale === "zh-Hans"
        ? {
            eyebrow: "今日黄历",
            title: `${weekdayLabel(now, locale)} · ${monthDayLabel(now, locale)}`,
            energy: lowEnergy ? "偏低" : highMotion ? "偏动" : "平稳",
            energyLabel: "今日能量",
            headline: lowEnergy ? "把今天过得轻一点、稳一点" : highMotion ? "可以推进，但不要把自己打散" : "守住一个中心就够了",
            lead: lowEnergy ? "先保护自己的容量，今天少做一点、做完整一点就够。" : highMotion ? "今天有推进力，但要给它一个明确方向；做完一件，再开下一件。" : "平稳的日子最适合把优先级收窄，也给自己留一点余量。",
            good: lowEnergy ? ["完成一件重要的事", "按时吃饭", "整理一个小区域"] : highMotion ? ["推进一个关键任务", "把话说清楚", "做完再加下一件"] : ["专注核心任务", "计划简单一点", "给自己留余量"],
            avoid: lowEnergy ? ["过度答应别人", "深夜做重大决定", "替别人承接焦虑"] : highMotion ? ["同时开太多任务", "冲动争辩", "匆忙承诺"] : ["反复切换任务", "无谓比较", "过度解释"],
            goodLabel: "宜",
            avoidLabel: "忌",
            goodRoman: "yí",
            avoidRoman: "jì",
            foot: "去问昭梧",
            note: `今日日柱提示 ${day} · 按你当地日期给轻量日节奏提示，不替代完整八字、流日或传统择日。`,
            dayMark: `${day}日 · 日常参考`,
          }
        : {
            eyebrow: "今日黃曆",
            title: `${weekdayLabel(now, locale)} · ${monthDayLabel(now, locale)}`,
            energy: lowEnergy ? "偏低" : highMotion ? "偏動" : "平穩",
            energyLabel: "今日能量",
            headline: lowEnergy ? "把今天過得輕一點、穩一點" : highMotion ? "可以推進，但不要把自己打散" : "守住一個中心就夠了",
            lead: lowEnergy ? "先保護自己的容量，今天少做一點、做完整一點就夠。" : highMotion ? "今天有推進力，但要給它一個明確方向；做完一件，再開下一件。" : "平穩的日子最適合把優先級收窄，也給自己留一點餘量。",
            good: lowEnergy ? ["完成一件重要的事", "按時吃飯", "整理一個小區域"] : highMotion ? ["推進一個關鍵任務", "把話說清楚", "做完再加下一件"] : ["專注核心任務", "計畫簡單一點", "給自己留餘量"],
            avoid: lowEnergy ? ["過度答應別人", "深夜做重大決定", "替別人承接焦慮"] : highMotion ? ["同時開太多任務", "衝動爭辯", "匆忙承諾"] : ["反覆切換任務", "無謂比較", "過度解釋"],
            goodLabel: "宜",
            avoidLabel: "忌",
            goodRoman: "yí",
            avoidRoman: "jì",
            foot: "去問昭梧",
            note: `今日日柱提示 ${day} · 按你當地日期給輕量日節奏提示，不替代完整八字、流日或傳統擇日。`,
            dayMark: `${day}日 · 日常參考`,
          };

    return { ...copy, tone };
  }, [locale, now]);

  return (
    <section id="daily-almanac" className="zhaowu-daily-almanac" data-tone={data.tone} aria-label={data.eyebrow}>
      <span className="zhaowu-daily-watermark" aria-hidden>{now.getDate()}</span>

      <div className="zhaowu-daily-top">
        <div>
          <p className="zhaowu-daily-eyebrow">{data.eyebrow}</p>
          <p className="zhaowu-daily-date">{data.title}</p>
        </div>
        <div className="zhaowu-daily-energy">
          <span>{data.energyLabel}</span>
          <strong>{data.energy}</strong>
        </div>
      </div>

      <div className="zhaowu-daily-main">
        <p className="zhaowu-daily-daymark">{data.dayMark}</p>
        <h2 className="zhaowu-daily-headline">{data.headline}</h2>
        <p className="zhaowu-daily-lead">{data.lead}</p>
      </div>

      <div className="zhaowu-daily-pairs">
        <section aria-label={data.goodLabel}>
          <p className="zhaowu-daily-pair-title"><small>{data.goodRoman}</small><b>{data.goodLabel}</b></p>
          <ul className="zhaowu-daily-list">{data.good.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section aria-label={data.avoidLabel}>
          <p className="zhaowu-daily-pair-title"><small>{data.avoidRoman}</small><b>{data.avoidLabel}</b></p>
          <ul className="zhaowu-daily-list">{data.avoid.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </div>

      <footer className="zhaowu-daily-footer">
        <p className="zhaowu-daily-note">{data.note}</p>
        <a className="zhaowu-daily-cta" href="#bazi" aria-label={data.foot}>
          <span>{data.foot}</span><b aria-hidden>→</b>
        </a>
      </footer>
    </section>
  );
}
