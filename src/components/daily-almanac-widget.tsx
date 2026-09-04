import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
const DAY_MS = 86_400_000;
const REFERENCE_UTC = Date.UTC(2024, 1, 10); // 2024-02-10 treated as 甲辰 day anchor for lightweight daily rhythm only.

function ganzhiForDay(date: Date) {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = Math.round((utc - REFERENCE_UTC) / DAY_MS);
  const index = ((40 + offset) % 60 + 60) % 60;
  return `${STEMS[index % 10]}${BRANCHES[index % 12]}`;
}

function weekdayLabel(date: Date, locale: "zh-Hant" | "zh-Hans" | "en") {
  if (locale === "en") return new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(date);
  const labels = locale === "zh-Hant" ? ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"] : ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return labels[date.getDay()];
}

function monthDayLabel(date: Date, locale: "zh-Hant" | "zh-Hans" | "en") {
  if (locale === "en") return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long" }).format(date);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function DailyAlmanacWidget() {
  const { locale } = useI18n();
  const data = useMemo(() => {
    const now = new Date();
    const day = ganzhiForDay(now);
    const branch = day[1];
    const lowEnergy = ["子", "丑", "亥", "未"].includes(branch);
    const highMotion = ["寅", "巳", "申", "午"].includes(branch);

    const copy = locale === "en"
      ? {
          eyebrow: "TODAY · ALMANAC",
          title: `${weekdayLabel(now, locale)} · ${monthDayLabel(now, locale)}`,
          energy: lowEnergy ? "Lower" : highMotion ? "Active" : "Steady",
          energyLabel: "Today’s rhythm",
          headline: lowEnergy ? "Keep the day light and deliberate" : highMotion ? "Move, but do not scatter" : "Keep one clear centre",
          good: lowEnergy ? ["finish one important task", "eat on time", "tidy one small area"] : highMotion ? ["move one key task forward", "speak clearly", "finish before adding more"] : ["focus on the core task", "keep plans simple", "leave buffer time"],
          avoid: lowEnergy ? ["overcommitting", "late-night decisions", "absorbing other people’s urgency"] : highMotion ? ["starting too many things", "arguing from impulse", "rushing commitments"] : ["constant switching", "needless comparison", "overexplaining"],
          goodLabel: "Good for",
          avoidLabel: "Avoid",
          foot: "Daily guide",
          note: `Day marker ${day} · use this as a light daily rhythm cue, not as a substitute for a full BaZi reading.`,
        }
      : locale === "zh-Hans"
        ? {
            eyebrow: "今日黄历",
            title: `${weekdayLabel(now, locale)} · ${monthDayLabel(now, locale)}`,
            energy: lowEnergy ? "偏低" : highMotion ? "偏动" : "平稳",
            energyLabel: "今日能量",
            headline: lowEnergy ? "把今天过得轻一点、稳一点" : highMotion ? "可以推进，但不要把自己打散" : "守住一个中心就够了",
            good: lowEnergy ? ["完成一件重要的事", "按时吃饭", "整理一个小区域"] : highMotion ? ["推进一个关键任务", "把话说清楚", "做完再加下一件"] : ["专注核心任务", "计划简单一点", "给自己留余量"],
            avoid: lowEnergy ? ["过度答应别人", "深夜做重大决定", "替别人承接焦虑"] : highMotion ? ["同时开太多任务", "冲动争辩", "匆忙承诺"] : ["反复切换任务", "无谓比较", "过度解释"],
            goodLabel: "宜",
            avoidLabel: "忌",
            foot: "获取每日指引",
            note: `今日日柱提示 ${day} · 这里只做轻量日节奏提示，不替代完整八字分析。`,
          }
        : {
            eyebrow: "今日黃曆",
            title: `${weekdayLabel(now, locale)} · ${monthDayLabel(now, locale)}`,
            energy: lowEnergy ? "偏低" : highMotion ? "偏動" : "平穩",
            energyLabel: "今日能量",
            headline: lowEnergy ? "把今天過得輕一點、穩一點" : highMotion ? "可以推進，但不要把自己打散" : "守住一個中心就夠了",
            good: lowEnergy ? ["完成一件重要的事", "按時吃飯", "整理一個小區域"] : highMotion ? ["推進一個關鍵任務", "把話說清楚", "做完再加下一件"] : ["專注核心任務", "計畫簡單一點", "給自己留餘量"],
            avoid: lowEnergy ? ["過度答應別人", "深夜做重大決定", "替別人承接焦慮"] : highMotion ? ["同時開太多任務", "衝動爭辯", "匆忙承諾"] : ["反覆切換任務", "無謂比較", "過度解釋"],
            goodLabel: "宜",
            avoidLabel: "忌",
            foot: "獲取每日指引",
            note: `今日日柱提示 ${day} · 這裡只做輕量日節奏提示，不替代完整八字分析。`,
          };
    return copy;
  }, [locale]);

  return (
    <section className="rounded-[2rem] border border-line/70 bg-[linear-gradient(135deg,rgba(255,255,255,.94),rgba(233,222,204,.84)_42%,rgba(218,226,213,.92))] px-5 py-5 shadow-[0_18px_45px_rgba(70,55,38,.10)]" aria-label={data.eyebrow}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium tracking-[0.22em] text-cinnabar">{data.eyebrow}</p>
          <h2 className="mt-1 font-display text-xl text-ink">{data.title}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-mute">{data.energyLabel}</p>
          <p className="mt-1 font-display text-xl text-ink">{data.energy}</p>
        </div>
      </div>

      <h3 className="mt-6 font-display text-2xl leading-10 text-ink">{data.headline}</h3>

      <div className="mt-7 grid grid-cols-2 gap-5 border-t border-line/60 pt-5">
        <div>
          <p className="font-display text-2xl text-ink">{data.goodLabel}</p>
          <div className="mt-2 space-y-1 text-sm leading-6 text-ink-soft">
            {data.good.map((item) => <p key={item}>{item}</p>)}
          </div>
        </div>
        <div>
          <p className="font-display text-2xl text-ink">{data.avoidLabel}</p>
          <div className="mt-2 space-y-1 text-sm leading-6 text-ink-soft">
            {data.avoid.map((item) => <p key={item}>{item}</p>)}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-line/60 pt-4">
        <p className="text-xs leading-5 text-ink-mute">{data.note}</p>
        <span className="shrink-0 rounded-full border border-white/80 bg-white/55 px-3 py-2 text-xs text-ink-soft">{data.foot} →</span>
      </div>
    </section>
  );
}
